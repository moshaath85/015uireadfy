import { createHash } from "crypto";
import sharp from "sharp";

export type DuplicateClass =
  | "EXACT_DUPLICATE"
  | "DERIVATIVE_VARIANT"
  | "NEAR_DUPLICATE"
  | "UNCERTAIN"
  | "UNIQUE";

export interface DuplicateReport {
  checksum: string;
  perceptualHash: string;
  classification: DuplicateClass;
  exactDuplicateGroup: string | null;
  nearDuplicateGroup: string | null;
  signals: string[];
  aspectRatio: number;
  luminanceHistogram: number[];
}

const NEAR_DUPLICATE_THRESHOLD = 8;
const UNCERTAIN_THRESHOLD = 14;

const registry = new Map<string, { mediaId: string; checksum: string; phash: string; aspectRatio: number; histogram: number[] }>();

export function resetDuplicateRegistry() {
  registry.clear();
}

export function registerAsset(mediaId: string, checksum: string, phash: string, aspectRatio: number, histogram: number[]) {
  registry.set(mediaId, { mediaId, checksum, phash, aspectRatio, histogram });
}

export async function computePerceptualHash(buffer: Buffer): Promise<string> {
  const hashSize = 9;
  const { data } = await sharp(buffer)
    .resize(hashSize, hashSize - 1, { fit: "fill" })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let hash = "";
  for (let y = 0; y < hashSize - 1; y++) {
    for (let x = 0; x < hashSize - 1; x++) {
      const left = data[y * hashSize + x];
      const right = data[y * hashSize + (x + 1)];
      hash += left > right ? "1" : "0";
    }
  }
  return hash;
}

export function hammingDistance(a: string, b: string): number {
  let dist = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) dist++;
  }
  return dist;
}

function histSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  let intersection = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    intersection += Math.min(a[i], b[i]);
  }
  return intersection;
}

function aspectRatioMatch(a1: number, a2: number): boolean {
  return Math.abs(a1 - a2) / Math.max(a1, a2) < 0.05;
}

export async function extractLuminanceHistogram(buffer: Buffer): Promise<number[]> {
  const hist = new Array(10).fill(0);
  try {
    const { data } = await sharp(buffer)
      .resize(64, 64, { fit: "fill" })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i++) {
      const bin = Math.min(9, Math.floor(data[i] / 25.6));
      hist[bin]++;
    }
    const total = data.length || 1;
    for (let i = 0; i < hist.length; i++) hist[i] /= total;
  } catch { /* return zeros */ }
  return hist;
}

function classifyDuplicate(
  checksum: string,
  phash: string,
  aspectRatio: number,
  histogram: number[],
  mediaId: string
): { classification: DuplicateClass; exactDuplicateGroup: string | null; nearDuplicateGroup: string | null; signals: string[] } {
  const signals: string[] = [];

  for (const [, entry] of Array.from(registry)) {
    if (entry.mediaId === mediaId) continue;

    // Signal 1: exact checksum
    if (entry.checksum === checksum) {
      return { classification: "EXACT_DUPLICATE", exactDuplicateGroup: checksum, nearDuplicateGroup: null, signals: ["checksum"] };
    }

    const dist = hammingDistance(phash, entry.phash);
    const arMatch = aspectRatioMatch(aspectRatio, entry.aspectRatio);
    const histSim = histSimilarity(histogram, entry.histogram);

    // Signal collection
    if (dist <= NEAR_DUPLICATE_THRESHOLD) signals.push(`dHash:${dist}`);
    if (arMatch) signals.push("aspect-ratio");
    if (histSim > 0.85) signals.push(`histogram:${histSim.toFixed(2)}`);

    // Classification
    const strongSignals = signals.filter(s => !s.startsWith("histogram:"));
    const allSignals = signals.length;

    if (strongSignals.length >= 2) {
      return { classification: "DERIVATIVE_VARIANT", exactDuplicateGroup: null, nearDuplicateGroup: entry.phash, signals };
    }
    if (strongSignals.length >= 1 && histSim > 0.7) {
      return { classification: "NEAR_DUPLICATE", exactDuplicateGroup: null, nearDuplicateGroup: entry.phash, signals };
    }
    if (allSignals >= 1 && histSim > 0.65) {
      return { classification: "UNCERTAIN", exactDuplicateGroup: null, nearDuplicateGroup: entry.phash, signals };
    }
  }

  return { classification: "UNIQUE", exactDuplicateGroup: null, nearDuplicateGroup: null, signals: [] };
}

export async function detectDuplicates(
  buffer: Buffer,
  mediaId: string
): Promise<DuplicateReport> {
  const checksum = createHash("sha256").update(buffer).digest("hex");
  const meta = await sharp(buffer).metadata();
  const aspectRatio = (meta.width && meta.height) ? meta.width / meta.height : 1;
  const histogram = await extractLuminanceHistogram(buffer);
  const phash = await computePerceptualHash(buffer);

  const result = classifyDuplicate(checksum, phash, aspectRatio, histogram, mediaId);

  registerAsset(mediaId, checksum, phash, aspectRatio, histogram);

  return {
    checksum,
    perceptualHash: phash,
    classification: result.classification,
    exactDuplicateGroup: result.exactDuplicateGroup,
    nearDuplicateGroup: result.nearDuplicateGroup,
    signals: result.signals,
    aspectRatio,
    luminanceHistogram: histogram,
  };
}
