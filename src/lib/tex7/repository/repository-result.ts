export type Tex7RepositoryResultStatus = "success" | "failure";

export interface Tex7RepositoryResultMeta {
  readonly repositoryKey?: string;
  readonly providerId?: string;
  readonly operation?: string;
  readonly requestId?: string;
  readonly durationMs?: number;
  readonly schemaVersion?: string;
}

export interface Tex7RepositorySuccess<TResult> {
  readonly ok: true;
  readonly status: "success";
  readonly data: TResult;
  readonly meta?: Tex7RepositoryResultMeta;
}

export interface Tex7RepositoryFailure<TCode extends string = string> {
  readonly ok: false;
  readonly status: "failure";
  readonly error: {
    readonly code: TCode;
    readonly message: string;
    readonly recoverable: boolean;
    readonly details?: Record<string, unknown>;
  };
  readonly meta?: Tex7RepositoryResultMeta;
}

export type Tex7RepositoryResult<TResult, TCode extends string = string> =
  | Tex7RepositorySuccess<TResult>
  | Tex7RepositoryFailure<TCode>;

export interface Tex7RepositoryPageInfo<TCursor extends string = string> {
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
  readonly startCursor?: TCursor;
  readonly endCursor?: TCursor;
  readonly totalCount?: number;
}

export interface Tex7RepositoryConnection<TEntity, TCursor extends string = string> {
  readonly nodes: readonly TEntity[];
  readonly pageInfo: Tex7RepositoryPageInfo<TCursor>;
}

export function tex7RepositorySuccess<TResult>(
  data: TResult,
  meta?: Tex7RepositoryResultMeta,
): Tex7RepositorySuccess<TResult> {
  return { ok: true, status: "success", data, meta };
}

export function tex7RepositoryFailure<TCode extends string>(
  code: TCode,
  message: string,
  options: {
    readonly recoverable?: boolean;
    readonly details?: Record<string, unknown>;
    readonly meta?: Tex7RepositoryResultMeta;
  } = {},
): Tex7RepositoryFailure<TCode> {
  return {
    ok: false,
    status: "failure",
    error: {
      code,
      message,
      recoverable: options.recoverable ?? false,
      details: options.details,
    },
    meta: options.meta,
  };
}
