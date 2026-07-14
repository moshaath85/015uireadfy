export type Tex7DatabaseResultStatus = "success" | "failure";

export interface Tex7DatabaseResultMeta {
  readonly providerId?: string;
  readonly operation?: string;
  readonly durationMs?: number;
  readonly requestId?: string;
  readonly version?: string;
}

export interface Tex7DatabaseSuccess<TResult> {
  readonly ok: true;
  readonly status: "success";
  readonly data: TResult;
  readonly meta?: Tex7DatabaseResultMeta;
}

export interface Tex7DatabaseFailure<TCode extends string = string> {
  readonly ok: false;
  readonly status: "failure";
  readonly error: {
    readonly code: TCode;
    readonly message: string;
    readonly recoverable: boolean;
    readonly details?: Record<string, unknown>;
  };
  readonly meta?: Tex7DatabaseResultMeta;
}

export type Tex7DatabaseResult<TResult, TCode extends string = string> =
  | Tex7DatabaseSuccess<TResult>
  | Tex7DatabaseFailure<TCode>;

export interface Tex7PageInfo<TCursor extends string = string> {
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
  readonly startCursor?: TCursor;
  readonly endCursor?: TCursor;
  readonly totalCount?: number;
}

export interface Tex7ConnectionPage<TResult, TCursor extends string = string> {
  readonly nodes: readonly TResult[];
  readonly pageInfo: Tex7PageInfo<TCursor>;
}

export function tex7DatabaseSuccess<TResult>(
  data: TResult,
  meta?: Tex7DatabaseResultMeta,
): Tex7DatabaseSuccess<TResult> {
  return { ok: true, status: "success", data, meta };
}

export function tex7DatabaseFailure<TCode extends string>(
  code: TCode,
  message: string,
  options: {
    readonly recoverable?: boolean;
    readonly details?: Record<string, unknown>;
    readonly meta?: Tex7DatabaseResultMeta;
  } = {},
): Tex7DatabaseFailure<TCode> {
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
