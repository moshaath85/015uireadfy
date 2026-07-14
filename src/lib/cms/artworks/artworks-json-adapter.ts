import { randomUUID } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { jsonFileTargets, type JsonWriteTarget } from "@/lib/database/json-file-types";
import { jsonWriter } from "@/lib/database/json-writer";
import type { JsonWriteGuardOptions } from "@/lib/database/json-write-guards";
import type { JsonWriteResult } from "@/lib/database/json-write-result";
import type { Artist, Artwork, Collection, Media } from "@/types";
import type { ArtworkValidatedInput } from "./artworks-validation";

export interface ArtworkJsonSaveOptions extends JsonWriteGuardOptions {
  readonly now?: string;
}

type WritableArtwork = Artwork & Record<string, unknown>;

const artworksJsonWriteTarget: JsonWriteTarget<WritableArtwork> = {
  file: {
    ...jsonFileTargets.artworks,
    writeMode: "development_write_disabled",
    description: "Artwork records prepared for guarded development-only create and update proof.",
  },
  idField: "id",
  slugField: "slug",
};

const artworksJsonPath = path.join(process.cwd(), jsonFileTargets.artworks.relativePath);
const artistsJsonPath = path.join(process.cwd(), jsonFileTargets.artists.relativePath);
const collectionsJsonPath = path.join(process.cwd(), jsonFileTargets.collections.relativePath);
const mediaJsonPath = path.join(process.cwd(), jsonFileTargets.media.relativePath);

function readJsonArray<TRecord>(filePath: string): TRecord[] {
  if (!existsSync(filePath)) {
    return [];
  }

  const raw = readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw) as unknown;

  return Array.isArray(parsed) ? (parsed as TRecord[]) : [];
}

function readArtworksFile(): Artwork[] {
  return readJsonArray<Artwork>(artworksJsonPath);
}

