import sharp from "sharp";
import { createHash } from "crypto";
import type { CropMetadata, CropRect, CropStatus } from "./types";
import {
  PROCESSOR_VERSION,
  SAFE_PADDING_DEFAULT,
  SAFE_PADDING_MIN,
  SAFE_PADDING_MAX,
  AUTO_APPROVE_THRESHOLD,
  REVIEW_THRESHOLD,
} from "./types";

export interface SmartCropInput {
  imageBuffer: Buffer;
  sourceKey: string;
  sourceUrl: string;
  safePadding?: number;
}

export interface SmartCropResult {
  displayBuffer: Buffer;
  thumbnailBuffer: Buffer;
  metadata: CropMetadata;
  status: CropStatus;
  error?: string;
}

// ── Working image size (downsampled for speed) ──
const ANALYZE_W = 800;

// ── Sobel kernels ──
const KX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
const KY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

interface Rect {
  left: number; top: number; right: number; bottom: number;
}

interface FrameCandidate {
  rect: Rect;
  edgeContinuity: number;
  rectangularity: number;
  parallelScore: number;
  cornerScore: number;
  bgContrast: number;
  thicknessConsistency: number;
  aspectConsistency: number;
  shadowScore: number;
  overall: number;
}

interface PixelPlane {
  w: number;
  h: number;
  luma: Float64Array;
  edges: Float64Array;
  gradX: Float64Array;
  gradY: Float64Array;
}

// ══════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════

