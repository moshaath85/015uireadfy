import { VisibilityStatus } from "@/types";

export interface NewsValidatedInput {
  readonly title_en: string;
  readonly title_ar: string;
  readonly slug: string;
  readonly content_en: string;
  readonly content_ar: string;
  readonly excerpt_en: string;
  readonly excerpt_ar: string;
  readonly category: string;
  readonly publish_date: string;
  readonly image_id: string | null;
  readonly visibility_status: VisibilityStatus;
}

export type NewsValidationSource = FormData | Record<string, unknown>;

export interface NewsValidationIssue {
  readonly field: keyof NewsValidatedInput;
  readonly message: string;
}

export interface NewsValidationSuccess {
  readonly valid: true;
  readonly data: NewsValidatedInput;
  readonly issues: readonly [];
}

export interface NewsValidationFailure {
  readonly valid: false;
  readonly data: null;
  readonly issues: readonly NewsValidationIssue[];
}

export type NewsValidationResult = NewsValidationSuccess | NewsValidationFailure;

const visibilityStatuses = new Set<string>(Object.values(VisibilityStatus));

function readValue(source: NewsValidationSource, key: keyof NewsValidatedInput): unknown {
  if (typeof FormData !== "undefined" && source instanceof FormData) {
    return source.get(key);
  }

  return (source as Record<string, unknown>)[key];
}

function requiredString(
  source: NewsValidationSource,
  key: keyof NewsValidatedInput,
  label: string,
  issues: NewsValidationIssue[],
): string {
  const value = readValue(source, key);
  const text = value === null || value === undefined ? "" : String(value).trim();

  if (!text) {
    issues.push({ field: key, message: `${label} is required.` });
  }

  return text;
}

function optionalString(source: NewsValidationSource, key: keyof NewsValidatedInput): string | null {
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

export function validateNewsFormInput(source: NewsValidationSource): NewsValidationResult {
  const issues: NewsValidationIssue[] = [];

  const titleEn = requiredString(source, "title_en", "English title", issues);
  const titleAr = requiredString(source, "title_ar", "Arabic title", issues);
  const slug = requiredString(source, "slug", "Slug", issues);
  const contentEn = requiredString(source, "content_en", "English content", issues);
  const contentAr = requiredString(source, "content_ar", "Arabic content", issues);
  const excerptEn = requiredString(source, "excerpt_en", "English excerpt", issues);
  const excerptAr = requiredString(source, "excerpt_ar", "Arabic excerpt", issues);
  const category = requiredString(source, "category", "Category", issues);
  const publishDate = requiredString(source, "publish_date", "Publish date", issues);
  const imageId = optionalString(source, "image_id");
  const visibilityStatus = requiredString(source, "visibility_status", "Visibility", issues);

  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    issues.push({ field: "slug", message: "Slug must use lowercase letters, numbers, and hyphens only." });
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
      content_en: contentEn,
      content_ar: contentAr,
      excerpt_en: excerptEn,
      excerpt_ar: excerptAr,
      category,
      publish_date: publishDate,
      image_id: imageId,
      visibility_status: visibilityStatus as VisibilityStatus,
    },
    issues: [],
  };
}