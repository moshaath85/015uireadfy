import sharp from "sharp";

export interface VariantSpec {
  name: string;
  width: number;
  height?: number;
  fit: "inside" | "cover" | "fill" | "outside";
  quality?: number;
  format?: "jpeg" | "png" | "webp";
}

export interface GeneratedVariant {
  name: string;
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  sizeBytes: number;
}

const STANDARD_VARIANTS: VariantSpec[] = [
  { name: "thumbnail", width: 400, fit: "inside", quality: 80, format: "jpeg" },
  { name: "display", width: 1600, fit: "inside", quality: 90, format: "jpeg" },
  { name: "retina", width: 2400, fit: "inside", quality: 85, format: "jpeg" },
];

const HERO_VARIANTS: VariantSpec[] = [
  ...STANDARD_VARIANTS,
  { name: "hero", width: 2560, fit: "inside", quality: 85, format: "jpeg" },
  { name: "mobile", width: 750, fit: "inside", quality: 80, format: "jpeg" },
  { name: "tablet", width: 1400, fit: "inside", quality: 85, format: "jpeg" },
  { name: "opengraph", width: 1200, height: 630, fit: "cover", quality: 90, format: "jpeg" },
];

export async function generateVariants(
  buffer: Buffer,
  spec: "standard" | "hero" | "all" = "standard"
): Promise<GeneratedVariant[]> {
  const variants = spec === "hero" ? HERO_VARIANTS
    : spec === "all" ? [...HERO_VARIANTS]
    : STANDARD_VARIANTS;

  const results: GeneratedVariant[] = [];

  for (const v of variants) {
    try {
      let pipeline = sharp(buffer);

      if (v.format === "webp") {
        pipeline = pipeline.webp({ quality: v.quality ?? 85 });
      } else if (v.format === "png") {
        pipeline = pipeline.png({ quality: v.quality ?? 90 });
      } else {
        pipeline = pipeline.jpeg({ quality: v.quality ?? 85, mozjpeg: true });
      }

      if (v.fit === "cover" && v.height) {
        pipeline = pipeline.resize(v.width, v.height, { fit: "cover", position: "center" });
      } else if (v.height) {
        pipeline = pipeline.resize(v.width, v.height, { fit: v.fit, withoutEnlargement: true });
      } else {
        pipeline = pipeline.resize(v.width, undefined, { fit: v.fit, withoutEnlargement: true });
      }

      const out = await pipeline.toBuffer();
      const meta = await sharp(out).metadata();

      results.push({
        name: v.name,
        buffer: out,
        width: meta.width ?? 0,
        height: meta.height ?? 0,
        format: v.format ?? "jpeg",
        sizeBytes: out.length,
      });
    } catch {
      // Skip failed variants
    }
  }

  return results;
}

/**
 * Generate only a thumbnail (fast path for quality checks)
 */
export async function generateThumbnail(buffer: Buffer): Promise<GeneratedVariant | null> {
  try {
    const out = await sharp(buffer)
      .resize(400, 400, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();
    const meta = await sharp(out).metadata();
    return {
      name: "thumbnail",
      buffer: out,
      width: meta.width ?? 0,
      height: meta.height ?? 0,
      format: "jpeg",
      sizeBytes: out.length,
    };
  } catch {
    return null;
  }
}