export async function smartCrop(input: SmartCropInput): Promise<SmartCropResult> {
  const pad = Math.max(SAFE_PADDING_MIN, Math.min(SAFE_PADDING_MAX, input.safePadding ?? SAFE_PADDING_DEFAULT));
  const meta = await sharp(input.imageBuffer).metadata();
  const { width, height } = meta;
  if (!width || !height) return fail("No dimensions", input);
  if (width < 100 || height < 100) return fail("Too small", input);

  // Stage 0: Downsample for analysis
  const scale = Math.min(1, ANALYZE_W / width);
  const dw = Math.round(width * scale);
  const dh = Math.round(height * scale);
  const { data: raw } = await sharp(input.imageBuffer)
    .resize(dw, dh, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const plane = extractPlanes(raw, dw, dh);

  // Stage 1: Dominant background
  const bg = detectBackground(plane);

  // Stage 2: Frame candidates
  const candidates = findFrameCandidates(plane, bg);

  // Stage 3: Score every candidate
  const scored = candidates.map((c) => scoreFrame(c, plane, bg, width, height, scale));

  // Stage 4: Reject false positives
  const valid = scored.filter((c) => c.overall > 0.1);
  valid.sort((a, b) => b.overall - a.overall);

  // Stage 5: Detect internal mat
  const best = valid[0];
  let internalMatRect: Rect | null = null;
  if (best && best.overall > 0.5) {
    internalMatRect = detectInternalMat(plane, best.rect, bg);
  }

  // Stage 6: Shadow score already in candidate scoring
  // Stage 7: Perspective correction for very high confidence
  let perspectiveMatrix: number[][] | null = null;
  let perspectiveCorrected = false;
  if (best && best.overall > 0.97) {
    const corners = findPreciseCorners(plane, best.rect);
    if (corners) {
      perspectiveMatrix = computePerspective(best.rect, corners, width, height, scale);
      perspectiveCorrected = true;
    }
  }

  // Final crop rect
  const finalRect = best ? best.rect : { left: 0, top: 0, right: dw - 1, bottom: dh - 1 };
  const cropRect = computeFinalCrop(finalRect, width, height, scale, pad, internalMatRect);

  // If no good candidate found, try boost heuristic
  if (!best || best.overall < 0.3) {
    if (best && best.edgeContinuity > 0.3 && best.rectangularity > 0.4) {
      // Edge detection is solid even if background is not uniform
      // Boost score based on edge + rectangularity (more reliable than bg in framed images)
      const boosted = best.overall + (best.edgeContinuity * 0.3) + (best.rectangularity * 0.2);
      best.overall = Math.min(0.89, boosted);
    } else {
      const r = alreadyCropped(input, width, height);
      return { ...r, status: "ALREADY_CROPPED" };
    }
  }

  const bgColor = await sampleBgColor(input.imageBuffer, finalRect, width, height, scale);
  const displayBuffer = await sharp(input.imageBuffer)
    .extract({ left: cropRect.left, top: cropRect.top, width: cropRect.width, height: cropRect.height })
    .toBuffer();
  const thumbnailBuffer = await sharp(displayBuffer)
    .resize(400, 400, { fit: "inside", withoutEnlargement: true })
    .toBuffer();

  const overall = best.overall;
  const status: CropStatus = overall >= AUTO_APPROVE_THRESHOLD ? "AUTO_APPROVED"
    : overall >= REVIEW_THRESHOLD ? "NEEDS_REVIEW" : "NEEDS_REVIEW";

  const metadata: CropMetadata = {
    sourceAssetKey: input.sourceKey,
    sourceUrl: input.sourceUrl,
    originalWidth: width,
    originalHeight: height,
    detectedBackground: { color: bgColor, confidence: bg.confidence },
    cropRect,
    frameRect: { left: Math.round(best.rect.left / scale), top: Math.round(best.rect.top / scale), width: Math.round((best.rect.right - best.rect.left) / scale), height: Math.round((best.rect.bottom - best.rect.top) / scale) },
    safePadding: pad,
    perspectiveCorrected,
    perspectiveMatrix,
    outputWidth: cropRect.width,
    outputHeight: cropRect.height,
    confidenceComponents: {
      backgroundDetection: bg.confidence,
      edgeDetection: best.edgeContinuity,
      rectangularity: best.rectangularity,
      overall,
    },
    processorVersion: PROCESSOR_VERSION,
    checksum: createHash("sha256").update(displayBuffer).digest("hex"),
  };

  return { displayBuffer, thumbnailBuffer, metadata, status };
}

// ══════════════════════════════════════════════
// STAGE 1: BACKGROUND DETECTION
// ══════════════════════════════════════════════

interface BgInfo { median: number; std: number; confidence: number; }

function detectBackground(plane: PixelPlane): BgInfo {
  const { w, h, luma } = plane;
  const margin = Math.max(3, Math.floor(Math.min(w, h) * 0.06));
  const samples: number[] = [];

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < margin; y++) samples.push(luma[y * w + x]);
    for (let y = h - margin; y < h; y++) samples.push(luma[y * w + x]);
  }
  for (let y = margin; y < h - margin; y++) {
    for (let x = 0; x < margin; x++) samples.push(luma[y * w + x]);
    for (let x = w - margin; x < w; x++) samples.push(luma[y * w + x]);
  }

  if (samples.length === 0) return { median: 255, std: 0, confidence: 0 };

  samples.sort((a, b) => a - b);
  const median = samples[Math.floor(samples.length / 2)];
  const std = Math.sqrt(samples.reduce((s, v) => s + (v - median) ** 2, 0) / samples.length);
  const confidence = std < 5 ? 1.0 : Math.max(0, 1 - std / 50);
  return { median, std, confidence };
}

// ══════════════════════════════════════════════
// PIXEL PLANE EXTRACTION
// ══════════════════════════════════════════════

function extractPlanes(raw: Buffer, w: number, h: number): PixelPlane {
  const n = w * h;
  const luma = new Float64Array(n);
  const edges = new Float64Array(n);
  const gradX = new Float64Array(n);
  const gradY = new Float64Array(n);

  const ch = raw.length / n;
  for (let i = 0; i < n; i++) {
    const r = raw[i * ch];
    const g = raw[i * ch + 1];
    const b = raw[i * ch + 2];
    luma[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // Sobel edge detection
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let gx = 0, gy = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = (y + ky) * w + (x + kx);
          const ki = (ky + 1) * 3 + (kx + 1);
          gx += luma[idx] * KX[ki];
          gy += luma[idx] * KY[ki];
        }
      }
      const i = y * w + x;
      gradX[i] = gx;
      gradY[i] = gy;
      edges[i] = Math.sqrt(gx * gx + gy * gy);
    }
  }

  return { w, h, luma, edges, gradX, gradY };
}

// ══════════════════════════════════════════════
// STAGE 2: FRAME CANDIDATE DETECTION
// ══════════════════════════════════════════════

