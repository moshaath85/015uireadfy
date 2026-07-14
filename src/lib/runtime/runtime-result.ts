export type RuntimeOperation = "read" | "list" | "create" | "update" | "validate";

export type RuntimeFailureCode =
  | "VALIDATION_ERROR"
  | "PERMISSION_DENIED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RUNTIME_ERROR";

export interface RuntimeIssue {
  readonly field?: string;
  readonly message: string;
}

export interface RuntimeError {
  readonly code: RuntimeFailureCode;
  readonly message: string;
  readonly issues?: readonly RuntimeIssue[];
}

export interface RuntimeSuccess<TData> {
  readonly ok: true;
  readonly operation: RuntimeOperation;
  readonly data: TData;
}

export interface RuntimeFailure {
  readonly ok: false;
  readonly operation: RuntimeOperation;
  readonly error: RuntimeError;
}

export type RuntimeResult<TData> = RuntimeSuccess<TData> | RuntimeFailure;

export function runtimeSuccess<TData>(
  operation: RuntimeOperation,
  data: TData,
): RuntimeSuccess<TData> {
  return {
    ok: true,
    operation,
    data,
  };
}

export function runtimeFailure(
  operation: RuntimeOperation,
  code: RuntimeFailureCode,
  message: string,
  issues?: readonly RuntimeIssue[],
): RuntimeFailure {
  return {
    ok: false,
    operation,
    error: {
      code,
      message,
      issues,
    },
  };
}

export function runtimeValidationFailure(
  operation: RuntimeOperation,
  issues: readonly RuntimeIssue[],
  message = "Runtime validation failed.",
): RuntimeFailure {
  return runtimeFailure(operation, "VALIDATION_ERROR", message, issues);
}