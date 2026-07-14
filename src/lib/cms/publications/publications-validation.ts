import { VisibilityStatus } from "@/types";

export interface PublicationValidatedInput {
  readonly title_en: string;
  readonly title_ar: string;
  readonly slug: string;
  readonly description_en: string;
  readonly description_ar: string;
  readonly type: string;
  readonly file_url: string;
  readonly cover_image_id: string | null;
  readonly publish_date: string;
  readonly visibility_status: VisibilityStatus;
}

export type PublicationValidationSource = FormData | Record<string, unknown>;

export interface PublicationValidationIssue {
  readonly field: keyof PublicationValidatedInput;
  readonly message: string;
}

export interface PublicationValidationSuccess {
  readonly valid: true;
  readonly data: PublicationValidatedInput;
  readonly issues: readonly [];
}

export interface PublicationValidationFailure {
  readonly valid: false;
  readonly data: null;
  readonly issues: readonly PublicationValidationIssue[];
}

export type PublicationValidationResult = PublicationValidationSuccess | PublicationValidationFailure;

const visibilityStatuses = new Set<string>(Object.values(VisibilityStatus));

function readValue(source: PublicationValidationSource, key: keyof PublicationValidatedInput): unknown {
  if (typeof FormData !== "undefined" && source instanceof FormData) {
    return source.get(key);
  }

  return (source as Record<string, unknown>)[key];
}

function requiredString(
  source: PublicationValidationSource,
  key: keyof PublicationValidatedInput,
  label: string,
  issues: PublicationValidationIssue[],
): string {
  const value = readValue(source, key);
  const text = value === null || value === undefined ? "" : String(value).trim();

  if (!text) {
    issues.push({ field: key, message: `${label} is required.` });
  }

  return text;
}

function optionalString(source: PublicationValidationSource, key: keyof PublicationValidatedInput): string | null {
  const value = readValue(source, key);
  const text = value === null || value === undefined ? "" : String(value).trim();

  return text || null;
}

function isValidDateText(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return Number.isFinite(Date.parse(`${value}T00:00:00.000Z`));
}

function isValidUrlText(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return value.startsWith("/");
  }
}

export function validatePublicationFormInput(source: PublicationValidationSource): PublicationValidationResult {
  const issues: PublicationValidationIssue[] = [];

  const titleEn = requiredString(source, "title_en", "English title", issues);
  const titleAr = requiredString(source, "title_ar", "Arabic title", issues);
  const slug = requiredString(source, "slug", "Slug", issues);
  const descriptionEn = requiredString(source, "description_en", "English description", issues);
  const descriptionAr = requiredString(source, "description_ar", "Arabic description", issues);
  const type = requiredString(source, "type", "Publication type", issues);
  const fileUrl = requiredString(source, "file_url", "File URL", issues);
  const coverImageId = optionalString(source, "cover_image_id");
  const publishDate = requiredString(source, "publish_date", "Publish date", issues);
  const visibilityStatus = requiredString(source, "visibility_status", "Visibility", issues);

  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    issues.push({ field: "slug", message: "Slug must use lowercase letters, numbers, and hyphens only." });
  }

  if (fileUrl && !isValidUrlText(fileUrl)) {
    issues.push({ field: "file_url", message: "File URL must be an absolute URL or a local absolute path." });
  }

  if (publishDate && !isValidDateText(publishDate)) {
    issues.push({ field: "publish_date", message: "Publish date must use YYYY-MM-DD format." });
  }

  if (visibilityStatus && !visibilityStatuses.has(visibilityStatus)) {
    issues.push({ field: "visibility_status", message: "Visibility status is not supported." });
  }

  if (issues.length > 0) {
    return { valid: false, data: null, issues };
  }

  return {
    valid: true,
    data: {
      title_en: titleEn,
      title_ar: titleAr,
      slug,
      description_en: descriptionEn,
      description_ar: descriptionAr,
      type,
      file_url: fileUrl,
      cover_image_id: coverImageId,
      publish_date: publishDate,
      visibility_status: visibilityStatus as VisibilityStatus,
    },
    issues: [],
  };
}