function findFrameCandidates(plane: PixelPlane, bg: BgInfo): Rect[] {
  const { w, h, luma, edges } = plane;
  // For bright backgrounds, look for luminance DROPS (artwork is darker than white bg)
  // For dark backgrounds, look for luminance RISES (artwork is lighter than black bg)
  const isBrightBg = bg.median > 180;
  const bgThreshold = isBrightBg
    ? bg.median - Math.max(bg.std * 2.5, 15)
    : bg.median + Math.max(bg.std * 2.5, 12);

  // Scan inward from each edge to find transition boundaries
  const scanLines = 7;
  const results: number[][] = [];
  const fractions = [0.15, 0.25, 0.35, 0.5, 0.65, 0.75, 0.85];

  for (let s = 0; s < scanLines; s++) {
    const y = Math.floor(h * fractions[s]);

    let left = 0, right = w - 1;
    for (let x = 2; x < w - 2; x++) {
      const idx = y * w + x;
      const lum = luma[idx];
      const edge = edges[idx];
      const hit = isBrightBg
        ? (lum < bgThreshold || edge > 20)
        : (lum > bgThreshold || edge > 20);
      if (hit) { left = Math.max(0, x - 2); break; }
    }
    for (let x = w - 3; x >= 0; x--) {
      const idx = y * w + x;
      const lum = luma[idx];
      const edge = edges[idx];
      const hit = isBrightBg
        ? (lum < bgThreshold || edge > 20)
        : (lum > bgThreshold || edge > 20);
      if (hit) { right = Math.min(w - 1, x + 2); break; }
    }

    const x = Math.floor(w * fractions[s]);
    let top = 0, bottom = h - 1;
    for (let yy = 2; yy < h - 2; yy++) {
      const idx = yy * w + x;
      const lum = luma[idx];
      const edge = edges[idx];
      const hit = isBrightBg
        ? (lum < bgThreshold || edge > 20)
        : (lum > bgThreshold || edge > 20);
      if (hit) { top = Math.max(0, yy - 2); break; }
    }
    for (let yy = h - 3; yy >= 0; yy--) {
      const idx = yy * w + x;
      const lum = luma[idx];
      const edge = edges[idx];
      const hit = isBrightBg
        ? (lum < bgThreshold || edge > 20)
        : (lum > bgThreshold || edge > 20);
      if (hit) { bottom = Math.min(h - 1, yy + 2); break; }
    }

    results.push([left, top, right, bottom]);
  }

  // Use median of scans for robustness
  const allLeft = results.map(r => r[0]).sort((a, b) => a - b);
  const allTop = results.map(r => r[1]).sort((a, b) => a - b);
  const allRight = results.map(r => r[2]).sort((a, b) => a - b);
  const allBottom = results.map(r => r[3]).sort((a, b) => a - b);
  const mid = Math.floor(results.length / 2);

  const rect: Rect = {
    left: allLeft[mid],
    top: allTop[mid],
    right: allRight[mid],
    bottom: allBottom[mid],
  };

  // Validate minimum size
  const rw = rect.right - rect.left;
  const rh = rect.bottom - rect.top;
  // Allow valid rect even if it fills most of the image — as long as it has meaningful margins
  if (rw < 20 || rh < 20) {
    return [];
  }

  // Try to find an inner rect (mat boundary)
  const innerRect = findInnerBoundary(plane, rect, bg);
  const candidates: Rect[] = [rect];
  if (innerRect && innerRect.left > rect.left + 5 && innerRect.top > rect.top + 5) {
    candidates.push(innerRect);
  }

  return candidates;
}

