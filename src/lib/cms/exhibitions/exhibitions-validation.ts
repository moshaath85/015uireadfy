import { VisibilityStatus, type Exhibition } from "@/types";

export type ExhibitionValidatedInput = Pick<
  Exhibition,
  | "slug"
  | "title_en"
  | "title_ar"
  | "description_en"
  | "description_ar"
  | "start_date"
  | "end_date"
  | "venue_en"
  | "venue_ar"
  | "cover_media_id"
  | "visibility_status"
>;

export type ExhibitionValidationSource = FormData | Record<string, unknown>;

export interface ExhibitionValidationIssue {
  readonly field: keyof ExhibitionValidatedInput;
  readonly message: string;
}

export interface ExhibitionValidationSuccess {
  readonly valid: true;
  readonly data: ExhibitionValidatedInput;
  readonly issues: readonly [];
}

export interface ExhibitionValidationFailure {
  readonly valid: false;
  readonly data: null;
  readonly issues: readonly ExhibitionValidationIssue[];
}

export type ExhibitionValidationResult =
  | ExhibitionValidationSuccess
  | ExhibitionValidationFailure;

const visibilityStatuses = new Set<string>(Object.values(VisibilityStatus));

function readValue(
  source: ExhibitionValidationSource,
  key: keyof ExhibitionValidatedInput,
): unknown {
  if (typeof FormData !== "undefined" && source instanceof FormData) {
    return source.get(key);
  }

  return (source as Record<string, unknown>)[key];
}

function optionalString(
  source: ExhibitionValidationSource,
  key: keyof ExhibitionValidatedInput,
): string | undefined {
  const value = readValue(source, key);

  if (value === null || value === undefined) {
    return undefined;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
}

function requiredString(
  source: ExhibitionValidationSource,
  key: keyof ExhibitionValidatedInput,
  label: string,
  issues: ExhibitionValidationIssue[],
): string {
  const value = optionalString(source, key);

  if (!value) {
    issues.push({ field: key, message: `${label} is required.` });
    return "";
  }

  return value;
}

function isValidDateText(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const time = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(time);
}

export function validateExhibitionFormInput(
  source: ExhibitionValidationSource,
): ExhibitionValidationResult {
  const issues: ExhibitionValidationIssue[] = [];

  const slug = requiredString(source, "slug", "Slug", issues);
  const titleEn = requiredString(source, "title_en", "English title", issues);
  const titleAr = requiredString(source, "title_ar", "Arabic title", issues);
  const descriptionEn = requiredString(source, "description_en", "English description", issues);
  const descriptionAr = requiredString(source, "description_ar", "Arabic description", issues);
  const startDate = requiredString(source, "start_date", "Start date", issues);
  const endDate = requiredString(source, "end_date", "End date", issues);
  const venueEn = requiredString(source, "venue_en", "English venue", issues);
  const venueAr = requiredString(source, "venue_ar", "Arabic venue", issues);
  const visibilityStatus = requiredString(source, "visibility_status", "Visibility", issues);
  const coverMediaId = optionalString(source, "cover_media_id") ?? null;

  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    issues.push({
      field: "slug",
      message: "Slug must use lowercase letters, numbers, and hyphens only.",
    });
  }

  if (startDate && !isValidDateText(startDate)) {
    issues.push({
      field: "start_date",
      message: "Start date must use YYYY-MM-DD format.",
    });
  }

  if (endDate && !isValidDateText(endDate)) {
    issues.push({
      field: "end_date",
      message: "End date must use YYYY-MM-DD format.",
    });
  }

  if (startDate && endDate && isValidDateText(startDate) && isValidDateText(endDate)) {
    const startTime = Date.parse(`${startDate}T00:00:00.000Z`);
    const endTime = Date.parse(`${endDate}T00:00:00.000Z`);

    if (endTime < startTime) {
      issues.push({
        field: "end_date",
        message: "End date must be the same as or later than start date.",
      });
    }
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
      start_date: startDate,
      end_date: endDate,
      venue_en: venueEn,
      venue_ar: venueAr,
      cover_media_id: coverMediaId,
      visibility_status: visibilityStatus as VisibilityStatus,
    },
    issues: [],
  };
}