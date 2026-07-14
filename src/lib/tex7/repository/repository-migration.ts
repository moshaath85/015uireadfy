import type { Tex7RepositoryContext, Tex7RepositorySchemaMetadata } from "./repository-context";
import type { Tex7RepositoryContract } from "./repository-contracts";
import type { Tex7RepositoryProviderMetadata } from "./repository-provider";
import type { Tex7RepositoryQuery } from "./repository-query";
import type { Tex7RepositoryResult } from "./repository-result";

export type Tex7RepositoryMigrationMode = "validate-only" | "dry-run" | "copy" | "cutover-check";

export interface Tex7RepositoryMigrationEndpoint<TEntity extends Record<string, unknown>> {
  readonly provider: Tex7RepositoryProviderMetadata;
  readonly repository: Tex7RepositoryContract<TEntity>;
  readonly schema: Tex7RepositorySchemaMetadata;
}

export interface Tex7RepositoryMigrationCompatibility {
  readonly compatible: boolean;
  readonly sourceSchema: Tex7RepositorySchemaMetadata;
  readonly targetSchema: Tex7RepositorySchemaMetadata;
  readonly warnings: readonly string[];
  readonly blockers: readonly string[];
}

export interface Tex7RepositoryMigrationPlan<TEntity extends Record<string, unknown>> {
  readonly key: string;
  readonly mode: Tex7RepositoryMigrationMode;
  readonly source: Tex7RepositoryMigrationEndpoint<TEntity>;
  readonly target: Tex7RepositoryMigrationEndpoint<TEntity>;
  readonly query?: Tex7RepositoryQuery;
  readonly batchSize?: number;
  readonly context?: Tex7RepositoryContext;
}

export interface Tex7RepositoryMigrationReport {
  readonly key: string;
  readonly mode: Tex7RepositoryMigrationMode;
  readonly compatible: boolean;
  readonly scannedCount: number;
  readonly acceptedCount: number;
  readonly rejectedCount: number;
  readonly warnings: readonly string[];
  readonly blockers: readonly string[];
}

export interface Tex7RepositoryMigrationAdapter<TEntity extends Record<string, unknown>> {
  readonly inspectCompatibility: (
    plan: Tex7RepositoryMigrationPlan<TEntity>,
  ) => Promise<Tex7RepositoryResult<Tex7RepositoryMigrationCompatibility>>;
  readonly validatePlan: (
    plan: Tex7RepositoryMigrationPlan<TEntity>,
  ) => Promise<Tex7RepositoryResult<Tex7RepositoryMigrationReport>>;
  readonly executePlan: (
    plan: Tex7RepositoryMigrationPlan<TEntity>,
  ) => Promise<Tex7RepositoryResult<Tex7RepositoryMigrationReport>>;
}
