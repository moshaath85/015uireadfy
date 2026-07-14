import {
  createRuntimeEngine,
  runtimeSuccess,
  runtimeValidationFailure,
  type RuntimeExecutionContext,
  type RuntimeIssue,
  type RuntimeListData,
  type RuntimeResult,
} from "@/lib/runtime";
import { artworksRepository } from "@/lib/repositories/artworks";
import {
  AvailabilityStatus,
  PriceStatus,
  VisibilityStatus,
  type Artwork,
} from "@/types";

export type ArtworkMutationInput = Pick<
  Artwork,
  | "slug"
  | "title_en"
  | "title_ar"
  | "artist_id"
  | "collection_id"
  | "year"
  | "medium_en"
  | "medium_ar"
  | "dimensions"
  | "description_en"
  | "description_ar"
  | "price"
  | "currency"
  | "price_status"
  | "availability_status"
  | "visibility_status"
  | "primary_image_id"
  | "featured"
  | "is_featured_homepage"
  | "display_order"
>;

export type ArtworkFormSource = Record<string, unknown>;

export interface ArtworkRuntimeUpdateInput {
  readonly artworkId: Artwork["id"];
  readonly source: ArtworkFormSource;
}

export interface ArtworkValidationIssue {
  readonly field: keyof ArtworkMutationInput;
  readonly message: string;
}

export type ArtworkRuntimeValidationResult = RuntimeResult<ArtworkMutationInput>;
export type ArtworkRuntimeListResult = RuntimeResult<RuntimeListData<Artwork>>;
export type ArtworkRuntimeReadResult = RuntimeResult<Artwork>;

const artworksRuntimeContext: RuntimeExecutionContext = {
  module: "artworks",
};

const artworkAvailabilityStatuses = new Set<string>(Object.values(AvailabilityStatus));
const artworkPriceStatuses = new Set<string>(Object.values(PriceStatus));
const artworkVisibilityStatuses = new Set<string>(Object.values(VisibilityStatus));

function toRuntimeIssues(issues: readonly ArtworkValidationIssue[]): readonly RuntimeIssue[] {
  return issues.map((issue) => ({
    field: issue.field,
    message: issue.message,
  }));
}

function readValue(source: ArtworkFormSource, key: keyof ArtworkMutationInput): unknown {
  return source[key];
}

function optionalString(source: ArtworkFormSource, key: keyof ArtworkMutationInput): string | undefined {
  const value = readValue(source, key);

  if (value === null || value === undefined) {
    return undefined;
  }

  const text = String(value).trim();

  return text.length > 0 ? text : undefined;
}

function requiredString(
  source: ArtworkFormSource,
  key: keyof ArtworkMutationInput,
  label: string,
  issues: ArtworkValidationIssue[],
): string {
  const value = optionalString(source, key);

  if (!value) {
    issues.push({ field: key, message: `${label} is required.` });
    return "";
  }

  return value;
}

function optionalNumber(
  source: ArtworkFormSource,
  key: keyof ArtworkMutationInput,
  label: string,
  issues: ArtworkValidationIssue[],
): number | null | undefined {
  const value = readValue(source, key);

  if (value === null) {
    return null;
  }

  if (value === undefined || String(value).trim() === "") {
    return undefined;
  }

  const numericValue = typeof value === "number" ? value : Number(String(value).trim());

  if (!Number.isFinite(numericValue)) {
    issues.push({ field: key, message: `${label} must be a valid number.` });
    return undefined;
  }

  return numericValue;
}

function requiredNumber(
  source: ArtworkFormSource,
  key: keyof ArtworkMutationInput,
  label: string,
  issues: ArtworkValidationIssue[],
): number {
  const value = optionalNumber(source, key, label, issues);

  if (value === null || value === undefined) {
    issues.push({ field: key, message: `${label} is required.` });
    return 0;
  }

  return value;
}

function booleanValue(source: ArtworkFormSource, key: keyof ArtworkMutationInput): boolean {
  const value = readValue(source, key);

  if (typeof value === "boolean") {
    return value;
  }

  const text = String(value ?? "").trim().toLowerCase();

  return text === "true" || text === "1" || text === "on" || text === "yes";
}

