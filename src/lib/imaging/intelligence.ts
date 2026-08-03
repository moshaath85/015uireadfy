import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { extractColors, type ColorReport } from "./colors";
import { detectDuplicates, resetDuplicateRegistry, type DuplicateReport } from "./duplicates";
import { analyzeCuratorial, type CuratorialReport } from "./curatorial";
import { analyzeQuality, type QualityReport } from "./quality";

// fetchFn shared with pipeline.ts — local override
let _fetch: typeof fetch = globalThis.fetch;

const INTELLIGENCE_VERSION = "1.0.0";

interface MediaRecord {
  mediaId: string;
  artworkId: string;
  storagePath: string;
  filename: string;
  fileSize: number;
  mediaType: string;
  rightsComplete: boolean;
  missingRights: string[];
  creditStatus: string | null;
}

export interface IntelligenceResult {
  mediaId: string;
  status: "COMPLETED" | "FAILED";
  checksum: string;
  quality: QualityReport | null;
  colors: ColorReport | null;
  duplicates: DuplicateReport | null;
  curatorial: (CuratorialReport & { confidence: Record<string, number> }) | null;
  error?: string;
}

export interface IntelligenceReport {
  total: number;
  completed: number;
  failed: number;
  exactDuplicates: number;
  nearDuplicates: number;
  hasFrame: number;
  hasMat: number;
  rightsComplete: number;
  rightsIncomplete: number;
  avgQuality: number;
  results: IntelligenceResult[];
}

let fetchFn: typeof fetch = globalThis.fetch;
export function setFetchOverride(fn: typeof fetch) { fetchFn = fn; }

