export interface MediaValidatedInput {
  readonly url: string;
  readonly alt_en: string;
  readonly alt_ar: string;
  readonly type: string;
  readonly mime_type: string;
  readonly width?: number;
  readonly height?: number;
  readonly file_size: number;
  readonly checksum: string;
  readonly dominant_color?: string;
  readonly copyright: string;
  readonly photographer?: string;
  readonly license: string;
  readonly created_by?: string;
  readonly storage_provider: string;
  readonly storage_path: string;
}

export interface MediaLifecycleValidatedInput {
  readonly media_id: string;
  readonly reason: string;
  readonly requested_by?: string;
  readonly effective_at: string;
}

export type MediaValidationSource = FormData | Record<string, unknown>;

export interface MediaValidationIssue {
  readonly field: keyof MediaValidatedInput | keyof MediaLifecycleValidatedInput;
  readonly message: string;
}

export type MediaValidationResult =
  | { readonly valid: true; readonly data: MediaValidatedInput; readonly issues: readonly [] }
  | { readonly valid: false; readonly data: null; readonly issues: readonly MediaValidationIssue[] };

export type MediaLifecycleValidationResult =
  | { readonly valid: true; readonly data: MediaLifecycleValidatedInput; readonly issues: readonly [] }
  | { readonly valid: false; readonly data: null; readonly issues: readonly MediaValidationIssue[] };

function readValue(
  source: MediaValidationSource,
  key: keyof MediaValidatedInput | keyof MediaLifecycleValidatedInput,
): unknown {
  if (typeof FormData !== "undefined" && source instanceof FormData) {
    return source.get(key);
  }

  return (source as Record<string, unknown>)[key];
}

function requiredString(
  source: MediaValidationSource,
  key: keyof MediaValidatedInput | keyof MediaLifecycleValidatedInput,
  label: string,
  issues: MediaValidationIssue[],
): string {
  const value = readValue(source, key);
  const text = value === null || value === undefined ? "" : String(value).trim();

  if (!text) {
    issues.push({ field: key, message: `${label} is required.` });
  }

  return text;
}

function optionalString(
  source: MediaValidationSource,
  key: keyof MediaValidatedInput | keyof MediaLifecycleValidatedInput,
): string | undefined {
  const value = readValue(source, key);
  const text = value === null || value === undefined ? "" : String(value).trim();

  return text || undefined;
}

function optionalNumber(source: MediaValidationSource, key: "width" | "height"): number | undefined {
  const value = readValue(source, key);
  const text = value === null || value === undefined ? "" : String(value).trim();

  if (!text) {
    return undefined;
  }

  const numberValue = Number(text);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : undefined;
}

function requiredPositiveNumber(
  source: MediaValidationSource,
  key: "file_size",
  label: string,
  issues: MediaValidationIssue[],
): number {
  const value = readValue(source, key);
  const text = value === null || value === undefined ? "" : String(value).trim();
  const numberValue = Number(text);

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    issues.push({ field: key, message: `${label} must be zero or greater.` });
    return 0;
  }

  return numberValue;
}

function isValidUrlText(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return value.startsWith("/");
  }
}

function isValidDateTime(value: string): boolean {
  return value.length > 0 && !Number.isNaN(Date.parse(value));
}

export function validateMediaFormInput(source: MediaValidationSource): MediaValidationResult {
  const issues: MediaValidationIssue[] = [];

  const url = requiredString(source, "url", "URL", issues);
  const altEn = requiredString(source, "alt_en", "English alt text", issues);
  const altAr = requiredString(source, "alt_ar", "Arabic alt text", issues);
  const type = requiredString(source, "type", "Media type", issues);
  const mimeType = requiredString(source, "mime_type", "MIME type", issues);
  const fileSize = requiredPositiveNumber(source, "file_size", "File size", issues);
  const checksum = requiredString(source, "checksum", "Checksum", issues);
  const copyright = requiredString(source, "copyright", "Copyright", issues);
  const license = requiredString(source, "license", "License", issues);
  const storageProvider = requiredString(source, "storage_provider", "Storage provider", issues);
  const storagePath = requiredString(source, "storage_path", "Storage path", issues);

  if (url && !isValidUrlText(url)) {
    issues.push({ field: "url", message: "URL must be an absolute URL or a local absolute path." });
  }

  if (storagePath && !storagePath.startsWith("/")) {
    issues.push({ field: "storage_path", message: "Storage path must be an absolute path." });
  }

  if (issues.length > 0) {
    return { valid: false, data: null, issues };
  }

  return {
    valid: true,
    data: {
      url,
      alt_en: altEn,
      alt_ar: altAr,
      type,
      mime_type: mimeType,
      width: optionalNumber(source, "width"),
      height: optionalNumber(source, "height"),
      file_size: fileSize,
      checksum,
      dominant_color: optionalString(source, "dominant_color"),
      copyright,
      photographer: optionalString(source, "photographer"),
      license,
      created_by: optionalString(source, "created_by"),
      storage_provider: storageProvider,
      storage_path: storagePath,
    },
    issues: [],
  };
}

export function validateMediaLifecycleInput(
  mediaId: string,
  source: MediaValidationSource = {},
): MediaLifecycleValidationResult {
  const issues: MediaValidationIssue[] = [];
  const effectiveAtInput = optionalString(source, "effective_at") ?? new Date().toISOString();

  const data: MediaLifecycleValidatedInput = {
    media_id: mediaId || requiredString(source, "media_id", "Media id", issues),
    reason: requiredString(source, "reason", "Reason", issues),
    requested_by: optionalString(source, "requested_by"),
    effective_at: effectiveAtInput,
  };

  if (data.effective_at && !isValidDateTime(data.effective_at)) {
    issues.push({ field: "effective_at", message: "Effective date-time must be valid." });
  }

  if (issues.length > 0) {
    return { valid: false, data: null, issues };
  }

  return { valid: true, data, issues: [] };
}