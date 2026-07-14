import {
  AvailabilityStatus,
  PriceStatus,
  VisibilityStatus,
  type Artwork,
} from "@/types";

export type ArtworkValidatedInput = Pick<
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

export type ArtworkValidationSource = FormData | Record<string, unknown>;

export interface ArtworkFormValidationIssue {
  readonly field: keyof ArtworkValidatedInput;
  readonly message: string;
}

export interface ArtworkFormValidationSuccess {
  readonly valid: true;
  readonly data: ArtworkValidatedInput;
  readonly issues: readonly [];
}

export interface ArtworkFormValidationFailure {
  readonly valid: false;
  readonly data: null;
  readonly issues: readonly ArtworkFormValidationIssue[];
}

export type ArtworkFormValidationResult =
  | ArtworkFormValidationSuccess
  | ArtworkFormValidationFailure;

const availabilityStatuses = new Set<string>(Object.values(AvailabilityStatus));
const priceStatuses = new Set<string>(Object.values(PriceStatus));
const visibilityStatuses = new Set<string>(Object.values(VisibilityStatus));

function readValue(source: ArtworkValidationSource, key: keyof ArtworkValidatedInput): unknown {
  if (typeof FormData !== "undefined" && source instanceof FormData) {
    return source.get(key);
  }

  return (source as Record<string, unknown>)[key];
}

function optionalString(
  source: ArtworkValidationSource,
  key: keyof ArtworkValidatedInput,
): string | undefined {
  const value = readValue(source, key);

  if (value === null || value === undefined) {
    return undefined;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
}

function requiredString(
  source: ArtworkValidationSource,
  key: keyof ArtworkValidatedInput,
  label: string,
  issues: ArtworkFormValidationIssue[],
): string {
  const value = optionalString(source, key);

  if (!value) {
    issues.push({ field: key, message: `${label} is required.` });
    return "";
  }

  return value;
}

function optionalNumber(
  source: ArtworkValidationSource,
  key: keyof ArtworkValidatedInput,
  label: string,
  issues: ArtworkFormValidationIssue[],
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
  source: ArtworkValidationSource,
  key: keyof ArtworkValidatedInput,
  label: string,
  issues: ArtworkFormValidationIssue[],
): number {
  const value = optionalNumber(source, key, label, issues);

  if (value === null || value === undefined) {
    issues.push({ field: key, message: `${label} is required.` });
    return 0;
  }

  return value;
}

function booleanValue(source: ArtworkValidationSource, key: keyof ArtworkValidatedInput): boolean {
  const value = readValue(source, key);

  if (typeof value === "boolean") {
    return value;
  }

  const text = String(value ?? "").trim().toLowerCase();
  return text === "true" || text === "1" || text === "on" || text === "yes";
}

export function validateArtworkFormInput(source: ArtworkValidationSource): ArtworkFormValidationResult {
  const issues: ArtworkFormValidationIssue[] = [];

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

  if (priceStatus && !priceStatuses.has(priceStatus)) {
    issues.push({ field: "price_status", message: "Price status is not supported." });
  }

  if (availabilityStatus && !availabilityStatuses.has(availabilityStatus)) {
    issues.push({ field: "availability_status", message: "Availability status is not supported." });
  }

  if (visibilityStatus && !visibilityStatuses.has(visibilityStatus)) {
    issues.push({ field: "visibility_status", message: "Visibility status is not supported." });
  }

  if (issues.length > 0) {
    return {
      valid: false,
      data: null,
      issues,
    };
  }

  return {
    valid: true,
    data: {
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
    },
    issues: [],
  };
}