export type Tex7RepositoryErrorCode =
  | "TEX7_REPOSITORY_NOT_REGISTERED"
  | "TEX7_REPOSITORY_PROVIDER_NOT_REGISTERED"
  | "TEX7_REPOSITORY_PROVIDER_UNSUPPORTED"
  | "TEX7_REPOSITORY_CAPABILITY_UNSUPPORTED"
  | "TEX7_REPOSITORY_ENTITY_NOT_FOUND"
  | "TEX7_REPOSITORY_ENTITY_CONFLICT"
  | "TEX7_REPOSITORY_OPTIMISTIC_LOCK_FAILED"
  | "TEX7_REPOSITORY_VALIDATION_FAILED"
  | "TEX7_REPOSITORY_RELATION_UNAVAILABLE"
  | "TEX7_REPOSITORY_MIGRATION_UNAVAILABLE"
  | "TEX7_REPOSITORY_MIGRATION_INCOMPATIBLE"
  | "TEX7_REPOSITORY_SCHEMA_VERSION_MISMATCH"
  | "TEX7_REPOSITORY_WRITE_DISABLED"
  | "TEX7_REPOSITORY_UNKNOWN_ERROR";

export interface Tex7RepositoryErrorDescriptor<TCode extends string = Tex7RepositoryErrorCode> {
  readonly code: TCode;
  readonly message: string;
  readonly recoverable: boolean;
  readonly category:
    | "registration"
    | "provider"
    | "capability"
    | "entity"
    | "validation"
    | "relation"
    | "migration"
    | "schema"
    | "write"
    | "unknown";
  readonly details?: Record<string, unknown>;
}

export class Tex7RepositoryContractError<TCode extends string = Tex7RepositoryErrorCode> extends Error {
  readonly code: TCode;
  readonly recoverable: boolean;
  readonly category: Tex7RepositoryErrorDescriptor<TCode>["category"];
  readonly details?: Record<string, unknown>;

  constructor(descriptor: Tex7RepositoryErrorDescriptor<TCode>) {
    super(descriptor.message);
    this.name = "Tex7RepositoryContractError";
    this.code = descriptor.code;
    this.recoverable = descriptor.recoverable;
    this.category = descriptor.category;
    this.details = descriptor.details;
  }
}