function validateArtworkRuntimeSource(source: ArtworkFormSource): ArtworkRuntimeValidationResult {
  const issues: ArtworkValidationIssue[] = [];

  const slug = requiredString(source, "slug", "Slug", issues);
  const titleEn = requiredString(source, "title_en", "English title", issues);
  const titleAr = requiredString(source, "title_ar", "Arabic title", issues);
  const artistId = requiredString(source, "artist_id", "Artist", issues);
  const year = requiredNumber(source, "year", "Year", issues);
  const mediumEn = requiredString(source, "medium_en", "English medium", issues);
  const mediumAr = requiredString(source, "medium_ar", "Arabic medium", issues);
  const dimensions = requiredString(source, "dimensions", "Dimensions", issues);
  const descriptionEn = requiredString(source, "description_en", "English description", issues);
  const descriptionAr = requiredString(source, "description_ar", "Arabic description", issues);
  const currency = requiredString(source, "currency", "Currency", issues);
  const priceStatus = requiredString(source, "price_status", "Price status", issues);
  const availabilityStatus = requiredString(source, "availability_status", "Availability", issues);
  const visibilityStatus = requiredString(source, "visibility_status", "Visibility", issues);
  const displayOrder = requiredNumber(source, "display_order", "Display order", issues);
  const price = optionalNumber(source, "price", "Price", issues);

  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    issues.push({ field: "slug", message: "Slug must use lowercase letters, numbers, and hyphens only." });
  }

  if (year !== 0 && (!Number.isInteger(year) || year < 1000 || year > new Date().getFullYear() + 5)) {
    issues.push({ field: "year", message: "Year must be a valid artwork year." });
  }

  if (!Number.isInteger(displayOrder)) {
    issues.push({ field: "display_order", message: "Display order must be a whole number." });
  }

  if (price !== null && price !== undefined && price < 0) {
    issues.push({ field: "price", message: "Price must not be negative." });
  }

  if (priceStatus && !artworkPriceStatuses.has(priceStatus)) {
    issues.push({ field: "price_status", message: "Price status is not supported." });
  }

  if (availabilityStatus && !artworkAvailabilityStatuses.has(availabilityStatus)) {
    issues.push({ field: "availability_status", message: "Availability status is not supported." });
  }

  if (visibilityStatus && !artworkVisibilityStatuses.has(visibilityStatus)) {
    issues.push({ field: "visibility_status", message: "Visibility status is not supported." });
  }

  if (issues.length > 0) {
    return runtimeValidationFailure("validate", toRuntimeIssues(issues), "Artwork input could not be validated.");
  }

  return runtimeSuccess("validate", {
    slug,
    title_en: titleEn,
    title_ar: titleAr,
    artist_id: artistId,
    collection_id: optionalString(source, "collection_id") ?? null,
    year,
    medium_en: mediumEn,
    medium_ar: mediumAr,
    dimensions,
    description_en: descriptionEn,
    description_ar: descriptionAr,
    price,
    currency,
    price_status: priceStatus as PriceStatus,
    availability_status: availabilityStatus as AvailabilityStatus,
    visibility_status: visibilityStatus as VisibilityStatus,
    primary_image_id: optionalString(source, "primary_image_id"),
    featured: booleanValue(source, "featured"),
    is_featured_homepage: booleanValue(source, "is_featured_homepage"),
    display_order: displayOrder,
  });
}

function validateArtworkRuntimeUpdateInput(input: ArtworkRuntimeUpdateInput): RuntimeResult<ArtworkRuntimeUpdateInput> {
  const validation = validateArtworkRuntimeSource(input.source);

  if (!validation.ok) {
    return validation;
  }

  return runtimeSuccess("validate", input);
}

async function findArtworkByRuntimeId(id: string | number): Promise<Artwork | null> {
  const runtimeId = String(id);
  const artworks = await artworksRepository.getAll();

  return artworks.find((artwork) => artwork.id === runtimeId || artwork.slug === runtimeId) ?? null;
}

export const artworksRuntime = createRuntimeEngine<Artwork, ArtworkFormSource, ArtworkRuntimeUpdateInput>({
  async list() {
    const artworks = await artworksRepository.getAll();

    return {
      items: artworks,
      total: artworks.length,
    };
  },

  read(request) {
    return findArtworkByRuntimeId(request.id);
  },

  validateCreate(source) {
    return validateArtworkRuntimeSource(source);
  },

  validateUpdate(input) {
    return validateArtworkRuntimeUpdateInput(input);
  },
});

export function listArtworksRuntime(
  context: RuntimeExecutionContext = artworksRuntimeContext,
): Promise<ArtworkRuntimeListResult> {
  return artworksRuntime.list({}, context);
}

export function readArtworkRuntime(
  artworkId: Artwork["id"],
  context: RuntimeExecutionContext = artworksRuntimeContext,
): Promise<ArtworkRuntimeReadResult> {
  return artworksRuntime.read({ id: artworkId }, context);
}

export async function validateCreateArtworkRuntime(
  source: ArtworkFormSource,
  _context: RuntimeExecutionContext = artworksRuntimeContext,
): Promise<ArtworkRuntimeValidationResult> {
  return validateArtworkRuntimeSource(source);
}

export async function validateUpdateArtworkRuntime(
  input: ArtworkRuntimeUpdateInput,
  _context: RuntimeExecutionContext = artworksRuntimeContext,
): Promise<ArtworkRuntimeValidationResult> {
  return validateArtworkRuntimeSource(input.source);
}