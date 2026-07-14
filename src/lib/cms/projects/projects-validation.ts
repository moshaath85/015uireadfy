import { VisibilityStatus } from "@/types";

export interface ProjectValidatedInput {
  readonly title_en: string;
  readonly title_ar: string;
  readonly slug: string;
  readonly description_en: string;
  readonly description_ar: string;
  readonly client: string;
  readonly location: string;
  readonly completion_date: string;
  readonly status: string;
  readonly cover_media_id: string | null;
  readonly visibility_status: VisibilityStatus;
}

export type ProjectValidationSource = FormData | Record<string, unknown>;

export interface ProjectValidationIssue {
  readonly field: keyof ProjectValidatedInput;
  readonly message: string;
}

export interface ProjectValidationSuccess {
  readonly valid: true;
  readonly data: ProjectValidatedInput;
  readonly issues: readonly [];
}

export interface ProjectValidationFailure {
  readonly valid: false;
  readonly data: null;
  readonly issues: readonly ProjectValidationIssue[];
}

export type ProjectValidationResult = ProjectValidationSuccess | ProjectValidationFailure;

const projectStatuses = new Set(["planned", "in_progress", "completed", "archived"]);
const visibilityStatuses = new Set<string>(Object.values(VisibilityStatus));

function readValue(source: ProjectValidationSource, key: keyof ProjectValidatedInput): unknown {
  if (typeof FormData !== "undefined" && source instanceof FormData) {
    return source.get(key);
  }

  return (source as Record<string, unknown>)[key];
}

function optionalString(
  source: ProjectValidationSource,
  key: keyof ProjectValidatedInput,
): string | undefined {
  const value = readValue(source, key);

  if (value === null || value === undefined) {
    return undefined;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
}

function requiredString(
  source: ProjectValidationSource,
  key: keyof ProjectValidatedInput,
  label: string,
  issues: ProjectValidationIssue[],
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

export function validateProjectFormInput(source: ProjectValidationSource): ProjectValidationResult {
  const issues: ProjectValidationIssue[] = [];

  const titleEn = requiredString(source, "title_en", "English title", issues);
  const titleAr = requiredString(source, "title_ar", "Arabic title", issues);
  const slug = requiredString(source, "slug", "Slug", issues);
  const descriptionEn = requiredString(source, "description_en", "English description", issues);
  const descriptionAr = requiredString(source, "description_ar", "Arabic description", issues);
  const client = requiredString(source, "client", "Client", issues);
  const location = requiredString(source, "location", "Location", issues);
  const completionDate = requiredString(source, "completion_date", "Completion date", issues);
  const status = requiredString(source, "status", "Status", issues);
  const visibilityStatus = requiredString(source, "visibility_status", "Visibility", issues);
  const coverMediaId = optionalString(source, "cover_media_id") ?? null;

  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    issues.push({
      field: "slug",
      message: "Slug must use lowercase letters, numbers, and hyphens only.",
    });
  }

  if (completionDate && !isValidDateText(completionDate)) {
    issues.push({
      field: "completion_date",
      message: "Completion date must use YYYY-MM-DD format.",
    });
  }

  if (status && !projectStatuses.has(status)) {
    issues.push({
      field: "status",
      message: "Project status is not supported.",
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
      title_en: titleEn,
      title_ar: titleAr,
      slug,
      description_en: descriptionEn,
      description_ar: descriptionAr,
      client,
      location,
      completion_date: completionDate,
      status,
      cover_media_id: coverMediaId,
      visibility_status: visibilityStatus as VisibilityStatus,
    },
    issues: [],
  };
}