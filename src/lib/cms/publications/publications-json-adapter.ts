import { randomUUID } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { jsonFileTargets, type JsonWriteTarget } from "@/lib/database/json-file-types";
import { jsonWriter } from "@/lib/database/json-writer";
import type { JsonWriteGuardOptions } from "@/lib/database/json-write-guards";
import type { JsonWriteResult } from "@/lib/database/json-write-result";
import type { Publication } from "@/types";
import type { PublicationValidatedInput } from "./publications-validation";

export interface PublicationJsonSaveOptions extends JsonWriteGuardOptions {
  readonly now?: string;
}

export type PublicationJsonRecord = Publication & Record<string, unknown>;

const publicationsJsonWriteTarget: JsonWriteTarget<PublicationJsonRecord> = {
  file: {
    ...jsonFileTargets.publications,
    writeMode: "development_write_disabled",
    description: "Publication records prepared for guarded development-only create and update proof.",
  },
  idField: "id",
  slugField: "slug",
};

const publicationsJsonPath = path.join(process.cwd(), jsonFileTargets.publications.relativePath);

function readPublicationsFile(): PublicationJsonRecord[] {
  if (!existsSync(publicationsJsonPath)) {
    return [];
  }

  const raw = readFileSync(publicationsJsonPath, "utf8");
  const parsed = JSON.parse(raw) as unknown;

  return Array.isArray(parsed) ? (parsed as PublicationJsonRecord[]) : [];
}

function writePublicationsFile(records: readonly PublicationJsonRecord[]) {
  writeFileSync(publicationsJsonPath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

function validationFailure(
  operation: "create" | "update",
  message: string,
  details: readonly string[],
): JsonWriteResult<PublicationJsonRecord> {
  return {
    ok: false,
    operation,
    target: jsonFileTargets.publications.entity,
    reason: "invalid_payload",
    message,
    details,
  };
}

function createPublicationRecord(input: PublicationValidatedInput): PublicationJsonRecord {
  return {
    id: `pub-${randomUUID()}`,
    slug: input.slug,
    title_en: input.title_en,
    title_ar: input.title_ar,
    description_en: input.description_en,
    description_ar: input.description_ar,
    type: input.type,
    file_url: input.file_url,
    cover_image_id: input.cover_image_id,
    publish_date: input.publish_date,
    visibility_status: input.visibility_status,
  };
}

function updatePublicationRecord(
  existing: PublicationJsonRecord,
  input: PublicationValidatedInput,
): PublicationJsonRecord {
  return {
    ...existing,
    slug: input.slug,
    title_en: input.title_en,
    title_ar: input.title_ar,
    description_en: input.description_en,
    description_ar: input.description_ar,
    type: input.type,
    file_url: input.file_url,
    cover_image_id: input.cover_image_id,
    publish_date: input.publish_date,
    visibility_status: input.visibility_status,
  };
}

export function createPublicationJsonRecord(
  input: PublicationValidatedInput,
  options: PublicationJsonSaveOptions = {},
): JsonWriteResult<PublicationJsonRecord> {
  const record = createPublicationRecord(input);
  const guardResult = jsonWriter.write<PublicationJsonRecord>({
    operation: "create",
    target: publicationsJsonWriteTarget,
    record,
    options,
  });

  if (!guardResult.ok) {
    return guardResult;
  }

  const publications = readPublicationsFile();

  if (publications.some((publication) => publication.id === record.id || publication.slug === record.slug)) {
    return validationFailure("create", "Publication id or slug already exists.", [record.id, record.slug]);
  }

  writePublicationsFile([...publications, record]);

  return {
    ok: true,
    operation: "create",
    target: jsonFileTargets.publications.entity,
    record,
    message: "Development-only publication JSON create proof completed.",
  };
}

export function updatePublicationJsonRecord(
  publicationId: Publication["id"],
  input: PublicationValidatedInput,
  options: PublicationJsonSaveOptions = {},
): JsonWriteResult<PublicationJsonRecord> {
  const publications = readPublicationsFile();
  const publicationIndex = publications.findIndex((publication) => publication.id === publicationId);

  if (publicationIndex < 0) {
    return validationFailure("update", "Publication record was not found for update.", [publicationId]);
  }

  if (publications.some((publication) => publication.id !== publicationId && publication.slug === input.slug)) {
    return validationFailure("update", "Publication slug already belongs to another record.", [input.slug]);
  }

  const record = updatePublicationRecord(publications[publicationIndex], input);
  const guardResult = jsonWriter.write<PublicationJsonRecord>({
    operation: "update",
    target: publicationsJsonWriteTarget,
    record,
    options,
  });

  if (!guardResult.ok) {
    return guardResult;
  }

  writePublicationsFile(publications.map((publication) => (publication.id === publicationId ? record : publication)));

  return {
    ok: true,
    operation: "update",
    target: jsonFileTargets.publications.entity,
    record,
    message: "Development-only publication JSON update proof completed.",
  };
}