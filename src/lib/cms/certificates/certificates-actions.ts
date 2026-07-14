import type { Certificate } from "@/types";
import { CertificateStatus } from "@/types";

export type CertificateActionMode = "create" | "update";
export type CertificateActionStatus = "prepared" | "validation_error";

export interface CertificateValidatedInput {
  readonly certificate_number: string;
  readonly artwork_id: string;
  readonly issued_date: string;
  readonly template_id: string;
  readonly qr_code: string;
  readonly verification_url: string;
  readonly status: CertificateStatus;
  readonly issued_by: string;
  readonly approved_by: string;
  readonly issued_version: number;
  readonly issued_at: string;
  readonly last_updated: string;
}

export interface CertificateValidationIssue {
  readonly field: keyof CertificateValidatedInput;
  readonly message: string;
}

export type CertificateValidationSource = FormData | Record<string, FormDataEntryValue | string | number | null | undefined>;

export interface CertificateActionContext {
  readonly existingCertificateId?: Certificate["id"];
  readonly mutationEnabled?: boolean;
  readonly environment?: string;
}

export interface CertificateActionSuccess {
  readonly ok: true;
  readonly mode: CertificateActionMode;
  readonly status: "prepared";
  readonly data: CertificateValidatedInput;
  readonly certificateId?: Certificate["id"];
  readonly shouldWriteJson: false;
  readonly message: string;
}

export interface CertificateActionFailure {
  readonly ok: false;
  readonly mode: CertificateActionMode;
  readonly status: "validation_error";
  readonly issues: readonly CertificateValidationIssue[];
  readonly certificateId?: Certificate["id"];
  readonly shouldWriteJson: false;
  readonly message: string;
}

export type CertificateActionResult = CertificateActionSuccess | CertificateActionFailure;

const certificateStatusValues = new Set<string>(Object.values(CertificateStatus));

function readField(source: CertificateValidationSource, field: keyof CertificateValidatedInput): string {
  const value = source instanceof FormData ? source.get(field) : source[field];

  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isIsoDateTime(value: string): boolean {
  return value.length > 0 && !Number.isNaN(Date.parse(value));
}

function isValidVerificationUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function validateCertificateFormInput(source: CertificateValidationSource): {
  readonly valid: true;
  readonly data: CertificateValidatedInput;
} | {
  readonly valid: false;
  readonly issues: readonly CertificateValidationIssue[];
} {
  const data = {
    certificate_number: readField(source, "certificate_number"),
    artwork_id: readField(source, "artwork_id"),
    issued_date: readField(source, "issued_date"),
    template_id: readField(source, "template_id"),
    qr_code: readField(source, "qr_code"),
    verification_url: readField(source, "verification_url"),
    status: readField(source, "status"),
    issued_by: readField(source, "issued_by"),
    approved_by: readField(source, "approved_by"),
    issued_version: Number.parseInt(readField(source, "issued_version"), 10),
    issued_at: readField(source, "issued_at"),
    last_updated: readField(source, "last_updated"),
  };

  const issues: CertificateValidationIssue[] = [];

  if (!data.certificate_number) {
    issues.push({ field: "certificate_number", message: "Certificate number is required." });
  }

  if (!data.artwork_id) {
    issues.push({ field: "artwork_id", message: "Artwork is required." });
  }

  if (!data.issued_date || !isIsoDate(data.issued_date)) {
    issues.push({ field: "issued_date", message: "Issued date must use YYYY-MM-DD format." });
  }

  if (!data.template_id) {
    issues.push({ field: "template_id", message: "Template id is required." });
  }

  if (!data.qr_code) {
    issues.push({ field: "qr_code", message: "QR code value is required." });
  }

  if (!data.verification_url || !isValidVerificationUrl(data.verification_url)) {
    issues.push({ field: "verification_url", message: "Verification URL must be a valid HTTP or HTTPS URL." });
  }

  if (!certificateStatusValues.has(data.status)) {
    issues.push({ field: "status", message: "Certificate status is not supported." });
  }

  if (!data.issued_by) {
    issues.push({ field: "issued_by", message: "Issued by is required." });
  }

  if (!data.approved_by) {
    issues.push({ field: "approved_by", message: "Approved by is required." });
  }

  if (!Number.isInteger(data.issued_version) || data.issued_version < 1) {
    issues.push({ field: "issued_version", message: "Issued version must be a positive whole number." });
  }

  if (!data.issued_at || !isIsoDateTime(data.issued_at)) {
    issues.push({ field: "issued_at", message: "Issued at must be a valid date-time value." });
  }

  if (!data.last_updated || !isIsoDateTime(data.last_updated)) {
    issues.push({ field: "last_updated", message: "Last updated must be a valid date-time value." });
  }

  if (issues.length > 0) {
    return { valid: false, issues };
  }

  return {
    valid: true,
    data: {
      ...data,
      status: data.status as CertificateStatus,
    },
  };
}

function validationErrorResult(
  mode: CertificateActionMode,
  issues: readonly CertificateValidationIssue[],
  certificateId?: Certificate["id"],
): CertificateActionFailure {
  return {
    ok: false,
    mode,
    status: "validation_error",
    issues,
    certificateId,
    shouldWriteJson: false,
    message: "Certificate input could not be validated.",
  };
}

function preparedResult(
  mode: CertificateActionMode,
  data: CertificateValidatedInput,
  certificateId?: Certificate["id"],
): CertificateActionSuccess {
  return {
    ok: true,
    mode,
    status: "prepared",
    data,
    certificateId,
    shouldWriteJson: false,
    message: "Certificate input is valid. Persistence remains disabled until a future approved write patch.",
  };
}

export function prepareCreateCertificateAction(
  source: CertificateValidationSource,
  _context: CertificateActionContext = {},
): CertificateActionResult {
  const validation = validateCertificateFormInput(source);

  if (!validation.valid) {
    return validationErrorResult("create", validation.issues);
  }

  return preparedResult("create", validation.data);
}

export function prepareUpdateCertificateAction(
  certificateId: Certificate["id"],
  source: CertificateValidationSource,
  context: CertificateActionContext = {},
): CertificateActionResult {
  const resolvedCertificateId = context.existingCertificateId ?? certificateId;

  if (!resolvedCertificateId) {
    return validationErrorResult("update", [
      { field: "certificate_number", message: "Certificate id is required for update preparation." },
    ]);
  }

  const validation = validateCertificateFormInput(source);

  if (!validation.valid) {
    return validationErrorResult("update", validation.issues, resolvedCertificateId);
  }

  return preparedResult("update", validation.data, resolvedCertificateId);
}