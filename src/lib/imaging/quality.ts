import sharp from "sharp";

export interface QualityReport {
  width: number;
  height: number;
  megapixels: number;
  resolution: "LOW" | "STANDARD" | "HIGH" | "ULTRA";
  sharpness: number; // 0-1
  noiseLevel: number; // 0-1 (lower = cleaner)
  compressionRatio: number | null;
  hasExif: boolean;
  hasRotation: boolean;
  orientation: number;
  aspectRatio: number;
  hasWhiteBorders: boolean;
  whiteBorderWidth: number; // max border width in pixels
  isDuplicateLikely: boolean;
  format: string;
  fileSizeKb: number;
  overall: "POOR" | "FAIR" | "GOOD" | "EXCELLENT";
}

export async function analyzeQuality(
  buffer: Buffer,
  fileSizeBytes: number
): Promise<QualityReport> {
  const meta = await sharp(buffer).metadata();
  const { width = 0, height = 0, format = "unknown", orientation = 1 } = meta;

  const mp = (width * height) / 1_000_000;
  const aspectRatio = height > 0 ? width / height : 1;

  // Resolution classification
  let resolution: QualityReport["resolution"];
  if (width >= 4000 || height >= 4000) resolution = "ULTRA";
  else if (width >= 2000 || height >= 2000) resolution = "HIGH";
  else if (width >= 800 || height >= 800) resolution = "STANDARD";
  else resolution = "LOW";

  // Sharpness — measure edge intensity on downsampled version
  let sharpness = 0.5;
  let noiseLevel = 0.5;
  try {
    const { data } = await sharp(buffer)
      .resize(Math.min(width, 400))
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const w = Math.min(width, 400);
    const h = Math.round((w / width) * height);

    // Laplacian sharpness (simplified — gradient magnitude)
    let gradSum = 0, count = 0;
    for (let y = 2; y < h - 2; y++) {
      for (let x = 2; x < w - 2; x++) {
        const c = data[y * w + x];
        const n = data[(y - 1) * w + x];
        const s = data[(y + 1) * w + x];
        const e = data[y * w + (x + 1)];
        const we = data[y * w + (x - 1)];
        const grad = Math.abs(c - n) + Math.abs(c - s) + Math.abs(c - e) + Math.abs(c - we);
        gradSum += grad;
        count++;
      }
    }
    const avgGrad = count > 0 ? gradSum / count : 0;
    sharpness = Math.min(1, avgGrad / 30);

    // Noise estimation — local variance
    let varSum = 0;
    for (let y = 4; y < h - 4; y += 4) {
      for (let x = 4; x < w - 4; x += 4) {
        const patch: number[] = [];
        for (let dy = -2; dy <= 2; dy++)
          for (let dx = -2; dx <= 2; dx++)
            patch.push(data[(y + dy) * w + (x + dx)]);
        const mean = patch.reduce((a, b) => a + b, 0) / patch.length;
        const variance = patch.reduce((a, b) => a + (b - mean) ** 2, 0) / patch.length;
        varSum += variance;
      }
    }
    const avgVariance = count > 0 ? varSum / (h * w / 16) : 0;
    noiseLevel = Math.min(1, avgVariance / 200);
  } catch { /* keep defaults */ }

  // White border detection
  let hasWhiteBorders = false;
  let whiteBorderWidth = 0;
  try {
    const { data: borderData } = await sharp(buffer)
      .resize(Math.min(width, 200))
      .raw()
      .toBuffer({ resolveWithObject: true });
    const bw = Math.min(width, 200);
    const bh = Math.round((bw / width) * height);
    let whitePixelRun = 0;
    for (let x = 0; x < bw && whitePixelRun < bw * 0.3; x++) {
      const idx = Math.floor(bh / 2) * bw + x;
      const lum = 0.299 * (borderData[idx * 3] || 0) + 0.587 * (borderData[idx * 3 + 1] || 0) + 0.114 * (borderData[idx * 3 + 2] || 0);
      if (lum > 240) whitePixelRun++; else { if (whitePixelRun > 3) break; whitePixelRun = 0; }
    }
    hasWhiteBorders = whitePixelRun > bw * 0.05;
    whiteBorderWidth = hasWhiteBorders ? Math.round((whitePixelRun / bw) * width) : 0;
  } catch { /* keep defaults */ }

  // Overall quality
  let overall: QualityReport["overall"];
  if (resolution === "ULTRA" && sharpness > 0.5 && noiseLevel < 0.3) overall = "EXCELLENT";
  else if (resolution === "HIGH" && sharpness > 0.35) overall = "GOOD";
  else if (resolution === "STANDARD" || sharpness > 0.2) overall = "FAIR";
  else overall = "POOR";

  // Compression ratio
  const rawSize = width * height * 3;
  const compressionRatio = fileSizeBytes > 0 ? rawSize / fileSizeBytes : null;

  return {
    width, height, megapixels: Math.round(mp * 10) / 10,
    resolution, sharpness, noiseLevel, compressionRatio,
    hasExif: meta.hasProfile ?? false,
    hasRotation: orientation !== 1,
    orientation, aspectRatio,
    hasWhiteBorders, whiteBorderWidth,
    isDuplicateLikely: false, // requires external comparison
    format: format ?? "unknown",
    fileSizeKb: Math.round(fileSizeBytes / 1024),
    overall,
  };
}