function writeArtworksFile(records: readonly Artwork[]) {
  writeFileSync(artworksJsonPath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

function validateArtworkReferences(input: ArtworkValidatedInput): readonly string[] {
  const artists = readJsonArray<Artist>(artistsJsonPath);
  const collections = readJsonArray<Collection>(collectionsJsonPath);
  const media = readJsonArray<Media>(mediaJsonPath);
  const issues: string[] = [];

  if (!artists.some((artist) => artist.id === input.artist_id)) {
    issues.push(`artist_id:${input.artist_id}`);
  }

  if (input.collection_id && !collections.some((collection) => collection.id === input.collection_id)) {
    issues.push(`collection_id:${input.collection_id}`);
  }

  if (input.primary_image_id && !media.some((item) => item.id === input.primary_image_id)) {
    issues.push(`primary_image_id:${input.primary_image_id}`);
  }

  return issues;
}

function validateArtworkShape(input: ArtworkValidatedInput): readonly string[] {
  const issues: string[] = [];

  if (!input.slug || !input.title_en || !input.title_ar) {
    issues.push("identity_fields");
  }

  if (!input.artist_id) {
    issues.push("artist_id");
  }

  if (!Number.isInteger(input.year)) {
    issues.push("year");
  }

  if (!input.medium_en || !input.medium_ar || !input.dimensions) {
    issues.push("detail_fields");
  }

  if (!input.currency || !input.price_status || !input.availability_status || !input.visibility_status) {
    issues.push("status_fields");
  }

  if (!Number.isInteger(input.display_order)) {
    issues.push("display_order");
  }

  return issues;
}

function validationFailure(
  operation: "create" | "update",
  message: string,
  details: readonly string[],
): JsonWriteResult<Artwork> {
  return {
    ok: false,
    operation,
    target: jsonFileTargets.artworks.entity,
    reason: "invalid_payload",
    message,
    details,
  };
}

function createArtworkRecord(input: ArtworkValidatedInput, now: string): Artwork {
  return {
    id: `aw-${randomUUID()}`,
    slug: input.slug,
    title_en: input.title_en,
    title_ar: input.title_ar,
    artist_id: input.artist_id,
    collection_id: input.collection_id,
    year: input.year,
    medium_en: input.medium_en,
    medium_ar: input.medium_ar,
    dimensions: input.dimensions,
    description_en: input.description_en,
    description_ar: input.description_ar,
    price: input.price,
    currency: input.currency,
    price_status: input.price_status,
    availability_status: input.availability_status,
    visibility_status: input.visibility_status,
    primary_image_id: input.primary_image_id,
    featured: input.featured,
    display_order: input.display_order,
    is_featured_homepage: input.is_featured_homepage,
    created_at: now,
    updated_at: now,
  };
}

function updateArtworkRecord(existing: Artwork, input: ArtworkValidatedInput, now: string): Artwork {
  return {
    ...existing,
    slug: input.slug,
    title_en: input.title_en,
    title_ar: input.title_ar,
    artist_id: input.artist_id,
    collection_id: input.collection_id,
    year: input.year,
    medium_en: input.medium_en,
    medium_ar: input.medium_ar,
    dimensions: input.dimensions,
    description_en: input.description_en,
    description_ar: input.description_ar,
    price: input.price,
    currency: input.currency,
    price_status: input.price_status,
    availability_status: input.availability_status,
    visibility_status: input.visibility_status,
    primary_image_id: input.primary_image_id,
    featured: input.featured,
    display_order: input.display_order,
    is_featured_homepage: input.is_featured_homepage,
    updated_at: now,
  };
}

export function createArtworkJsonRecord(
  input: ArtworkValidatedInput,
  options: ArtworkJsonSaveOptions = {},
): JsonWriteResult<Artwork> {
  const shapeIssues = validateArtworkShape(input);

  if (shapeIssues.length > 0) {
    return validationFailure("create", "Artwork payload shape is invalid.", shapeIssues);
  }

  const referenceIssues = validateArtworkReferences(input);

  if (referenceIssues.length > 0) {
    return validationFailure("create", "Artwork relationship references could not be validated.", referenceIssues);
  }

  const now = options.now ?? new Date().toISOString();
  const record = createArtworkRecord(input, now);
  const guardResult = jsonWriter.write<WritableArtwork>({
    operation: "create",
    target: artworksJsonWriteTarget,
    record: record as WritableArtwork,
    options,
  });

  if (!guardResult.ok) {
    return guardResult;
  }

  const artworks = readArtworksFile();

  if (artworks.some((artwork) => artwork.id === record.id || artwork.slug === record.slug)) {
    return validationFailure("create", "Artwork id or slug already exists.", [record.id, record.slug]);
  }

  writeArtworksFile([...artworks, record]);

  return {
    ok: true,
    operation: "create",
    target: jsonFileTargets.artworks.entity,
    record,
    message: "Development-only artwork JSON create proof completed.",
  };
}

export function updateArtworkJsonRecord(
  artworkId: Artwork["id"],
  input: ArtworkValidatedInput,
  options: ArtworkJsonSaveOptions = {},
): JsonWriteResult<Artwork> {
  const shapeIssues = validateArtworkShape(input);

  if (shapeIssues.length > 0) {
    return validationFailure("update", "Artwork payload shape is invalid.", shapeIssues);
  }

  const referenceIssues = validateArtworkReferences(input);

  if (referenceIssues.length > 0) {
    return validationFailure("update", "Artwork relationship references could not be validated.", referenceIssues);
  }

  const artworks = readArtworksFile();
  const artworkIndex = artworks.findIndex((artwork) => artwork.id === artworkId);

  if (artworkIndex < 0) {
    return validationFailure("update", "Artwork record was not found for update.", [artworkId]);
  }

  if (artworks.some((artwork) => artwork.id !== artworkId && artwork.slug === input.slug)) {
    return validationFailure("update", "Artwork slug already belongs to another record.", [input.slug]);
  }

  const now = options.now ?? new Date().toISOString();
  const record = updateArtworkRecord(artworks[artworkIndex], input, now);
  const guardResult = jsonWriter.write<WritableArtwork>({
    operation: "update",
    target: artworksJsonWriteTarget,
    record: record as WritableArtwork,
    options,
  });

  if (!guardResult.ok) {
    return guardResult;
  }

  const nextArtworks = artworks.map((artwork) => (artwork.id === artworkId ? record : artwork));
  writeArtworksFile(nextArtworks);

  return {
    ok: true,
    operation: "update",
    target: jsonFileTargets.artworks.entity,
    record,
    message: "Development-only artwork JSON update proof completed.",
  };
}