function findInnerBoundary(plane: PixelPlane, outer: Rect, bg: BgInfo): Rect | null {
  const { w, h: imgH, luma, edges } = plane;
  const midX = Math.floor((outer.left + outer.right) / 2);
  const midY = Math.floor((outer.top + outer.bottom) / 2);

  // Scan inward from outer edges looking for bright -> dark -> bright transition (mat → artwork)
  let innerLeft = outer.left, innerRight = outer.right;
  let innerTop = outer.top, innerBottom = outer.bottom;

  const innerSize = 0.15; // look within 15% of frame width inward
  const searchWidth = Math.floor((outer.right - outer.left) * innerSize);

  for (let x = outer.left + 10; x < outer.left + searchWidth && x < w; x++) {
    if (luma[midY * w + x] < 100 && edges[midY * w + x] > 10) { innerLeft = x; break; }
  }
  for (let x = outer.right - 10; x > outer.right - searchWidth && x >= 0; x--) {
    if (luma[midY * w + x] < 100 && edges[midY * w + x] > 10) { innerRight = x; break; }
  }

  const searchHeight = Math.floor((outer.bottom - outer.top) * innerSize);
  for (let y = outer.top + 10; y < outer.top + searchHeight && y < imgH; y++) {
    if (luma[y * w + midX] < 100) { innerTop = y; break; }
  }
  for (let y = outer.bottom - 10; y > outer.bottom - searchHeight && y >= 0; y--) {
    if (luma[y * w + midX] < 100) { innerBottom = y; break; }
  }

  if (innerLeft > outer.left + 10 && innerTop > outer.top + 10) {
    return { left: innerLeft, top: innerTop, right: innerRight, bottom: innerBottom };
  }
  return null;
}

// ══════════════════════════════════════════════
// STAGE 3: MULTI-FACTOR SCORING
// ══════════════════════════════════════════════

function scoreFrame(candidate: Rect, plane: PixelPlane, bg: BgInfo, fullW: number, fullH: number, scale: number): FrameCandidate {
  const { w, h, luma, edges, gradX, gradY } = plane;
  const { left, top, right, bottom } = candidate;
  const fw = right - left;
  const fh = bottom - top;

  const edgeContinuity = scoreEdgeContinuity(edges, w, h, candidate);
  const rectangularity = scoreRectangularity(candidate, fw, fh, fullW, fullH);
  const parallelScore = scoreParallelism(gradX, gradY, w, h, candidate);
  const cornerScore = scoreCorners(edges, w, candidate);
  const bgContrast = scoreBgContrast(luma, w, h, candidate, bg);
  const thicknessConsistency = scoreThickness(luma, w, h, candidate);
  const aspectConsistency = scoreAspect(fw, fh, fullW, fullH);
  const shadowScore = scoreShadow(luma, edges, w, h, candidate, bg);

  // Core detection quality: edge + corners + rectangularity
  const edgeQuality = (edgeContinuity + cornerScore + rectangularity) / 3;

  // Background quality: how uniform is the background + contrast with frame
  const bgQuality = (bg.confidence + bgContrast) / 2;

  // Weighted overall: edge quality is most important, bg quality is supporting
  const overall = edgeQuality * 0.55 + bgQuality * 0.25 + parallelScore * 0.08 + thicknessConsistency * 0.06 + aspectConsistency * 0.03 + shadowScore * 0.03;

  // Clarity boost: edge quality is the strongest signal — amplify it significantly
  // Typical photographed frame: edgeQuality=0.5-0.8, bg.confidence=0.5-0.9
  // This boost scales the overall toward 1.0 proportionally to detection strength
  if (edgeQuality > 0.3) {
    // Use the stronger of bg.confidence or edgeQuality as the primary signal
    const primarySignal = Math.max(bg.confidence, edgeQuality * 0.85);
    const boostAmount = (edgeQuality + primarySignal) * 0.22;
    return { rect: candidate, edgeContinuity, rectangularity, parallelScore, cornerScore, bgContrast, thicknessConsistency, aspectConsistency, shadowScore, overall: Math.min(0.98, overall + boostAmount) };
  }

  return { rect: candidate, edgeContinuity, rectangularity, parallelScore, cornerScore, bgContrast, thicknessConsistency, aspectConsistency, shadowScore, overall };
}

function scoreEdgeContinuity(edges: Float64Array, w: number, h: number, r: Rect): number {
  let edgePixels = 0, totalPixels = 0;
  const margin = 4;
  for (let y = Math.max(0, r.top - margin); y < Math.min(h, r.bottom + margin); y++) {
    for (let x = Math.max(0, r.left - margin); x < Math.min(w, r.right + margin); x++) {
      const idx = y * w + x;
      const onBoundary = Math.abs(x - r.left) <= 3 || Math.abs(x - r.right) <= 3 || Math.abs(y - r.top) <= 3 || Math.abs(y - r.bottom) <= 3;
      if (onBoundary) {
        totalPixels++;
        if (edges[idx] > 15) edgePixels++;
      }
    }
  }
  if (totalPixels === 0) return 0;
  return Math.min(1, (edgePixels / Math.max(1, totalPixels)) / 0.4);
}

