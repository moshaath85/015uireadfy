import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { getTex7PrismaClient } from "@/lib/tex7/database/providers/prisma-client";
import { classifyAsset, classifyFromHint } from "./classifier";
import { analyzeQuality } from "./quality";
import { generateVariants } from "./variants";
import { smartCrop } from "./smart-crop";
import type { AssetType, CropStatus } from "./types";
import { PROCESSOR_VERSION, MIN_IMAGE_DIMENSION } from "./types";

export interface AssetRecord {
  mediaId: string;
  storagePath: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  contextModel: string;
  contextEntityId: string;
  contextEntitySlug?: string;
  isPrimary?: boolean;
  isProfile?: boolean;
  relationshipType?: string;
}

export interface UnifiedResult {
  mediaId: string;
  storagePath: string;
  assetType: AssetType;
  quality: "POOR" | "FAIR" | "GOOD" | "EXCELLENT";
  width: number;
  height: number;
  status: CropStatus | "SKIPPED" | "PROCESSED_NO_CROP";
  confidence?: number;
  variantsGenerated: number;
  error?: string;
}

export interface UnifiedReport {
  total: number;
  byType: Record<string, number>;
  autoApproved: number;
  needsReview: number;
  alreadyCropped: number;
  processedNoCrop: number;
  skipped: number;
  failed: number;
  lowResolution: number;
  duplicatesSuspected: number;
  results: UnifiedResult[];
}

let fetchFn: typeof fetch = globalThis.fetch;
export function setFetchOverride(fn: typeof fetch) { fetchFn = fn; }

