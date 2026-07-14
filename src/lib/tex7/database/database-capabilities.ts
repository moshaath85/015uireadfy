export type Tex7DatabaseProviderFamily =
  | "postgresql"
  | "sqlite"
  | "enterprise"
  | "custom";

export interface Tex7DatabaseMigrationCapabilities {
  readonly supportsSchemaInspection: boolean;
  readonly supportsSchemaVersioning: boolean;
  readonly supportsDryRun: boolean;
  readonly supportsRollback: boolean;
}

export interface Tex7DatabaseQueryCapabilities {
  readonly supportsOffsetPagination: boolean;
  readonly supportsCursorPagination: boolean;
  readonly supportsFiltering: boolean;
  readonly supportsCompoundFiltering: boolean;
  readonly supportsSorting: boolean;
  readonly supportsFullTextSearch: boolean;
}

export interface Tex7DatabaseRecordCapabilities {
  readonly supportsOptimisticLocking: boolean;
  readonly supportsSoftDelete: boolean;
  readonly supportsAuditFields: boolean;
  readonly supportsVersionedRecords: boolean;
}

export interface Tex7DatabaseTransactionCapabilities {
  readonly supportsTransactions: boolean;
  readonly supportsNestedTransactions: boolean;
  readonly supportsSavepoints: boolean;
  readonly supportsReadOnlyTransactions: boolean;
}

export interface Tex7DatabaseCapabilities {
  readonly providerFamily: Tex7DatabaseProviderFamily;
  readonly query: Tex7DatabaseQueryCapabilities;
  readonly records: Tex7DatabaseRecordCapabilities;
  readonly transactions: Tex7DatabaseTransactionCapabilities;
  readonly migrations: Tex7DatabaseMigrationCapabilities;
  readonly healthChecks: {
    readonly supportsReadCheck: boolean;
    readonly supportsWriteCheck: boolean;
    readonly supportsLatencyCheck: boolean;
  };
  readonly repositoryRegistration: {
    readonly supportsRuntimeRegistration: boolean;
    readonly supportsProviderScopedRepositories: boolean;
  };
}
