import { randomUUID } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { artistsJsonWriteTarget, type JsonWriteTarget } from "@/lib/database/json-file-types";
import { jsonWriter } from "@/lib/database/json-writer";
import type { JsonWriteGuardOptions } from "@/lib/database/json-write-guards";
import type { JsonWriteResult } from "@/lib/database/json-write-result";
import { VisibilityStatus, type Artist } from "@/types";
import type { ArtistMutationInput } from "./artists-validation";

export interface ArtistJsonSaveOptions extends JsonWriteGuardOptions {
  readonly now?: string;
}

type WritableArtist = Artist & Record<string, unknown>;

const writableArtistsTarget = artistsJsonWriteTarget as JsonWriteTarget<WritableArtist>;
const artistsJsonPath = path.join(process.cwd(), artistsJsonWriteTarget.file.relativePath);

function readArtistsFile(): Artist[] {
  if (!existsSync(artistsJsonPath)) {
    return [];
  }

  const raw = readFileSync(artistsJsonPath, "utf8");
  const parsed = JSON.parse(raw) as unknown;

  return Array.isArray(parsed) ? (parsed as Artist[]) : [];
}

function writeArtistsFile(records: readonly Artist[]) {
  writeFileSync(artistsJsonPath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

function createArtistRecord(input: ArtistMutationInput, now: string): Artist {
  return {
    id: `art-${randomUUID()}`,
    slug: input.slug,
    name_en: input.name_en,
    name_ar: input.name_ar,
    bio_en: input.bio_en,
    bio_ar: input.bio_ar,
    birth_year: input.birth_year,
    nationality_en: input.nationality_en,
    nationality_ar: input.nationality_ar,
    website: input.website,
    email: input.email,
    instagram: input.instagram,
    profile_image_id: input.profile_image_id,
    featured: input.featured,
    display_order: input.display_order,
    representation_status: input.representation_status,
    visibility_status: input.visibility_status as VisibilityStatus,
    created_at: now,
    updated_at: now,
  };
}

function updateArtistRecord(existing: Artist, input: ArtistMutationInput, now: string): Artist {
  return {
    ...existing,
    slug: input.slug,
    name_en: input.name_en,
    name_ar: input.name_ar,
    bio_en: input.bio_en,
    bio_ar: input.bio_ar,
    birth_year: input.birth_year,
    nationality_en: input.nationality_en,
    nationality_ar: input.nationality_ar,
    website: input.website,
    email: input.email,
    instagram: input.instagram,
    profile_image_id: input.profile_image_id,
    featured: input.featured,
    display_order: input.display_order,
    representation_status: input.representation_status,
    visibility_status: input.visibility_status as VisibilityStatus,
    updated_at: now,
  };
}

export function createArtistJsonRecord(
  input: ArtistMutationInput,
  options: ArtistJsonSaveOptions = {},
): JsonWriteResult<Artist> {
  const now = options.now ?? new Date().toISOString();
  const record = createArtistRecord(input, now);
  const guardResult = jsonWriter.write<WritableArtist>({
    operation: "create",
    target: writableArtistsTarget,
    record: record as WritableArtist,
    options,
  });

  if (!guardResult.ok) {
    return guardResult;
  }

  const artists = readArtistsFile();

  if (artists.some((artist) => artist.id === record.id || artist.slug === record.slug)) {
    return {
      ok: false,
      operation: "create",
      target: artistsJsonWriteTarget.file.entity,
      reason: "invalid_payload",
      message: "Artist id or slug already exists.",
      details: [record.id, record.slug],
    };
  }

  writeArtistsFile([...artists, record]);

  return {
    ok: true,
    operation: "create",
    target: artistsJsonWriteTarget.file.entity,
    record,
    message: "Development-only artist JSON create proof completed.",
  };
}

export function updateArtistJsonRecord(
  artistId: Artist["id"],
  input: ArtistMutationInput,
  options: ArtistJsonSaveOptions = {},
): JsonWriteResult<Artist> {
  const artists = readArtistsFile();
  const artistIndex = artists.findIndex((artist) => artist.id === artistId);

  if (artistIndex < 0) {
    return {
      ok: false,
      operation: "update",
      target: artistsJsonWriteTarget.file.entity,
      reason: "invalid_payload",
      message: "Artist record was not found for update.",
      details: [artistId],
    };
  }

  if (artists.some((artist) => artist.id !== artistId && artist.slug === input.slug)) {
    return {
      ok: false,
      operation: "update",
      target: artistsJsonWriteTarget.file.entity,
      reason: "invalid_payload",
      message: "Artist slug already belongs to another record.",
      details: [input.slug],
    };
  }

  const now = options.now ?? new Date().toISOString();
  const record = updateArtistRecord(artists[artistIndex], input, now);
  const guardResult = jsonWriter.write<WritableArtist>({
    operation: "update",
    target: writableArtistsTarget,
    record: record as WritableArtist,
    options,
  });

  if (!guardResult.ok) {
    return guardResult;
  }

  const nextArtists = artists.map((artist) => (artist.id === artistId ? record : artist));
  writeArtistsFile(nextArtists);

  return {
    ok: true,
    operation: "update",
    target: artistsJsonWriteTarget.file.entity,
    record,
    message: "Development-only artist JSON update proof completed.",
  };
}