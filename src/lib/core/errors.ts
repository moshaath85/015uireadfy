export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export interface AppErrorDetails {
  readonly field?: string;
  readonly reason?: string;
  readonly metadata?: Record<string, string | number | boolean | null>;
}

export interface AppError {
  readonly code: AppErrorCode;
  readonly message: string;
  readonly statusCode: number;
  readonly details?: AppErrorDetails;
}

export function createAppError(
  code: AppErrorCode,
  message: string,
  statusCode: number,
  details?: AppErrorDetails
): AppError {
  return {
    code,
    message,
    statusCode,
    ...(details ? { details } : {})
  };
}

export function validationError(message: string, details?: AppErrorDetails): AppError {
  return createAppError("VALIDATION_ERROR", message, 400, details);
}

export function notFoundError(message: string, details?: AppErrorDetails): AppError {
  return createAppError("NOT_FOUND", message, 404, details);
}

export function forbiddenError(message: string, details?: AppErrorDetails): AppError {
  return createAppError("FORBIDDEN", message, 403, details);
}

export function internalError(message = "An unexpected error occurred"): AppError {
  return createAppError("INTERNAL_ERROR", message, 500);
}