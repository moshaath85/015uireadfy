import type { Media, MediaType as PrismaMediaType } from "@prisma/client";
import type { MediaAsset, MediaType } from "@/lib/domain/media";

export type Tex7PrismaMediaEntity = MediaAsset &
  Record<string, unknown> & {
    readonly organization_id: string;
    readonly filename: string;
    readonly original_filename: string;
    readonly visibility: string;
    readonly archived_at?: string;
  };

const mediaTypeMap: Record<PrismaMediaType, MediaType> = {
  IMAGE: "image",
  VIDEO: "video",
  AUDIO: "audio",
  DOCUMENT: "document",
  OTHER: "other",
};

function toIsoString(value: Date | null | undefined): string | undefined {
  return value ? value.toISOString() : undefined;
}

export function mapPrismaMediaToDomain(record: Media): Tex7PrismaMediaEntity {
  const altText = record.altText ?? "";

  return {
    id: record.id,
    organization_id: record.organizationId,
    filename: record.filename,
    original_filename: record.originalFilename,
    url: record.storagePath,
    type: mediaTypeMap[record.mediaType],
    mime_type: record.mimeType,
    alt_en: altText,
    alt_ar: altText,
    width: record.width ?? undefined,
    height: record.height ?? undefined,
    file_size: record.fileSize,
    checksum: record.checksum ?? undefined,
    visibility: record.visibility.toLowerCase(),
    storage_provider: "external",
    storage_path: record.storagePath,
    created_at: toIsoString(record.createdAt),
    updated_at: toIsoString(record.updatedAt),
    archived_at: toIsoString(record.archivedAt),
  };
}