import { randomUUID } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { jsonFileTargets, type JsonWriteTarget } from "@/lib/database/json-file-types";
import type { JsonWriteGuardOptions } from "@/lib/database/json-write-guards";
import type { JsonWriteResult } from "@/lib/database/json-write-result";
import { jsonWriter } from "@/lib/database/json-writer";
import type { Media } from "@/types";
import type { MediaValidatedInput } from "./media-validation";

export type MediaJsonRecord = Media & Record<string, unknown>;

export interface MediaJsonSaveOptions extends JsonWriteGuardOptions {
  readonly now?: string;
}

const mediaJsonWriteTarget: JsonWriteTarget<MediaJsonRecord> = {
  file: {
    ...jsonFileTargets.media,
    writeMode: "development_write_disabled",
    description: "Media records prepared for guarded development-only create and update proof.",
  },
  idField: "id",
};

const mediaJsonPath = path.join(process.cwd(), jsonFileTargets.media.relativePath);

function readMediaFile(): MediaJsonRecord[] {
  if (!existsSync(mediaJsonPath)) {
    return [];
  }

  const raw = readFileSync(mediaJsonPath, "utf8");
  const parsed = JSON.parse(raw) as unknown;

  return Array.isArray(parsed) ? (parsed as MediaJsonRecord[]) : [];
}

function writeMediaFile(records: readonly MediaJsonRecord[]) {
  writeFileSync(mediaJsonPath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

function validationFailure(
  operation: "create" | "update",
  message: string,
  details: readonly string[],
): JsonWriteResult<MediaJsonRecord> {
  return {
    ok: false,
    operation,
    target: jsonFileTargets.media.entity,
    reason: "invalid_payload",
    message,
    details,
  };
}

function createMediaRecord(input: MediaValidatedInput, now: string): MediaJsonRecord {
  return {
    id: `media-${randomUUID()}`,
    url: input.url,
    alt_en: input.alt_en,
    alt_ar: input.alt_ar,
    type: input.type,
    mime_type: input.mime_type,
    width: input.width,
    height: input.height,
    file_size: input.file_size,
    checksum: input.checksum,
    dominant_color: input.dominant_color,
    copyright: input.copyright,
    photographer: input.photographer,
    license: input.license,
    created_by: input.created_by,
    updated_at: now,
    storage_provider: input.storage_provider,
    storage_path: input.storage_path,
    created_at: now,
  };
}

function updateMediaRecord(existing: MediaJsonRecord, input: MediaValidatedInput, now: string): MediaJsonRecord {
  return {
    ...existing,
    url: input.url,
    alt_en: input.alt_en,
    alt_ar: input.alt_ar,
    type: input.type,
    mime_type: input.mime_type,
    width: input.width,
    height: input.height,
    file_size: input.file_size,
    checksum: input.checksum,
    dominant_color: input.dominant_color,
    copyright: input.copyright,
    photographer: input.photographer,
    license: input.license,
    created_by: input.created_by,
    updated_at: now,
    storage_provider: input.storage_provider,
    storage_path: input.storage_path,
  };
}

export function createMediaJsonRecord(
  input: MediaValidatedInput,
  options: MediaJsonSaveOptions = {},
): JsonWriteResult<MediaJsonRecord> {
  const now = options.now ?? new Date().toISOString();
  const record = createMediaRecord(input, now);
  const guardResult = jsonWriter.write<MediaJsonRecord>({
    operation: "create",
    target: mediaJsonWriteTarget,
    record,
    options,
  });

  if (!guardResult.ok) {
    return guardResult;
  }

  const media = readMediaFile();

  if (media.some((item) => item.id === record.id || item.storage_path === record.storage_path)) {
    return validationFailure("create", "Media id or storage path already exists.", [record.id, record.storage_path]);
  }

  writeMediaFile([...media, record]);

  return {
    ok: true,
    operation: "create",
    target: jsonFileTargets.media.entity,
    record,
    message: "Development-only media JSON create proof completed.",
  };
}

export function updateMediaJsonRecord(
  mediaId: Media["id"],
  input: MediaValidatedInput,
  options: MediaJsonSaveOptions = {},
): JsonWriteResult<MediaJsonRecord> {
  const media = readMediaFile();
  const mediaIndex = media.findIndex((item) => item.id === mediaId);

  if (mediaIndex < 0) {
    return validationFailure("update", "Media record was not found for update.", [mediaId]);
  }

  if (media.some((item) => item.id !== mediaId && item.storage_path === input.storage_path)) {
    return validationFailure("update", "Media storage path already belongs to another record.", [input.storage_path]);
  }

  const now = options.now ?? new Date().toISOString();
  const record = updateMediaRecord(media[mediaIndex], input, now);
  const guardResult = jsonWriter.write<MediaJsonRecord>({
    operation: "update",
    target: mediaJsonWriteTarget,
    record,
    options,
  });

  if (!guardResult.ok) {
    return guardResult;
  }

  writeMediaFile(media.map((item) => (item.id === mediaId ? record : item)));

  return {
    ok: true,
    operation: "update",
    target: jsonFileTargets.media.entity,
    record,
    message: "Development-only media JSON update proof completed.",
  };
}
