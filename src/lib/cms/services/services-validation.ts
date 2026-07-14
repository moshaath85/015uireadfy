import { VisibilityStatus } from "@/types";

export interface ServiceValidatedInput {
  readonly title_en: string;
  readonly title_ar: string;
  readonly slug: string;
  readonly description_en: string;
  readonly description_ar: string;
  readonly features_en: readonly string[];
  readonly features_ar: readonly string[];
  readonly price_info: Record<string, unknown>;
  readonly cover_media_id: string | null;
  readonly visibility_status: VisibilityStatus;
}

export type ServiceValidationSource = FormData | Record<string, unknown>;

export interface ServiceValidationIssue {
  readonly field: keyof ServiceValidatedInput;
  readonly message: string;
}

export interface ServiceValidationSuccess {
  readonly valid: true;
  readonly data: ServiceValidatedInput;
  readonly issues: readonly [];
}

export interface ServiceValidationFailure {
  readonly valid: false;
  readonly data: null;
  readonly issues: readonly ServiceValidationIssue[];
}

export type ServiceValidationResult = ServiceValidationSuccess | ServiceValidationFailure;

const visibilityStatuses = new Set<string>(Object.values(VisibilityStatus));

function readValue(source: ServiceValidationSource, key: keyof ServiceValidatedInput): unknown {
  if (typeof FormData !== "undefined" && source instanceof FormData) {
    return source.get(key);
  }

  return (source as Record<string, unknown>)[key];
}

function optionalString(source: ServiceValidationSource, key: keyof ServiceValidatedInput): string | null {
  const value = readValue(source, key);
  const text = value === null || value === undefined ? "" : String(value).trim();
  return text || null;
}

function requiredString(
  source: ServiceValidationSource,
  key: keyof ServiceValidatedInput,
  label: string,
  issues: ServiceValidationIssue[],
): string {
  const value = readValue(source, key);
  const text = value === null || value === undefined ? "" : String(value).trim();

  if (!text) {
    issues.push({ field: key, message: `${label} is required.` });
  }

  return text;
}

function parseStringList(
  source: ServiceValidationSource,
  key: "features_en" | "features_ar",
  label: string,
  issues: ServiceValidationIssue[],
): readonly string[] {
  const value = readValue(source, key);

  if (Array.isArray(value)) {
    const list = value.map((item) => String(item).trim()).filter(Boolean);

    if (list.length > 0) {
      return list;
    }
  }

  const text = value === null || value === undefined ? "" : String(value).trim();

  if (!text) {
    issues.push({ field: key, message: `${label} is required.` });
    return [];
  }

  try {
    const parsed = JSON.parse(text) as unknown;

    if (Array.isArray(parsed)) {
      const list = parsed.map((item) => String(item).trim()).filter(Boolean);

      if (list.length > 0) {
        return list;
      }
    }
  } catch {
    const list = text.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);

    if (list.length > 0) {
      return list;
    }
  }

  issues.push({ field: key, message: `${label} must contain at least one item.` });
  return [];
}

function parsePriceInfo(source: ServiceValidationSource, issues: ServiceValidationIssue[]): Record<string, unknown> {
  const value = readValue(source, "price_info");

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  const text = value === null || value === undefined ? "" : String(value).trim();

  if (!text) {
    issues.push({ field: "price_info", message: "Price info is required." });
    return {};
  }

  try {
    const parsed = JSON.parse(text) as unknown;

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    issues.push({ field: "price_info", message: "Price info must be valid JSON object metadata." });
    return {};
  }

  issues.push({ field: "price_info", message: "Price info must be valid JSON object metadata." });
  return {};
}

export function validateServiceFormInput(source: ServiceValidationSource): ServiceValidationResult {
  const issues: ServiceValidationIssue[] = [];

  const titleEn = requiredString(source, "title_en", "English title", issues);
  const titleAr = requiredString(source, "title_ar", "Arabic title", issues);
  const slug = requiredString(source, "slug", "Slug", issues);
  const descriptionEn = requiredString(source, "description_en", "English description", issues);
  const descriptionAr = requiredString(source, "description_ar", "Arabic description", issues);
  const featuresEn = parseStringList(source, "features_en", "English features", issues);
  const featuresAr = parseStringList(source, "features_ar", "Arabic features", issues);
  const priceInfo = parsePriceInfo(source, issues);
  const visibilityStatus = requiredString(source, "visibility_status", "Visibility", issues);
  const coverMediaId = optionalString(source, "cover_media_id");

  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    issues.push({ field: "slug", message: "Slug must use lowercase letters, numbers, and hyphens only." });
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
      features_en: featuresEn,
      features_ar: featuresAr,
      price_info: priceInfo,
      cover_media_id: coverMediaId,
      visibility_status: visibilityStatus as VisibilityStatus,
    },
    issues: [],
  };
}