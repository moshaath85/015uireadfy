import type { Tex7RepositoryContext, Tex7RepositoryEntityId } from "./repository-context";
import type { Tex7RepositoryQuery } from "./repository-query";
import type { Tex7RepositoryConnection, Tex7RepositoryResult } from "./repository-result";
import type {
  Tex7RepositoryCreateOptions,
  Tex7RepositoryRestoreOptions,
  Tex7RepositorySoftDeleteOptions,
  Tex7RepositoryUpdateOptions,
  Tex7RepositoryWriteResult,
} from "./repository-write";

export interface Tex7RepositoryReadContract<TEntity extends Record<string, unknown>> {
  readonly findMany: (
    query?: Tex7RepositoryQuery,
    context?: Tex7RepositoryContext,
  ) => Promise<Tex7RepositoryResult<Tex7RepositoryConnection<TEntity>>>;
  readonly findById: (
    id: Tex7RepositoryEntityId,
    context?: Tex7RepositoryContext,
  ) => Promise<Tex7RepositoryResult<TEntity | null>>;
  readonly exists: (
    id: Tex7RepositoryEntityId,
    context?: Tex7RepositoryContext,
  ) => Promise<Tex7RepositoryResult<boolean>>;
}

export interface Tex7RepositoryWriteContract<TEntity extends Record<string, unknown>> {
  readonly create: (
    input: Partial<TEntity>,
    options?: Tex7RepositoryCreateOptions,
    context?: Tex7RepositoryContext,
  ) => Promise<Tex7RepositoryResult<Tex7RepositoryWriteResult<TEntity>>>;
  readonly update: (
    id: Tex7RepositoryEntityId,
    input: Partial<TEntity>,
    options?: Tex7RepositoryUpdateOptions,
    context?: Tex7RepositoryContext,
  ) => Promise<Tex7RepositoryResult<Tex7RepositoryWriteResult<TEntity>>>;
  readonly softDelete: (
    id: Tex7RepositoryEntityId,
    options: Tex7RepositorySoftDeleteOptions,
    context?: Tex7RepositoryContext,
  ) => Promise<Tex7RepositoryResult<Tex7RepositoryWriteResult<TEntity>>>;
  readonly restore: (
    id: Tex7RepositoryEntityId,
    options: Tex7RepositoryRestoreOptions,
    context?: Tex7RepositoryContext,
  ) => Promise<Tex7RepositoryResult<Tex7RepositoryWriteResult<TEntity>>>;
}

export interface Tex7RepositoryContract<TEntity extends Record<string, unknown>> {
  readonly key: string;
  readonly entityType: string;
  readonly read: Tex7RepositoryReadContract<TEntity>;
  readonly write?: Tex7RepositoryWriteContract<TEntity>;
}
