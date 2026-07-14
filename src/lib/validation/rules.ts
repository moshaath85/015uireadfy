export type ValidationRule<T> = (value: T) => string | null;

export interface ValidationIssue {
  readonly field: string;
  readonly message: string;
}

export function required(value: unknown, message = "This field is required"): string | null {
  if (value === null || value === undefined) {
    return message;
  }

  if (typeof value === "string" && value.trim().length === 0) {
    return message;
  }

  return null;
}

export function minLength(
  value: string | undefined | null,
  minimum: number,
  message = `Must be at least ${minimum} characters`
): string | null {
  if (value === null || value === undefined || value.length >= minimum) {
    return null;
  }

  return message;
}

export function maxLength(
  value: string | undefined | null,
  maximum: number,
  message = `Must be no more than ${maximum} characters`
): string | null {
  if (value === null || value === undefined || value.length <= maximum) {
    return null;
  }

  return message;
}

export function isEmail(value: string | undefined | null, message = "Must be a valid email"): string | null {
  if (!value) {
    return null;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : message;
}

export function isSlug(value: string | undefined | null, message = "Must be a valid slug"): string | null {
  if (!value) {
    return null;
  }

  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ? null : message;
}

export function isPositiveNumber(
  value: number | undefined | null,
  message = "Must be a positive number"
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return Number.isFinite(value) && value > 0 ? null : message;
}

export function collectIssue(field: string, message: string | null): ValidationIssue | null {
  return message ? { field, message } : null;
}

export function compactIssues(issues: readonly (ValidationIssue | null)[]): ValidationIssue[] {
  return issues.filter((issue): issue is ValidationIssue => issue !== null);
}