async function loadImage(storagePath: string): Promise<Buffer> {
  const localPath = path.join(process.cwd(), "public", storagePath.replace(/^\//, ""));
  if (existsSync(localPath)) return readFile(localPath);
  const base = process.env.OBJECT_STORAGE_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "";
  if (base) {
    const resp = await _fetch(`${base}/${storagePath.replace(/^\//, "")}`);
    if (resp.ok) return Buffer.from(await resp.arrayBuffer());
  }
  throw new Error(`Cannot load: ${storagePath}`);
}

export async function runIntelligence(options: { dryRun?: boolean; limit?: number; force?: boolean } = {}): Promise<IntelligenceReport> {
  const prisma = new PrismaClient();
  resetDuplicateRegistry();

  const report: IntelligenceReport = {
    total: 0, completed: 0, failed: 0, exactDuplicates: 0, nearDuplicates: 0,
    hasFrame: 0, hasMat: 0, rightsComplete: 0, rightsIncomplete: 0,
    avgQuality: 0, results: [],
  };

  const records = await gatherMedia(prisma, options.limit);
  report.total = records.length;

  let qualitySum = 0;

  for (const rec of records) {
    const result: IntelligenceResult = { mediaId: rec.mediaId, status: "FAILED", checksum: "", quality: null, colors: null, duplicates: null, curatorial: null };

    try {
      if (options.dryRun) {
        result.status = "COMPLETED";
        report.completed++;
        report.results.push(result);
        continue;
      }

      // Check existing
      if (!options.force) {
        const existing = await prisma.assetIntelligence.findFirst({
          where: { mediaId: rec.mediaId, processingVersion: INTELLIGENCE_VERSION },
        });
        if (existing) { report.completed++; report.results.push(result); continue; }
      }

      const buffer = await loadImage(rec.storagePath);

      const quality = await analyzeQuality(buffer, rec.fileSize);
      result.quality = quality;
      qualitySum += quality.overall === "EXCELLENT" ? 1 : quality.overall === "GOOD" ? 0.75 : quality.overall === "FAIR" ? 0.5 : 0.25;

      const colors = await extractColors(buffer);
      result.colors = colors;

      const duplicates = await detectDuplicates(buffer, rec.mediaId);
      result.duplicates = duplicates;
      if (duplicates.isExactDuplicate) report.exactDuplicates++;
      if (duplicates.isNearDuplicate) report.nearDuplicates++;

      const curatorial = await analyzeCuratorial(buffer, colors);
      result.curatorial = curatorial;
      if (curatorial.hasFrame) report.hasFrame++;
      if (curatorial.hasInternalMat) report.hasMat++;

      if (rec.rightsComplete) report.rightsComplete++;
      else report.rightsIncomplete++;

      result.checksum = duplicates.checksum;
      result.status = "COMPLETED";

      // Persist
      await prisma.assetIntelligence.upsert({
        where: { mediaId_processingVersion: { mediaId: rec.mediaId, processingVersion: INTELLIGENCE_VERSION } },
        create: {
          mediaId: rec.mediaId, artworkId: rec.artworkId, checksum: duplicates.checksum,
          processingVersion: INTELLIGENCE_VERSION,
          format: quality.format, fileSize: rec.fileSize,
          dimensions: { width: quality.width, height: quality.height },
          resolution: quality.resolution, compression: quality.compressionRatio,
          hasExif: quality.hasExif,
          dominantColors: colors.dominantColors as any, palette: colors.palette as any,
          brightness: quality.aspectRatio !== undefined ? 0.5 : undefined, // placeholder — already in colors.brightness
          contrast: quality.aspectRatio !== undefined ? 0.5 : undefined,
          visualComplexity: curatorial.visualComplexity,
          visualWeight: curatorial.visualWeight,
          symmetryScore: curatorial.symmetryScore,
          negativeSpace: curatorial.negativeSpace,
          exactDuplicateGroup: duplicates.exactDuplicateGroup,
          perceptualHash: duplicates.perceptualHash,
          nearDuplicateGroup: duplicates.nearDuplicateGroup,
          hasFrame: curatorial.hasFrame,
          frameColor: curatorial.frameColor,
          frameWidth: curatorial.frameWidth,
          hasInternalMat: curatorial.hasInternalMat,
          matColor: curatorial.matColor,
          matWidth: curatorial.matWidth,
          primaryMedium: curatorial.primaryMedium,
          colorTemperature: colors.colorTemperature,
          visualPeriod: curatorial.visualPeriod,
          compositionType: curatorial.compositionType,
          qualityScore: quality.overall === "EXCELLENT" ? 1 : quality.overall === "GOOD" ? 0.75 : quality.overall === "FAIR" ? 0.5 : 0.25,
          qualityComponents: { sharpness: quality.sharpness, noise: quality.noiseLevel, contrast: quality.aspectRatio !== undefined ? 0.5 : undefined },
          rightsComplete: rec.rightsComplete,
          missingRights: rec.missingRights.length > 0 ? rec.missingRights : undefined,
          creditStatus: rec.creditStatus,
          confidence: { ...curatorial.confidence, colors: 0.85, quality: 0.9, duplicates: 0.95 },
        },
        update: { /* on force */ },
      });

      report.completed++;
    } catch (error) {
      result.error = error instanceof Error ? error.message : "Unknown";
      report.failed++;
    }

    report.results.push(result);
  }

  report.avgQuality = report.completed > 0 ? qualitySum / report.completed : 0;

  await prisma.$disconnect();
  return report;
}

async function gatherMedia(prisma: any, limit?: number): Promise<MediaRecord[]> {
  const records: MediaRecord[] = [];
  const artworks = await prisma.artwork.findMany({
    take: Math.min(limit ?? 500, 500),
    include: { primaryMedia: { select: { id: true, storagePath: true, filename: true, fileSize: true, mimeType: true, checksum: true } } },
    orderBy: { createdAt: "asc" },
  });
  for (const a of artworks) {
    if (!a.primaryMedia?.storagePath) continue;
    records.push({
      mediaId: a.primaryMedia.id, artworkId: a.id,
      storagePath: a.primaryMedia.storagePath, filename: a.primaryMedia.filename ?? "",
      fileSize: a.primaryMedia.fileSize ?? 0, mediaType: a.primaryMedia.mimeType ?? "image/jpeg",
      rightsComplete: !!a.primaryMedia.checksum,
      missingRights: a.primaryMedia.checksum ? [] : ["copyright", "license"],
      creditStatus: a.primaryMedia.checksum ? "complete" : "missing_copyright",
    });
  }
  return records;
}
