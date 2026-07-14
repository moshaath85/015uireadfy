export type RepositoryFailureCode =
  | "NOT_FOUND"
  | "CONFLICT"
  | "READ_ERROR"
  | "WRITE_ERROR"
  | "INVALID_QUERY"
  | "UNKNOWN_ERROR";

export interface RepositoryIssue {
  readonly field?: string;
  readonly message: string;
}

export interface RepositoryError {
  readonly code: RepositoryFailureCode;
  readonly message: string;
  readonly issues?: readonly RepositoryIssue[];
}

export interface RepositorySuccess<T> {
  readonly ok: true;
  readonly data: T;
}

export interface RepositoryFailure {
  readonly ok: false;
  readonly error: RepositoryError;
}

export type RepositoryResult<T> = RepositorySuccess<T> | RepositoryFailure;

export function repositorySuccess<T>(data: T): RepositorySuccess<T> {
  return {
    ok: true,
    data
  };
}

export function repositoryFailure(
  code: RepositoryFailureCode,
  message: string,
  issues?: readonly RepositoryIssue[]
): RepositoryFailure {
  return {
    ok: false,
    error: {
      code,
      message,
      issues
    }
  };
}