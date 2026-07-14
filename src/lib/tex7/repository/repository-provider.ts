import type { Tex7RepositoryContext, Tex7RepositoryVersion } from "./repository-context";
import type { Tex7RepositoryContract } from "./repository-contracts";
import type { Tex7RepositoryResult } from "./repository-result";
import type { Tex7RepositoryWriteCapabilities } from "./repository-write";

export type Tex7RepositoryProviderFamily =
  | "json"
  | "database"
  | "hybrid"
  | "enterprise"
  | "custom";

export interface Tex7RepositoryQueryCapabilities {
  readonly supportsFiltering: boolean;
  readonly supportsCompoundFiltering: boolean;
  readonly supportsSorting: boolean;
  readonly supportsOffsetPagination: boolean;
  readonly supportsCursorPagination: boolean;
  readonly supportsRelationLoading: boolean;
}

export interface Tex7RepositoryMigrationCapabilities {
  readonly supportsSourceInspection: boolean;
  readonly supportsTargetInspection: boolean;
  readonly supportsCompatibilityCheck: boolean;
  readonly supportsDryRun: boolean;
  readonly supportsBatching: boolean;
}

export interface Tex7RepositoryCapabilities {
  readonly query: Tex7RepositoryQueryCapabilities;
  readonly write: Tex7RepositoryWriteCapabilities;
  readonly migration: Tex7RepositoryMigrationCapabilities;
  readonly tenancy: {
    readonly supportsTenantIsolation: boolean;
    readonly supportsProductIsolation: boolean;
  };
  readonly schema: {
    readonly supportsVersionMetadata: boolean;
    readonly supportsCompatibilityChecks: boolean;
  };
}

export interface Tex7RepositoryProviderMetadata {
  readonly id: string;
  readonly displayName: string;
  readonly family: Tex7RepositoryProviderFamily;
  readonly providerVersion: Tex7RepositoryVersion;
  readonly capabilities: Tex7RepositoryCapabilities;
}

export interface Tex7RepositoryProvider {
  readonly metadata: Tex7RepositoryProviderMetadata;
  readonly supportsCapability: (capabilityPath: string) => boolean;
  readonly getRepository: <TEntity extends Record<string, unknown>>(
    repositoryKey: string,
    context?: Tex7RepositoryContext,
  ) => Tex7RepositoryResult<Tex7RepositoryContract<TEntity> | null>;
}
