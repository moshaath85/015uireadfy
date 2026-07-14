import type { AppError } from "./errors";

export type Result<T, E = AppError> = SuccessResult<T> | FailureResult<E>;

export interface SuccessResult<T> {
  readonly ok: true;
  readonly data: T;
}

export interface FailureResult<E = AppError> {
  readonly ok: false;
  readonly error: E;
}

export function success<T>(data: T): SuccessResult<T> {
  return {
    ok: true,
    data
  };
}

export function failure<E = AppError>(error: E): FailureResult<E> {
  return {
    ok: false,
    error
  };
}

export function isSuccess<T, E>(result: Result<T, E>): result is SuccessResult<T> {
  return result.ok;
}

export function isFailure<T, E>(result: Result<T, E>): result is FailureResult<E> {
  return !result.ok;
}

export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.ok ? result.data : fallback;
}