import sharp from "sharp";
import { createHash } from "crypto";
import type {
  CropMetadata,
  CropRect,
  CropStatus,
} from "./types";
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

interface EdgeResult {
  left: number;
  right: number;
  top: number;
  bottom: number;
  confidence: number;
}

export async function smartCrop(input: SmartCropInput): Promise<SmartCropResult> {
  const padding = Math.max(SAFE_PADDING_MIN, Math.min(SAFE_PADDING_MAX, input.safePadding ?? SAFE_PADDING_DEFAULT));

  const metadata = await sharp(input.imageBuffer).metadata();
  const { width, height } = metadata;

  if (!width || !height) {
    return fail("Could not read image dimensions", input);
  }

  if (width < 100 || height < 100) {
    return fail("Image too small for processing", input);
  }

  const edge = await detectEdges(input.imageBuffer, width, height);

  if (edge.confidence < 0.3) {
    const result = alreadyCropped(input, width, height);
    return { ...result, status: "ALREADY_CROPPED" };
  }

  const cropRect = computeCropRect(edge, width, height, padding);
  const frameRect = computeFrameRect(edge, width, height);

  const displayBuffer = await sharp(input.imageBuffer)
    .extract({
      left: cropRect.left,
      top: cropRect.top,
      width: cropRect.width,
      height: cropRect.height,
    })
    .toBuffer();

  const thumbnailBuffer = await sharp(displayBuffer)
    .resize(400, 400, { fit: "inside", withoutEnlargement: true })
    .toBuffer();

  const bgConfidence = edge.confidence;
  const edgeConfidence = estimateEdgeConfidence(edge, width, height);
  const rectConfidence = estimateRectangularity(edge, width, height);
  const overall = bgConfidence * 0.4 + edgeConfidence * 0.35 + rectConfidence * 0.25;

  const backgroundSample = await sampleBackgroundColor(input.imageBuffer, edge, width, height);
  const checksum = createHash("sha256").update(displayBuffer).digest("hex");

  const metadataObj: CropMetadata = {
    sourceAssetKey: input.sourceKey,
    sourceUrl: input.sourceUrl,
    originalWidth: width,
    originalHeight: height,
    detectedBackground: {
      color: backgroundSample,
      confidence: bgConfidence,
    },
    cropRect,
    frameRect,
    safePadding: padding,
    perspectiveCorrected: false,
    perspectiveMatrix: null,
    outputWidth: cropRect.width,
    outputHeight: cropRect.height,
    confidenceComponents: {
      backgroundDetection: bgConfidence,
      edgeDetection: edgeConfidence,
      rectangularity: rectConfidence,
      overall,
    },
    processorVersion: PROCESSOR_VERSION,
    checksum,
  };

  const status: CropStatus = overall >= AUTO_APPROVE_THRESHOLD
    ? "AUTO_APPROVED"
    : overall >= REVIEW_THRESHOLD
    ? "NEEDS_REVIEW"
    : "NEEDS_REVIEW";

  return { displayBuffer, thumbnailBuffer, metadata: metadataObj, status };
}

