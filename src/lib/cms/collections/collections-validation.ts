import { VisibilityStatus, type Collection } from "@/types";

export type CollectionValidatedInput = Pick<
  Collection,
  | "slug"
  | "title_en"
  | "title_ar"
  | "description_en"
  | "description_ar"
  | "cover_media_id"
  | "visibility_status"
>;

export type CollectionValidationSource = FormData | Record<string, unknown>;

export interface CollectionValidationIssue {
  readonly field: keyof CollectionValidatedInput;
  readonly message: string;
}

export interface CollectionValidationSuccess {
  readonly valid: true;
  readonly data: CollectionValidatedInput;
  readonly issues: readonly [];
}

export interface CollectionValidationFailure {
  readonly valid: false;
  readonly data: null;
  readonly issues: readonly CollectionValidationIssue[];
}

export type CollectionValidationResult =
  | CollectionValidationSuccess
  | CollectionValidationFailure;

const visibilityStatuses = new Set<string>(Object.values(VisibilityStatus));

function readValue(
  source: CollectionValidationSource,
  key: keyof CollectionValidatedInput,
): unknown {
  if (typeof FormData !== "undefined" && source instanceof FormData) {
    return source.get(key);
  }

  return (source as Record<string, unknown>)[key];
}

function optionalString(
  source: CollectionValidationSource,
  key: keyof CollectionValidatedInput,
): string | undefined {
  const value = readValue(source, key);

  if (value === null || value === undefined) {
    return undefined;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
}

function requiredString(
  source: CollectionValidationSource,
  key: keyof CollectionValidatedInput,
  label: string,
  issues: CollectionValidationIssue[],
): string {
  const value = optionalString(source, key);

  if (!value) {
    issues.push({ field: key, message: `${label} is required.` });
    return "";
  }

  return value;
}

export function validateCollectionFormInput(
  source: CollectionValidationSource,
): CollectionValidationResult {
  const issues: CollectionValidationIssue[] = [];

  const slug = requiredString(source, "slug", "Slug", issues);
  const titleEn = requiredString(source, "title_en", "English title", issues);
  const titleAr = requiredString(source, "title_ar", "Arabic title", issues);
  const descriptionEn = requiredString(source, "description_en", "English description", issues);
  const descriptionAr = requiredString(source, "description_ar", "Arabic description", issues);
  const visibilityStatus = requiredString(source, "visibility_status", "Visibility", issues);
  const coverMediaId = optionalString(source, "cover_media_id") ?? null;

  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    issues.push({
      field: "slug",
      message: "Slug must use lowercase letters, numbers, and hyphens only.",
    });
  }

  if (visibilityStatus && !visibilityStatuses.has(visibilityStatus)) {
    issues.push({
      field: "visibility_status",
      message: "Visibility status is not supported.",
    });
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
      description_en: descriptionEn,
      description_ar: descriptionAr,
      cover_media_id: coverMediaId,
      visibility_status: visibilityStatus as VisibilityStatus,
    },
    issues: [],
  };
}