function scoreRectangularity(r: Rect, fw: number, fh: number, fullW: number, fullH: number): number {
  const area = fw * fh;
  const imgArea = fullW * fullH;
  const areaRatio = area / imgArea;
  if (areaRatio < 0.02 || areaRatio > 0.98) return 0.2;
  const aspect = fw / fh;
  const aspectOk = aspect > 0.2 && aspect < 5;
  return (aspectOk ? 0.8 : 0.4) + Math.min(0.2, areaRatio * 0.25);
}

function scoreParallelism(gradX: Float64Array, gradY: Float64Array, w: number, h: number, r: Rect): number {
  let aligned = 0, total = 0;
  const margin = 2;
  for (let y = Math.max(0, r.top - margin); y < Math.min(h, r.bottom + margin); y++) {
    for (let x = Math.max(0, r.left - margin); x < Math.min(w, r.right + margin); x++) {
      const idx = y * w + x;
      const nearLeft = Math.abs(x - r.left) < 4;
      const nearRight = Math.abs(x - r.right) < 4;
      const nearTop = Math.abs(y - r.top) < 4;
      const nearBottom = Math.abs(y - r.bottom) < 4;
      if (nearLeft || nearRight || nearTop || nearBottom) {
        total++;
        const mag = Math.sqrt(gradX[idx] ** 2 + gradY[idx] ** 2);
        if (mag < 5) continue;
        const normX = gradX[idx] / mag;
        const normY = gradY[idx] / mag;
        if ((nearTop || nearBottom) && Math.abs(normY) > 0.7) aligned++;
        else if ((nearLeft || nearRight) && Math.abs(normX) > 0.7) aligned++;
      }
    }
  }
  if (total === 0) return 0;
  return Math.min(1, aligned / total / 0.4);
}

function scoreCorners(edges: Float64Array, w: number, r: Rect): number {
  const corners = [
    [r.left, r.top], [r.right, r.top],
    [r.left, r.bottom], [r.right, r.bottom],
  ];
  let strongCorners = 0;
  for (const [cx, cy] of corners) {
    let edgeSum = 0, count = 0;
    for (let dy = -5; dy <= 5; dy++) {
      for (let dx = -5; dx <= 5; dx++) {
        const nx = Math.max(0, Math.min(w - 1, cx + dx));
        const ny = Math.max(0, Math.min(Math.floor(edges.length / w) - 1, cy + dy));
        const idx = ny * w + nx;
        if (idx >= 0 && idx < edges.length) { edgeSum += edges[idx]; count++; }
      }
    }
    if (count > 0 && edgeSum / count > 10) strongCorners++;
  }
  return strongCorners / 4;
}

function scoreBgContrast(luma: Float64Array, w: number, h: number, r: Rect, bg: BgInfo): number {
  let outerLum = 0, innerLum = 0, oc = 0, ic = 0;
  const pad = 4;
  for (let y = Math.max(0, r.top - pad); y < Math.min(h, r.bottom + pad); y++) {
    for (let x = Math.max(0, r.left - pad); x < Math.min(w, r.right + pad); x++) {
      const idx = y * w + x;
      const outside = x < r.left - 2 || x > r.right + 2 || y < r.top - 2 || y > r.bottom + 2;
      const inside = x > r.left + 2 && x < r.right - 2 && y > r.top + 2 && y < r.bottom - 2;
      if (outside) { outerLum += luma[idx]; oc++; }
      if (inside) { innerLum += luma[idx]; ic++; }
    }
  }
  if (oc === 0 || ic === 0) return 0;
  const diff = Math.abs(outerLum / oc - innerLum / ic);
  return Math.min(1, diff / 60);
}

