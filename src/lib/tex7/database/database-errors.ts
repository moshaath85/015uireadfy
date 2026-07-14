export type Tex7DatabaseErrorCode =
  | "TEX7_DATABASE_CONNECTION_UNAVAILABLE"
  | "TEX7_DATABASE_CONNECTION_TIMEOUT"
  | "TEX7_DATABASE_PROVIDER_NOT_REGISTERED"
  | "TEX7_DATABASE_PROVIDER_UNSUPPORTED"
  | "TEX7_DATABASE_CAPABILITY_UNSUPPORTED"
  | "TEX7_DATABASE_TRANSACTION_UNAVAILABLE"
  | "TEX7_DATABASE_TRANSACTION_CONFLICT"
  | "TEX7_DATABASE_RECORD_NOT_FOUND"
  | "TEX7_DATABASE_RECORD_CONFLICT"
  | "TEX7_DATABASE_OPTIMISTIC_LOCK_FAILED"
  | "TEX7_DATABASE_VALIDATION_FAILED"
  | "TEX7_DATABASE_MIGRATION_UNAVAILABLE"
  | "TEX7_DATABASE_HEALTH_CHECK_FAILED"
  | "TEX7_DATABASE_UNKNOWN_ERROR";

export interface Tex7DatabaseErrorDescriptor<TCode extends string = Tex7DatabaseErrorCode> {
  readonly code: TCode;
  readonly message: string;
  readonly recoverable: boolean;
  readonly category:
    | "connection"
    | "provider"
    | "capability"
    | "transaction"
    | "record"
    | "validation"
    | "migration"
    | "health"
    | "unknown";
  readonly details?: Record<string, unknown>;
}

export class Tex7DatabaseContractError<TCode extends string = Tex7DatabaseErrorCode> extends Error {
  readonly code: TCode;
  readonly recoverable: boolean;
  readonly category: Tex7DatabaseErrorDescriptor<TCode>["category"];
  readonly details?: Record<string, unknown>;

  constructor(descriptor: Tex7DatabaseErrorDescriptor<TCode>) {
    super(descriptor.message);
    this.name = "Tex7DatabaseContractError";
    this.code = descriptor.code;
    this.recoverable = descriptor.recoverable;
    this.category = descriptor.category;
    this.details = descriptor.details;
  }
}
