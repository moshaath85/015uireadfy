import { createHash } from "crypto";
import sharp from "sharp";

export interface DuplicateReport {
  checksum: string;
  perceptualHash: string;
  exactDuplicateGroup: string | null; // checksum of first occurrence
  nearDuplicateGroup: string | null; // perceptual hash group
  isExactDuplicate: boolean;
  isNearDuplicate: boolean;
}

const registry = new Map<string, { mediaId: string; checksum: string; phash: string }>();

export function resetDuplicateRegistry() {
  registry.clear();
}

export function registerAsset(mediaId: string, checksum: string, phash: string) {
  registry.set(mediaId, { mediaId, checksum, phash });
}

/**
 * Compute perceptual hash (dHash — difference hash) for near-duplicate detection.
 * dHash is resistant to minor color/scale changes.
 */
export async function computePerceptualHash(buffer: Buffer): Promise<string> {
  const hashSize = 9; // 9x8 grid → 64-bit hash
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

/**
 * Hamming distance between two perceptual hashes.
 * Distance < 10 = near duplicate (same image, minor variations)
 */
export function hammingDistance(a: string, b: string): number {
  let dist = 0;
  for (let i = 0; i < a.length && i < b.length; i++) {
    if (a[i] !== b[i]) dist++;
  }
  return dist;
}

const NEAR_DUPLICATE_THRESHOLD = 10;

export async function detectDuplicates(
  buffer: Buffer,
  mediaId: string
): Promise<DuplicateReport> {
  const checksum = createHash("sha256").update(buffer).digest("hex");
  const phash = await computePerceptualHash(buffer);

  let exactDuplicateGroup: string | null = null;
  let nearDuplicateGroup: string | null = null;
  let isExact = false;
  let isNear = false;

  // Check existing registry
  for (const entry of Array.from(registry.values())) {
    if (entry.mediaId === mediaId) continue;
    if (entry.checksum === checksum) {
      exactDuplicateGroup = entry.checksum;
      isExact = true;
      break;
    }
  }

  if (!isExact) {
    for (const entry of Array.from(registry.values())) {
      if (entry.mediaId === mediaId) continue;
      if (hammingDistance(phash, entry.phash) <= NEAR_DUPLICATE_THRESHOLD) {
        nearDuplicateGroup = entry.phash;
        isNear = true;
        break;
      }
    }
  }

  registerAsset(mediaId, checksum, phash);

  return { checksum, perceptualHash: phash, exactDuplicateGroup, nearDuplicateGroup, isExactDuplicate: isExact, isNearDuplicate: isNear };
}
