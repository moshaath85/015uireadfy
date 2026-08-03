import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { getTex7PrismaClient } from "@/lib/tex7/database/providers/prisma-client";
import { smartCrop } from "./smart-crop";
import type { CropStatus } from "./types";
import { PROCESSOR_VERSION } from "./types";

export interface PipelineOptions {
  dryRun?: boolean;
  limit?: number;
  artworkId?: string;
  force?: boolean;
  minConfidence?: number;
  resume?: boolean;
}

export interface PipelineResult {
  artworkId: string;
  artworkSlug: string;
  status: CropStatus | "SKIPPED";
  confidence?: number;
  error?: string;
  sourceKey?: string;
}

export type PipelineReport = {
  total: number;
  processed: number;
  autoApproved: number;
  needsReview: number;
  alreadyCropped: number;
  skipped: number;
  failed: number;
  results: PipelineResult[];
};

interface ArtworkImageRecord {
  id: string;
  slug: string;
  primaryMedia: {
    id: string;
    storagePath: string;
    filename: string;
    mimeType: string;
    width: number | null;
    height: number | null;
  } | null;
}

let fetchFn: typeof fetch = globalThis.fetch;
export function setFetchOverride(fn: typeof fetch) { fetchFn = fn; }

async function downloadImage(storagePath: string): Promise<Buffer> {
  const base = process.env.OBJECT_STORAGE_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "";
  const localPath = path.join(process.cwd(), "public", storagePath.replace(/^\//, ""));
  if (existsSync(localPath)) {
    return readFile(localPath);
  }
  if (base) {
    const url = `${base}/${storagePath.replace(/^\//, "")}`;
    const resp = await fetchFn(url);
    if (resp.ok) return Buffer.from(await resp.arrayBuffer());
  }
  throw new Error(`Could not load image: ${storagePath}`);
}

export async function runImageBackfill(options: PipelineOptions = {}): Promise<PipelineReport> {
  const prisma = getTex7PrismaClient();
  const report: PipelineReport = {
    total: 0, processed: 0, autoApproved: 0, needsReview: 0,
    alreadyCropped: 0, skipped: 0, failed: 0, results: [],
  };

  const artworks = await prisma.artwork.findMany({
    where: { ...(options.artworkId ? { id: options.artworkId } : {}) },
    include: { primaryMedia: { select: { id: true, storagePath: true, filename: true, mimeType: true, width: true, height: true } } },
    orderBy: { createdAt: "asc" },
    ...(options.limit ? { take: options.limit } : {}),
  });

  report.total = artworks.length;

  for (const artwork of artworks as unknown as ArtworkImageRecord[]) {
    const result = await processOne(artwork, options, prisma);
    report.results.push(result);
    if (result.status === "SKIPPED") report.skipped++;
    else if (result.status === "AUTO_APPROVED") { report.autoApproved++; report.processed++; }
    else if (result.status === "NEEDS_REVIEW") { report.needsReview++; report.processed++; }
    else if (result.status === "ALREADY_CROPPED") { report.alreadyCropped++; report.processed++; }
    else if (result.status === "PROCESSING_FAILED") report.failed++;
  }

  return report;
}

async function processOne(
  artwork: ArtworkImageRecord,
  options: PipelineOptions,
  prisma: any
): Promise<PipelineResult> {
  const base = { artworkId: artwork.id, artworkSlug: artwork.slug, status: "SKIPPED" as const };
  try {
    const media = artwork.primaryMedia;
    if (!media?.storagePath) return { ...base, error: "No storage path" };

    if (options.dryRun) return { ...base, sourceKey: media.storagePath };

    if (!options.force) {
      const existing = await prisma.artworkCrop.findFirst({
        where: { mediaId: media.id, processingVersion: PROCESSOR_VERSION },
      });
      if (existing) return { ...base };
    }

    const imageBuffer = await downloadImage(media.storagePath);
    const publicUrl = resolvePublicUrl(media.storagePath);
    const result = await smartCrop({ imageBuffer, sourceKey: media.storagePath, sourceUrl: publicUrl });

    await prisma.artworkCrop.upsert({
      where: { mediaId_processingVersion: { mediaId: media.id, processingVersion: PROCESSOR_VERSION } },
      create: {
        mediaId: media.id, artworkId: artwork.id, status: result.status,
        confidence: result.metadata.confidenceComponents.overall,
        metadata: result.metadata, processingVersion: PROCESSOR_VERSION,
      },
      update: {
        status: result.status, confidence: result.metadata.confidenceComponents.overall,
        metadata: result.metadata, processedAt: new Date(), processingError: result.error ?? null,
      },
    });

    return { artworkId: artwork.id, artworkSlug: artwork.slug, status: result.status, confidence: result.metadata.confidenceComponents.overall, sourceKey: media.storagePath };
  } catch (error) {
    return { ...base, status: "PROCESSING_FAILED", error: error instanceof Error ? error.message : "Unknown error" };
  }
}

function resolvePublicUrl(storagePath: string): string {
  const base = process.env.OBJECT_STORAGE_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "";
  if (base) return `${base}/${storagePath.replace(/^\//, "")}`;
  return `/images/${path.basename(storagePath)}`;
}