async function detectEdges(buffer: Buffer, width: number, height: number): Promise<EdgeResult> {
  const sampleSize = 20;
  const sampleMargin = Math.max(5, Math.floor(Math.min(width, height) * 0.03));

  const { data: cornerData } = await sharp(buffer)
    .resize(Math.min(width, 200)) // downsample for speed
    .raw()
    .toBuffer({ resolveWithObject: true });

  const dw = Math.min(width, 200);
  const dh = Math.round((dw / width) * height);
  const channels = cornerData.length / (dw * dh);

  const getPixelLuminance = (x: number, y: number): number => {
    const idx = (y * dw + x) * channels;
    const r = cornerData[idx];
    const g = cornerData[idx + 1];
    const b = cornerData[idx + 2];
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };

  // Sample border regions for background luminance
  const borderLum: number[] = [];
  for (let x = 1; x < dw - 1; x++) {
    for (let y = 1; y < Math.min(sampleMargin, dh - 1); y++) {
      borderLum.push(getPixelLuminance(x, y));
    }
    for (let y = Math.max(1, dh - sampleMargin); y < dh - 1; y++) {
      borderLum.push(getPixelLuminance(x, y));
    }
  }
  for (let y = 1; y < dh - 1; y++) {
    for (let x = 1; x < Math.min(sampleMargin, dw - 1); x++) {
      borderLum.push(getPixelLuminance(x, y));
    }
    for (let x = Math.max(1, dw - sampleMargin); x < dw - 1; x++) {
      borderLum.push(getPixelLuminance(x, y));
    }
  }

  if (borderLum.length === 0) {
    return { left: 0, right: width, top: 0, bottom: height, confidence: 0 };
  }

  borderLum.sort((a, b) => a - b);
  const bgMedian = borderLum[Math.floor(borderLum.length / 2)];
  const bgStd = Math.sqrt(
    borderLum.reduce((sum, v) => sum + (v - bgMedian) ** 2, 0) / borderLum.length
  );

  // Background is fairly uniform if std < 15
  const bgUniformity = Math.max(0, 1 - bgStd / 30);

  // Scan inward from each edge to find first significant luminance change
  const threshold = bgMedian + Math.max(bgStd * 2, 10);

  let left = 0, right = dw - 1, top = 0, bottom = dh - 1;

  // Left edge scan
  const midY = Math.floor(dh / 2);
  for (let x = 1; x < dw; x++) {
    const lum = getPixelLuminance(x, midY);
    if (Math.abs(lum - bgMedian) > Math.max(bgStd * 1.5, 8)) {
      left = x;
      break;
    }
  }

  // Right edge scan
  for (let x = dw - 2; x >= 0; x--) {
    const lum = getPixelLuminance(x, midY);
    if (Math.abs(lum - bgMedian) > Math.max(bgStd * 1.5, 8)) {
      right = x;
      break;
    }
  }

  // Top edge scan
  const midX = Math.floor(dw / 2);
  for (let y = 1; y < dh; y++) {
    const lum = getPixelLuminance(midX, y);
    if (Math.abs(lum - bgMedian) > Math.max(bgStd * 1.5, 8)) {
      top = y;
      break;
    }
  }

  // Bottom edge scan
  for (let y = dh - 2; y >= 0; y--) {
    const lum = getPixelLuminance(midX, y);
    if (Math.abs(lum - bgMedian) > Math.max(bgStd * 1.5, 8)) {
      bottom = y;
      break;
    }
  }

  // Scale back to original dimensions
  const scaleX = width / dw;
  const scaleY = height / dh;

  const edgeWidth = (right - left) * scaleX;
  const edgeHeight = (bottom - top) * scaleY;
  const areaRatio = (edgeWidth * edgeHeight) / (width * height);

  // If detected area is very small (<5%), likely a scan error — fall back to full image
  if (areaRatio < 0.05 || edgeWidth < 50 || edgeHeight < 50) {
    return { left: 0, right: width, top: 0, bottom: height, confidence: 0.1 };
  }

  // If detected area is >95%, already tight
  if (areaRatio > 0.95) {
    return { left: 0, right: width, top: 0, bottom: height, confidence: 0.2 };
  }

  const confidence = bgUniformity * 0.6 + Math.min(1, areaRatio * 1.2) * 0.4;

  return {
    left: Math.round(left * scaleX),
    right: Math.round(right * scaleX),
    top: Math.round(top * scaleY),
    bottom: Math.round(bottom * scaleY),
    confidence,
  };
}

function computeCropRect(edge: EdgeResult, width: number, height: number, padding: number): CropRect {
  const padX = Math.round(width * padding);
  const padY = Math.round(height * padding);

  const left = Math.max(0, edge.left - padX);
  const top = Math.max(0, edge.top - padY);
  const right = Math.min(width, edge.right + padX);
  const bottom = Math.min(height, edge.bottom + padY);

  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  };
}

function computeFrameRect(edge: EdgeResult, width: number, height: number): CropRect | null {
  if (edge.confidence < 0.5) return null;
  return {
    left: edge.left,
    top: edge.top,
    width: edge.right - edge.left,
    height: edge.bottom - edge.top,
  };
}