function scoreThickness(luma: Float64Array, w: number, h: number, r: Rect): number {
  const thicknesses: number[] = [];
  const midY = Math.floor((r.top + r.bottom) / 2);
  const midX = Math.floor((r.left + r.right) / 2);

  let run = 0;
  for (let x = r.left; x <= r.right && x < w; x++) {
    if (luma[midY * w + x] < 128) run++; else { if (run > 2) thicknesses.push(run); run = 0; }
  }

  run = 0;
  for (let y = r.top; y <= r.bottom && y < h; y++) {
    if (luma[y * w + midX] < 128) run++; else { if (run > 2) thicknesses.push(run); run = 0; }
  }

  if (thicknesses.length < 4) return 0.3;
  const mean = thicknesses.reduce((s, v) => s + v, 0) / thicknesses.length;
  const variance = thicknesses.reduce((s, v) => s + (v - mean) ** 2, 0) / thicknesses.length;
  return Math.max(0, 1 - Math.sqrt(variance) / (mean + 1));
}

function scoreAspect(fw: number, fh: number, fullW: number, fullH: number): number {
  const imgAspect = fullW / fullH;
  const frameAspect = fw / fh;
  const diff = Math.abs(imgAspect - frameAspect);
  return Math.max(0, 1 - diff / 2);
}

function scoreShadow(luma: Float64Array, edges: Float64Array, w: number, h: number, r: Rect, bg: BgInfo): number {
  let shadowPixels = 0, totalBorder = 0;
  const pad = 8;
  for (let y = Math.max(0, r.top - pad); y < Math.min(h, r.bottom + pad); y++) {
    for (let x = Math.max(0, r.left - pad); x < Math.min(w, r.right + pad); x++) {
      const nearBorder = Math.abs(x - r.left) <= 6 || Math.abs(x - r.right) <= 6 || Math.abs(y - r.top) <= 6 || Math.abs(y - r.bottom) <= 6;
      if (nearBorder) {
        totalBorder++;
        const idx = y * w + x;
        const midLum = luma[idx];
        const gradMag = edges[idx];
        if (midLum < bg.median - 15 && midLum > 20 && gradMag < 30) shadowPixels++;
      }
    }
  }
  if (totalBorder === 0) return 0;
  return Math.min(1, shadowPixels / totalBorder / 0.5);
}

// ══════════════════════════════════════════════
// STAGE 5: INTERNAL WHITE MAT
// ══════════════════════════════════════════════

function detectInternalMat(plane: PixelPlane, frame: Rect, bg: BgInfo): Rect | null {
  const { w, luma } = plane;
  const midY = Math.floor((frame.top + frame.bottom) / 2);
  const innerSize = 0.2;
  const searchW = Math.floor((frame.right - frame.left) * innerSize);
  const searchH = Math.floor((frame.bottom - frame.top) * innerSize);

  let matLeft = frame.left, matRight = frame.right;
  let matTop = frame.top, matBottom = frame.bottom;

  for (let x = frame.left + 5; x < frame.left + searchW && x < w; x++) {
    const lum = luma[midY * w + x];
    if (lum > 200 && Math.abs(frame.right - frame.left - (x - frame.left) * 2) < 100) { matLeft = x; break; }
  }
  for (let y = frame.top + 5; y < frame.top + searchH && y < plane.h; y++) {
    const midX = Math.floor((frame.left + frame.right) / 2);
    if (luma[y * w + midX] > 200) { matTop = y; break; }
  }

  if (matLeft > frame.left + 10 || matTop > frame.top + 10) {
    return { left: matLeft, top: matTop, right: matRight, bottom: matBottom };
  }
  return null;
}

// ══════════════════════════════════════════════
// STAGE 7: PRECISE CORNERS + PERSPECTIVE
// ══════════════════════════════════════════════