async function downloadImage(storagePath: string): Promise<Buffer> {
  const localPath = path.join(process.cwd(), "public", storagePath.replace(/^\//, ""));
  if (existsSync(localPath)) return readFile(localPath);
  const base = process.env.OBJECT_STORAGE_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "";
  if (base) {
    const resp = await fetchFn(`${base}/${storagePath.replace(/^\//, "")}`);
    if (resp.ok) return Buffer.from(await resp.arrayBuffer());
  }
  throw new Error(`Cannot load: ${storagePath}`);
}

export async function runUnifiedPipeline(options: {
  dryRun?: boolean;
  limit?: number;
  force?: boolean;
} = {}): Promise<UnifiedReport> {
  const prisma = getTex7PrismaClient();
  const report: UnifiedReport = {
    total: 0, byType: {}, autoApproved: 0, needsReview: 0,
    alreadyCropped: 0, processedNoCrop: 0, skipped: 0, failed: 0,
    lowResolution: 0, duplicatesSuspected: 0, results: [],
  };

  const records = await gatherAllAssets(prisma, options.limit);
  report.total = records.length;

  for (const rec of records) {
    const result = await processAsset(rec, options, prisma);
    report.results.push(result);
    report.byType[result.assetType] = (report.byType[result.assetType] || 0) + 1;

    if (result.status === "AUTO_APPROVED") report.autoApproved++;
    else if (result.status === "NEEDS_REVIEW") report.needsReview++;
    else if (result.status === "ALREADY_CROPPED") report.alreadyCropped++;
    else if (result.status === "PROCESSED_NO_CROP") report.processedNoCrop++;
    else if (result.status === "SKIPPED") report.skipped++;
    else if (result.status === "PROCESSING_FAILED") report.failed++;

    if ((result.quality === "POOR" || result.quality === "FAIR") && result.width > 0) {
      if (result.width < MIN_IMAGE_DIMENSION || result.height < MIN_IMAGE_DIMENSION) {
        report.lowResolution++;
      }
    }
  }

  return report;
}

async function processAsset(
  rec: AssetRecord,
  options: { dryRun?: boolean; force?: boolean },
  prisma: any
): Promise<UnifiedResult> {
  const base = {
    mediaId: rec.mediaId,
    storagePath: rec.storagePath,
    assetType: "OTHER" as AssetType,
    quality: "FAIR" as const,
    width: 0, height: 0,
    status: "SKIPPED" as const,
    variantsGenerated: 0,
  };

  try {
    const assetType = classifyAsset({
      contextModel: rec.contextModel,
      isPrimary: rec.isPrimary,
      isProfile: rec.isProfile,
      mediaType: rec.mimeType,
      relationshipType: rec.relationshipType,
    });

    if (options.dryRun) {
      return { ...base, assetType };
    }

    if (!options.force) {
      const existing = await prisma.artworkCrop.findFirst({
        where: { mediaId: rec.mediaId, processingVersion: PROCESSOR_VERSION },
      });
      if (existing) return { ...base, assetType, status: "SKIPPED" };
    }

    const buffer = await downloadImage(rec.storagePath);
    const quality = await analyzeQuality(buffer, rec.fileSize);

    // Only perform smart-crop on ARTWORK type
    if (assetType === "ARTWORK" || assetType === "ARTWORK_DETAIL") {
      const cropResult = await smartCrop({
        imageBuffer: buffer,
        sourceKey: rec.storagePath,
        sourceUrl: rec.storagePath,
      });

      // Generate variants from cropped output when approved
      if (cropResult.status === "AUTO_APPROVED") {
        const variants = await generateVariants(cropResult.displayBuffer, "standard");
        base.variantsGenerated = variants.length;
      }

      await prisma.artworkCrop.upsert({
        where: { mediaId_processingVersion: { mediaId: rec.mediaId, processingVersion: PROCESSOR_VERSION } },
        create: {
          mediaId: rec.mediaId, artworkId: rec.contextEntityId,
          status: cropResult.status, confidence: cropResult.metadata.confidenceComponents.overall,
          metadata: cropResult.metadata, processingVersion: PROCESSOR_VERSION,
        },
        update: {
          status: cropResult.status, confidence: cropResult.metadata.confidenceComponents.overall,
          metadata: cropResult.metadata, processedAt: new Date(),
        },
      });

      return {
        ...base, assetType,
        quality: quality.overall,
        width: quality.width, height: quality.height,
        status: cropResult.status,
        confidence: cropResult.metadata.confidenceComponents.overall,
        variantsGenerated: base.variantsGenerated,
      };
    }

    // Non-artwork assets: generate variants, no crop
    const variants = await generateVariants(buffer, assetType === "HERO" ? "hero" : "standard");

    await prisma.artworkCrop.upsert({
      where: { mediaId_processingVersion: { mediaId: rec.mediaId, processingVersion: PROCESSOR_VERSION } },
      create: {
        mediaId: rec.mediaId, artworkId: rec.contextEntityId,
        status: "PROCESSED_NO_CROP" as any,
        metadata: { assetType, quality: quality.overall, variantCount: variants.length },
        processingVersion: PROCESSOR_VERSION,
      },
      update: {
        status: "PROCESSED_NO_CROP" as any,
        metadata: { assetType, quality: quality.overall, variantCount: variants.length },
        processedAt: new Date(),
      },
    });

    return {
      ...base, assetType,
      quality: quality.overall,
      width: quality.width, height: quality.height,
      status: "PROCESSED_NO_CROP",
      variantsGenerated: variants.length,
    };
  } catch (error) {
    return {
      ...base,
      assetType: classifyFromHint(rec.storagePath),
      status: "PROCESSING_FAILED",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function gatherAllAssets(prisma: any, limit?: number): Promise<AssetRecord[]> {
  const records: AssetRecord[] = [];

  const pushMedia = (
    mediaList: any[],
    contextModel: string,
    entityId: string,
    entitySlug?: string,
    extra?: Partial<AssetRecord>
  ) => {
    for (const m of mediaList) {
      if (!m?.storagePath) continue;
      records.push({
        mediaId: m.id, storagePath: m.storagePath, filename: m.filename ?? "",
        mimeType: m.mimeType ?? "unknown", fileSize: m.fileSize ?? 0,
        contextModel, contextEntityId: entityId, contextEntitySlug: entitySlug,
        ...extra,
      });
    }
  };

  // Artworks
  const artworks = await prisma.artwork.findMany({
    take: limit ? Math.min(limit, 500) : 500,
    include: { primaryMedia: { select: { id: true, storagePath: true, filename: true, mimeType: true, fileSize: true } } },
  });
  for (const a of artworks) {
    if (a.primaryMedia) {
      pushMedia([a.primaryMedia], "Artwork", a.id, a.slug, { isPrimary: true });
    }
  }
  if (limit && records.length >= limit) return records.slice(0, limit);

  // Artists
  const artists = await prisma.artist.findMany({
    take: 100,
    include: { profileImage: { select: { id: true, storagePath: true, filename: true, mimeType: true, fileSize: true } } },
  });
  for (const a of artists) {
    if (a.profileImage) pushMedia([a.profileImage], "Artist", a.id, a.slug, { isProfile: true });
  }

  // Exhibitions
  const exhibitions = await prisma.exhibition.findMany({
    take: 50,
    include: { coverMedia: { select: { id: true, storagePath: true, filename: true, mimeType: true, fileSize: true } } },
  });
  for (const e of exhibitions) {
    if (e.coverMedia) pushMedia([e.coverMedia], "Exhibition", e.id, e.slug, { relationshipType: "cover" });
  }

  // Collections
  const collections = await prisma.collection.findMany({
    take: 30,
    include: { coverMedia: { select: { id: true, storagePath: true, filename: true, mimeType: true, fileSize: true } } },
  });
  for (const c of collections) {
    if (c.coverMedia) pushMedia([c.coverMedia], "Collection", c.id, c.slug);
  }

  // Projects
  const projects = await prisma.project.findMany({
    take: 30,
    include: { coverMedia: { select: { id: true, storagePath: true, filename: true, mimeType: true, fileSize: true } } },
  });
  for (const p of projects) {
    if (p.coverMedia) pushMedia([p.coverMedia], "Project", p.id, p.slug, { relationshipType: "cover" });
  }

  // News
  const newsItems = await prisma.news.findMany({
    take: 30,
    include: { image: { select: { id: true, storagePath: true, filename: true, mimeType: true, fileSize: true } } },
  });
  for (const n of newsItems) {
    if (n.image) pushMedia([n.image], "News", n.id, n.slug);
  }

  // Publications
  const publications = await prisma.publication.findMany({
    take: 30,
    include: { coverImage: { select: { id: true, storagePath: true, filename: true, mimeType: true, fileSize: true } } },
  });
  for (const p of publications) {
    if (p.coverImage) pushMedia([p.coverImage], "Publication", p.id, p.slug);
  }

  // Services
  const services = await prisma.service.findMany({
    take: 30,
    include: { coverMedia: { select: { id: true, storagePath: true, filename: true, mimeType: true, fileSize: true } } },
  });
  for (const s of services) {
    if (s.coverMedia) pushMedia([s.coverMedia], "Service", s.id, s.slug);
  }

  return records;
}
