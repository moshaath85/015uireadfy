import { VisibilityStatus, type Artist } from "@/types";

export type ArtistMutationInput = Pick<
  Artist,
  | "slug"
  | "name_en"
  | "name_ar"
  | "bio_en"
  | "bio_ar"
  | "birth_year"
  | "nationality_en"
  | "nationality_ar"
  | "website"
  | "email"
  | "instagram"
  | "profile_image_id"
  | "featured"
  | "display_order"
  | "representation_status"
  | "visibility_status"
>;

export type ArtistFormSource = FormData | Record<string, unknown>;

export interface ArtistValidationIssue {
  readonly field: keyof ArtistMutationInput;
  readonly message: string;
}

export interface ArtistValidationSuccess {
  readonly valid: true;
  readonly data: ArtistMutationInput;
  readonly issues: readonly [];
}

export interface ArtistValidationFailure {
  readonly valid: false;
  readonly data: null;
  readonly issues: readonly ArtistValidationIssue[];
}

export type ArtistValidationResult = ArtistValidationSuccess | ArtistValidationFailure;

const representationStatuses = new Set(["represented", "collaborating", "archived"]);
const visibilityStatuses = new Set<string>(Object.values(VisibilityStatus));

function readValue(source: ArtistFormSource, key: keyof ArtistMutationInput): unknown {
  if (typeof FormData !== "undefined" && source instanceof FormData) {
    return source.get(key);
  }

  return (source as Record<string, unknown>)[key];
}

function optionalString(source: ArtistFormSource, key: keyof ArtistMutationInput): string | undefined {
  const value = readValue(source, key);

  if (value === null || value === undefined) {
    return undefined;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
}

function requiredString(
  source: ArtistFormSource,
  key: keyof ArtistMutationInput,
  label: string,
  issues: ArtistValidationIssue[],
): string {
  const value = optionalString(source, key);

  if (!value) {
    issues.push({ field: key, message: `${label} is required.` });
    return "";
  }

  return value;
}

function numberValue(
  source: ArtistFormSource,
  key: keyof ArtistMutationInput,
  label: string,
  issues: ArtistValidationIssue[],
  fallback = 0,
): number {
  const value = readValue(source, key);
  const textValue = String(value ?? "").trim();

  if (textValue.length === 0) {
    return fallback;
  }

  const numericValue = typeof value === "number" ? value : Number(textValue);

  if (!Number.isFinite(numericValue)) {
    issues.push({ field: key, message: `${label} must be a valid number.` });
    return fallback;
  }

  return numericValue;
}

function booleanValue(source: ArtistFormSource, key: keyof ArtistMutationInput): boolean {
  const value = readValue(source, key);

  if (typeof value === "boolean") {
    return value;
  }

  const text = String(value ?? "").trim().toLowerCase();
  return text === "true" || text === "1" || text === "on" || text === "yes";
}

function validateUrl(value: string | undefined, field: keyof ArtistMutationInput, issues: ArtistValidationIssue[]) {
  if (!value) {
    return;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      issues.push({ field, message: "Website must use http or https." });
    }
  } catch {
    issues.push({ field, message: "Website must be a valid URL." });
  }
}

function validateEmail(value: string | undefined, field: keyof ArtistMutationInput, issues: ArtistValidationIssue[]) {
  if (!value) {
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    issues.push({ field, message: "Email must be a valid email address." });
  }
}

function slugifyArtistName(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug || `artist-${Date.now()}`;
}

export function validateArtistFormInput(source: ArtistFormSource): ArtistValidationResult {
  const issues: ArtistValidationIssue[] = [];

  const nameEn = requiredString(source, "name_en", "English name", issues);
  const nameAr = requiredString(source, "name_ar", "Arabic name", issues);
  const bioEn = requiredString(source, "bio_en", "English biography", issues);
  const bioAr = requiredString(source, "bio_ar", "Arabic biography", issues);
  const nationalityEn = requiredString(source, "nationality_en", "English nationality", issues);
  const nationalityAr = requiredString(source, "nationality_ar", "Arabic nationality", issues);
  const representationStatus = optionalString(source, "representation_status") ?? "represented";
  const visibilityStatus = optionalString(source, "visibility_status") ?? VisibilityStatus.Private;
  const birthYear = numberValue(source, "birth_year", "Birth year", issues);
  const displayOrder = numberValue(source, "display_order", "Display order", issues);
  const website = optionalString(source, "website");
  const email = optionalString(source, "email");
  const slug = slugifyArtistName(optionalString(source, "slug") ?? nameEn ?? nameAr);

  if (birthYear !== 0 && (!Number.isInteger(birthYear) || birthYear < 1000 || birthYear > new Date().getFullYear())) {
    issues.push({ field: "birth_year", message: "Birth year must be a valid past year." });
  }

  if (!Number.isInteger(displayOrder)) {
    issues.push({ field: "display_order", message: "Display order must be a whole number." });
  }

  if (representationStatus && !representationStatuses.has(representationStatus)) {
    issues.push({ field: "representation_status", message: "Representation status is not supported." });
  }

  if (visibilityStatus && !visibilityStatuses.has(visibilityStatus)) {
    issues.push({ field: "visibility_status", message: "Visibility status is not supported." });
  }

  validateUrl(website, "website", issues);
  validateEmail(email, "email", issues);

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
      name_en: nameEn,
      name_ar: nameAr,
      bio_en: bioEn,
      bio_ar: bioAr,
      birth_year: birthYear,
      nationality_en: nationalityEn,
      nationality_ar: nationalityAr,
      website,
      email,
      instagram: optionalString(source, "instagram"),
      profile_image_id: optionalString(source, "profile_image_id"),
      featured: booleanValue(source, "featured"),
      display_order: displayOrder,
      representation_status: representationStatus,
      visibility_status: visibilityStatus as VisibilityStatus,
    },
    issues: [],
  };
}