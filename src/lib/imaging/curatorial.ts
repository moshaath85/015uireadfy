import sharp from "sharp";

export interface CuratorialReport {
  hasFrame: boolean;
  frameColor: string | null;
  frameWidth: number | null; // percentage of image
  hasInternalMat: boolean;
  matColor: string | null;
  matWidth: number | null;
  visualComplexity: number; // 0-1
  symmetryScore: number; // 0-1
  negativeSpace: number; // 0-1
  compositionType: string;
  visualWeight: { x: number; y: number }; // center of visual mass (0-1 normalized)
  primaryMedium: string | null;
  visualPeriod: string | null;
}

interface ConfidenceMap { [key: string]: number; }

export async function analyzeCuratorial(buffer: Buffer, colorData: { dominantColors: { hex: string; rgb: number[]; hsl?: number[]; frequency: number; name: string }[] }): Promise<CuratorialReport & { confidence: ConfidenceMap }> {
  const meta = await sharp(buffer).metadata();
  const w = meta.width ?? 800;
  const h = meta.height ?? 600;
  const maxDim = 300;
  const scale = Math.min(1, maxDim / Math.max(w, h));
  const dw = Math.round(w * scale);
  const dh = Math.round(h * scale);

  const { data } = await sharp(buffer).resize(dw, dh).raw().toBuffer({ resolveWithObject: true });

  // ── Visual complexity: edge density ──
  let edgePixels = 0;
  for (let y = 2; y < dh - 2; y++) {
    for (let x = 2; x < dw - 2; x++) {
      const c = (y * dw + x) * 3;
      const n = ((y - 1) * dw + x) * 3;
      const s = ((y + 1) * dw + x) * 3;
      const e = (y * dw + (x + 1)) * 3;
      const w2 = (y * dw + (x - 1)) * 3;
      const diff = Math.abs(data[c] - data[n]) + Math.abs(data[c] - data[s]) +
        Math.abs(data[c] - data[e]) + Math.abs(data[c] - data[w2]);
      if (diff > 60) edgePixels++;
    }
  }
  const visualComplexity = Math.min(1, edgePixels / (dw * dh) / 0.3);

  // ── Symmetry: compare left vs right flipped ──
  let symDiff = 0, symCount = 0;
  const midX = Math.floor(dw / 2);
  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < midX; x++) {
      const leftIdx = (y * dw + x) * 3;
      const rightIdx = (y * dw + (dw - 1 - x)) * 3;
      symDiff += Math.abs(data[leftIdx] - data[rightIdx]) +
        Math.abs(data[leftIdx + 1] - data[rightIdx + 1]) +
        Math.abs(data[leftIdx + 2] - data[rightIdx + 2]);
      symCount++;
    }
  }
  const avgSymDiff = symCount > 0 ? symDiff / (symCount * 3) : 0;
  const symmetryScore = Math.max(0, 1 - avgSymDiff / 80);

  // ── Negative space: proportion of near-white / near-black pixels ──
  let negativePixels = 0;
  for (let i = 0; i < dw * dh; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum > 240 || lum < 30) negativePixels++;
  }
  const negativeSpace = negativePixels / (dw * dh);

  // ── Visual weight: center of mass ──
  let massX = 0, massY = 0, totalMass = 0;
  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const i = (y * dw + x) * 3;
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const weight = 255 - lum; // darker = heavier
      massX += x * weight;
      massY += y * weight;
      totalMass += weight;
    }
  }
  const visualWeight = {
    x: totalMass > 0 ? massX / totalMass / dw : 0.5,
    y: totalMass > 0 ? massY / totalMass / dh : 0.5,
  };

  // ── Frame detection: scan border for uniform dark/colored band ──
  let hasFrame = false;
  let frameColor: string | null = null;
  let frameWidth = 0;

  const borderScan = 30;
  const scans: number[] = [];
  for (let y = 0; y < Math.min(borderScan, dh); y++) {
    for (let x = 0; x < dw; x++) {
      const i = (y * dw + x) * 3;
      scans.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    }
  }
  scans.sort((a, b) => a - b);
  const borderMedian = scans[Math.floor(scans.length / 2)];
  const borderStd = Math.sqrt(scans.reduce((s, v) => s + (v - borderMedian) ** 2, 0) / scans.length);

  if (borderMedian < 200 && borderStd < 30 && borderMedian > 20) {
    hasFrame = true;
    const midPx = Math.floor(dh / 2) * dw + Math.floor(dw * 0.02);
    const fr = data[midPx * 3] ?? 0;
    const fg = data[midPx * 3 + 1] ?? 0;
    const fb = data[midPx * 3 + 2] ?? 0;
    frameColor = `rgb(${fr},${fg},${fb})`;
    frameWidth = Math.round((borderMedian < 100 ? 4 : 2) + borderStd * 0.1);
  }

  // ── Mat detection: scan just inside frame for white/cream band ──
  let hasInternalMat = false;
  let matColor: string | null = null;
  let matWidth = 0;
  if (hasFrame) {
    const matScanStart = Math.floor(dw * (frameWidth / 100));
    const matScanEnd = Math.floor(dw * 0.08);
    let matPixels = 0, matTotal = 0;
    for (let x = matScanStart; x < matScanEnd; x++) {
      for (let y = Math.floor(dh * 0.3); y < Math.floor(dh * 0.7); y++) {
        const i = (y * dw + x) * 3;
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        if (lum > 200) matPixels++;
        matTotal++;
      }
    }
    if (matPixels / matTotal > 0.6) {
      hasInternalMat = true;
      matColor = "#F5F0E8"; // approximate cream
      matWidth = Math.round((matScanEnd - matScanStart) / dw * 100);
    }
  }

  // ── Composition type ──
  let compositionType = "unknown";
  if (symmetryScore > 0.7) compositionType = "symmetric";
  else if (visualWeight.x > 0.6) compositionType = "right-weighted";
  else if (visualWeight.x < 0.4) compositionType = "left-weighted";
  else if (visualWeight.y < 0.35) compositionType = "top-weighted";
  else if (visualWeight.y > 0.65) compositionType = "bottom-weighted";
  else if (Math.abs(visualWeight.x - 0.5) < 0.1 && Math.abs(visualWeight.y - 0.5) < 0.1) compositionType = "centered";

  // ── Primary medium guess from visual traits ──
  let primaryMedium: string | null = null;
  if (visualComplexity > 0.5 && negativeSpace < 0.3) primaryMedium = "oil/acrylic on canvas";
  else if (visualComplexity < 0.3 && symmetryScore > 0.6) primaryMedium = "print/edition";
  else if (hasFrame && visualComplexity > 0.3) primaryMedium = "framed work on paper";
  else if (negativeSpace > 0.4) primaryMedium = "photograph or drawing";

  // ── Visual period guess ──
  let visualPeriod: string | null = null;
  const firstColor = colorData.dominantColors[0];
  const isBright = firstColor && firstColor.hsl?.[2] && firstColor.hsl[2] > 60;
  const isSaturated = firstColor && firstColor.hsl?.[1] && firstColor.hsl[1] > 50;
  if (visualComplexity > 0.6 && !isBright) visualPeriod = "contemporary/dark palette";
  else if (isBright && isSaturated) visualPeriod = "mid-century or pop influenced";
  else if (symmetryScore > 0.65) visualPeriod = "modernist";
  else if (negativeSpace > 0.5) visualPeriod = "minimalist";

  const confidence: ConfidenceMap = {
    visualComplexity: 0.8,
    symmetry: 0.75,
    negativeSpace: 0.85,
    visualWeight: 0.7,
    hasFrame: hasFrame ? 0.7 : 0.5,
    mat: hasInternalMat ? 0.6 : 0.5,
    compositionType: 0.6,
    primaryMedium: primaryMedium ? 0.4 : 0,
    visualPeriod: visualPeriod ? 0.4 : 0,
  };

  return {
    hasFrame, frameColor, frameWidth, hasInternalMat, matColor, matWidth,
    visualComplexity, symmetryScore, negativeSpace, compositionType,
    visualWeight, primaryMedium, visualPeriod, confidence,
  };
}
