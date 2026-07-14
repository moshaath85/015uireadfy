import { randomUUID } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { jsonFileTargets, type JsonWriteTarget } from "@/lib/database/json-file-types";
import { jsonWriter } from "@/lib/database/json-writer";
import type { JsonWriteGuardOptions } from "@/lib/database/json-write-guards";
import type { JsonWriteResult } from "@/lib/database/json-write-result";
import type { Collection } from "@/types";
import type { CollectionValidatedInput } from "./collections-validation";

export interface CollectionJsonSaveOptions extends JsonWriteGuardOptions {
  readonly now?: string;
}

type WritableCollection = Collection & Record<string, unknown>;

const collectionsJsonWriteTarget: JsonWriteTarget<WritableCollection> = {
  file: {
    ...jsonFileTargets.collections,
    writeMode: "development_write_disabled",
    description: "Collection records prepared for guarded development-only create and update proof.",
  },
  idField: "id",
  slugField: "slug",
};

const collectionsJsonPath = path.join(process.cwd(), "data", "collections.json");

function readCollectionsFile(): Collection[] {
  if (!existsSync(collectionsJsonPath)) {
    return [];
  }

  const raw = readFileSync(collectionsJsonPath, "utf8");
  const parsed = JSON.parse(raw) as unknown;

  return Array.isArray(parsed) ? (parsed as Collection[]) : [];
}

function writeCollectionsFile(records: readonly Collection[]) {
  writeFileSync(collectionsJsonPath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

function validateCollectionShape(input: CollectionValidatedInput): readonly string[] {
  const issues: string[] = [];

  if (!input.slug || !input.title_en || !input.title_ar) {
    issues.push("identity_fields");
  }

  if (!input.description_en || !input.description_ar) {
    issues.push("description_fields");
  }

  if (!input.visibility_status) {
    issues.push("visibility_status");
  }

  return issues;
}

function validationFailure(
  operation: "create" | "update",
  message: string,
  details: readonly string[],
): JsonWriteResult<Collection> {
  return {
    ok: false,
    operation,
    target: jsonFileTargets.collections.entity,
    reason: "invalid_payload",
    message,
    details,
  };
}

function createCollectionRecord(input: CollectionValidatedInput, now: string): Collection {
  return {
    id: `col-${randomUUID()}`,
    slug: input.slug,
    title_en: input.title_en,
    title_ar: input.title_ar,
    description_en: input.description_en,
    description_ar: input.description_ar,
    visibility_status: input.visibility_status,
    created_at: now,
    updated_at: now,
  };
}

function updateCollectionRecord(existing: Collection, input: CollectionValidatedInput, now: string): Collection {
  return {
    ...existing,
    slug: input.slug,
    title_en: input.title_en,
    title_ar: input.title_ar,
    description_en: input.description_en,
    description_ar: input.description_ar,
    visibility_status: input.visibility_status,
    updated_at: now,
  };
}

export function createCollectionJsonRecord(
  input: CollectionValidatedInput,
  options: CollectionJsonSaveOptions = {},
): JsonWriteResult<Collection> {
  const shapeIssues = validateCollectionShape(input);

  if (shapeIssues.length > 0) {
    return validationFailure("create", "Collection payload shape is invalid.", shapeIssues);
  }

  const now = options.now ?? new Date().toISOString();
  const record = createCollectionRecord(input, now);
  const guardResult = jsonWriter.write<WritableCollection>({
    operation: "create",
    target: collectionsJsonWriteTarget,
    record: record as WritableCollection,
    options,
  });

  if (!guardResult.ok) {
    return guardResult;
  }

  const collections = readCollectionsFile();

  if (collections.some((collection) => collection.id === record.id || collection.slug === record.slug)) {
    return validationFailure("create", "Collection id or slug already exists.", [record.id, record.slug]);
  }

  writeCollectionsFile([...collections, record]);

  return {
    ok: true,
    operation: "create",
    target: jsonFileTargets.collections.entity,
    record,
    message: "Development-only collection JSON create proof completed.",
  };
}

export function updateCollectionJsonRecord(
  collectionId: Collection["id"],
  input: CollectionValidatedInput,
  options: CollectionJsonSaveOptions = {},
): JsonWriteResult<Collection> {
  const shapeIssues = validateCollectionShape(input);

  if (shapeIssues.length > 0) {
    return validationFailure("update", "Collection payload shape is invalid.", shapeIssues);
  }

  const collections = readCollectionsFile();
  const collectionIndex = collections.findIndex((collection) => collection.id === collectionId);

  if (collectionIndex < 0) {
    return validationFailure("update", "Collection record was not found for update.", [collectionId]);
  }

  if (collections.some((collection) => collection.id !== collectionId && collection.slug === input.slug)) {
    return validationFailure("update", "Collection slug already belongs to another record.", [input.slug]);
  }

  const now = options.now ?? new Date().toISOString();
  const record = updateCollectionRecord(collections[collectionIndex], input, now);
  const guardResult = jsonWriter.write<WritableCollection>({
    operation: "update",
    target: collectionsJsonWriteTarget,
    record: record as WritableCollection,
    options,
  });

  if (!guardResult.ok) {
    return guardResult;
  }

  const nextCollections = collections.map((collection) => (collection.id === collectionId ? record : collection));
  writeCollectionsFile(nextCollections);

  return {
    ok: true,
    operation: "update",
    target: jsonFileTargets.collections.entity,
    record,
    message: "Development-only collection JSON update proof completed.",
  };
}