function estimateEdgeConfidence(edge: EdgeResult, width: number, height: number): number {
  const leftRatio = edge.left / width;
  const rightRatio = (width - edge.right) / width;
  const topRatio = edge.top / height;
  const bottomRatio = (height - edge.bottom) / height;

  const maxBorderRatio = Math.max(leftRatio, rightRatio, topRatio, bottomRatio);
  const avgBorderRatio = (leftRatio + rightRatio + topRatio + bottomRatio) / 4;

  const borderConfidence = Math.min(1, maxBorderRatio * 3);
  const balanceConfidence = Math.min(1, (1 - Math.abs(maxBorderRatio - avgBorderRatio) / Math.max(0.01, maxBorderRatio)) * 2);

  return borderConfidence * 0.7 + balanceConfidence * 0.3;
}

function estimateRectangularity(edge: EdgeResult, width: number, height: number): number {
  const edgeWidth = edge.right - edge.left;
  const edgeHeight = edge.bottom - edge.top;

  if (edgeWidth <= 0 || edgeHeight <= 0) return 0;

  const aspectRatio = edgeWidth / edgeHeight;

  const areaRatio = (edgeWidth * edgeHeight) / (width * height);

  const aspectScore = aspectRatio > 0.2 && aspectRatio < 5 ? 1 : 0.5;
  const areaScore = areaRatio > 0.1 ? 1 : areaRatio * 10;

  return aspectScore * 0.4 + areaScore * 0.6;
}

async function sampleBackgroundColor(
  buffer: Buffer,
  edge: EdgeResult,
  width: number,
  height: number
): Promise<string> {
  const margin = 10;
  try {
    const region = await sharp(buffer)
      .extract({
        left: Math.max(0, edge.left - margin > 0 ? 0 : margin),
        top: 0,
        width: Math.min(50, width),
        height: Math.min(50, height),
      })
      .resize(1, 1)
      .raw()
      .toBuffer();

    if (region.length >= 3) {
      return `rgb(${region[0]},${region[1]},${region[2]})`;
    }
  } catch {
    // ignore
  }
  return "rgb(255,255,255)";
}

function alreadyCropped(
  input: SmartCropInput,
  width: number,
  height: number
): Omit<SmartCropResult, "status"> {
  return {
    displayBuffer: input.imageBuffer,
    thumbnailBuffer: input.imageBuffer,
    metadata: {
      sourceAssetKey: input.sourceKey,
      sourceUrl: input.sourceUrl,
      originalWidth: width,
      originalHeight: height,
      detectedBackground: { color: "rgb(255,255,255)", confidence: 0 },
      cropRect: { left: 0, top: 0, width, height },
      frameRect: null,
      safePadding: 0,
      perspectiveCorrected: false,
      perspectiveMatrix: null,
      outputWidth: width,
      outputHeight: height,
      confidenceComponents: {
        backgroundDetection: 0,
        edgeDetection: 0,
        rectangularity: 0,
        overall: 0,
      },
      processorVersion: PROCESSOR_VERSION,
      checksum: createHash("sha256").update(input.imageBuffer).digest("hex"),
    },
  };
}

function fail(
  error: string,
  input: SmartCropInput
): SmartCropResult {
  return {
    displayBuffer: input.imageBuffer,
    thumbnailBuffer: input.imageBuffer,
    metadata: {
      sourceAssetKey: input.sourceKey,
      sourceUrl: input.sourceUrl,
      originalWidth: 0,
      originalHeight: 0,
      detectedBackground: { color: "unknown", confidence: 0 },
      cropRect: { left: 0, top: 0, width: 0, height: 0 },
      frameRect: null,
      safePadding: 0,
      perspectiveCorrected: false,
      perspectiveMatrix: null,
      outputWidth: 0,
      outputHeight: 0,
      confidenceComponents: {
        backgroundDetection: 0,
        edgeDetection: 0,
        rectangularity: 0,
        overall: 0,
      },
      processorVersion: PROCESSOR_VERSION,
      checksum: "",
    },
    status: "PROCESSING_FAILED",
    error,
  };
}
