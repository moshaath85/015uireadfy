export type ServiceFailureCode =
  | "VALIDATION_ERROR"
  | "PERMISSION_DENIED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export interface ServiceIssue {
  readonly field?: string;
  readonly message: string;
}

export interface ServiceError {
  readonly code: ServiceFailureCode;
  readonly message: string;
  readonly issues?: readonly ServiceIssue[];
}

export interface ServiceSuccess<T> {
  readonly ok: true;
  readonly data: T;
}

export interface ServiceFailure {
  readonly ok: false;
  readonly error: ServiceError;
}

export type ServiceResult<T> = ServiceSuccess<T> | ServiceFailure;

export function serviceSuccess<T>(data: T): ServiceSuccess<T> {
  return {
    ok: true,
    data
  };
}

export function serviceFailure(
  code: ServiceFailureCode,
  message: string,
  issues?: readonly ServiceIssue[]
): ServiceFailure {
  return {
    ok: false,
    error: {
      code,
      message,
      issues
    }
  };
}