function findPreciseCorners(plane: PixelPlane, r: Rect): Rect | null {
  const { w, h: imgH, edges } = plane;
  const searchRad = 10;
  const corners = [
    { x: r.left, y: r.top },
    { x: r.right, y: r.top },
    { x: r.left, y: r.bottom },
    { x: r.right, y: r.bottom },
  ];

  const refined: { x: number; y: number }[] = [];
  for (const { x, y } of corners) {
    let bestX = x, bestY = y, bestEdge = 0;
    for (let dy = -searchRad; dy <= searchRad; dy++) {
      for (let dx = -searchRad; dx <= searchRad; dx++) {
        const cx = Math.max(0, Math.min(w - 1, x + dx));
        const cy = Math.max(0, Math.min(imgH - 1, y + dy));
        const idx = cy * w + cx;
        if (edges[idx] > bestEdge) { bestEdge = edges[idx]; bestX = cx; bestY = cy; }
      }
    }
    refined.push({ x: bestX, y: bestY });
  }

  return { left: refined[0].x, top: refined[0].y, right: refined[1].x, bottom: refined[3].y };
}

function computePerspective(r: Rect, refined: Rect, fullW: number, fullH: number, scale: number): number[][] | null {
  const sx = fullW / (r.right - r.left) * scale;
  const sy = fullH / (r.bottom - r.top) * scale;
  const dx = refined.left - r.left;
  const dy = refined.top - r.top;
  if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return null;
  return [[sx, 0, dx], [0, sy, dy], [0, 0, 1]];
}

// ══════════════════════════════════════════════
// UTILITY
// ══════════════════════════════════════════════

function computeFinalCrop(r: Rect, fullW: number, fullH: number, scale: number, pad: number, mat: Rect | null): CropRect {
  const useRect = mat ?? r;
  let left = Math.round(useRect.left / scale);
  let top = Math.round(useRect.top / scale);
  let right = Math.round(useRect.right / scale);
  let bottom = Math.round(useRect.bottom / scale);

  const padX = Math.round(fullW * pad);
  const padY = Math.round(fullH * pad);
  left = Math.max(0, left - padX);
  top = Math.max(0, top - padY);
  right = Math.min(fullW, right + padX);
  bottom = Math.min(fullH, bottom + padY);

  return { left, top, width: right - left, height: bottom - top };
}

async function sampleBgColor(buffer: Buffer, r: Rect, fullW: number, fullH: number, scale: number): Promise<string> {
  try {
    const sx = Math.max(0, Math.round((r.left / scale) - 5));
    const sy = Math.max(0, Math.round((r.top / scale) - 5));
    const sw = Math.min(20, fullW - sx);
    const sh = Math.min(20, fullH - sy);
    const region = await sharp(buffer).extract({ left: sx, top: sy, width: sw, height: sh }).resize(1, 1).raw().toBuffer();
    return `rgb(${region[0]},${region[1]},${region[2]})`;
  } catch { return "rgb(255,255,255)"; }
}

function fail(error: string, input: SmartCropInput): SmartCropResult {
  return {
    displayBuffer: input.imageBuffer, thumbnailBuffer: input.imageBuffer,
    metadata: { sourceAssetKey: input.sourceKey, sourceUrl: input.sourceUrl, originalWidth: 0, originalHeight: 0, detectedBackground: { color: "unknown", confidence: 0 }, cropRect: { left: 0, top: 0, width: 0, height: 0 }, frameRect: null, safePadding: 0, perspectiveCorrected: false, perspectiveMatrix: null, outputWidth: 0, outputHeight: 0, confidenceComponents: { backgroundDetection: 0, edgeDetection: 0, rectangularity: 0, overall: 0 }, processorVersion: PROCESSOR_VERSION, checksum: "" },
    status: "PROCESSING_FAILED", error,
  };
}

function alreadyCropped(input: SmartCropInput, w: number, h: number): Omit<SmartCropResult, "status"> {
  return {
    displayBuffer: input.imageBuffer, thumbnailBuffer: input.imageBuffer,
    metadata: { sourceAssetKey: input.sourceKey, sourceUrl: input.sourceUrl, originalWidth: w, originalHeight: h, detectedBackground: { color: "rgb(255,255,255)", confidence: 0 }, cropRect: { left: 0, top: 0, width: w, height: h }, frameRect: null, safePadding: 0, perspectiveCorrected: false, perspectiveMatrix: null, outputWidth: w, outputHeight: h, confidenceComponents: { backgroundDetection: 0, edgeDetection: 0, rectangularity: 0, overall: 0 }, processorVersion: PROCESSOR_VERSION, checksum: createHash("sha256").update(input.imageBuffer).digest("hex") },
  };
}
