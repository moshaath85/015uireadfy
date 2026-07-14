import type { RepositoryResult } from "./repository-result";

export type RepositoryEntityId = string;

export interface RepositoryListOptions {
  readonly page?: number;
  readonly pageSize?: number;
  readonly query?: string;
  readonly sortBy?: string;
  readonly sortDirection?: "asc" | "desc";
}

export interface RepositoryListResult<TEntity> {
  readonly items: readonly TEntity[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export interface EntityRepository<TEntity, TCreateInput, TUpdateInput> {
  findAll(options?: RepositoryListOptions): Promise<RepositoryResult<RepositoryListResult<TEntity>>>;

  findById(id: RepositoryEntityId): Promise<RepositoryResult<TEntity>>;

  create(input: TCreateInput): Promise<RepositoryResult<TEntity>>;

  update(id: RepositoryEntityId, input: TUpdateInput): Promise<RepositoryResult<TEntity>>;

  delete(id: RepositoryEntityId): Promise<RepositoryResult<void>>;
}

export interface ReadonlyEntityRepository<TEntity> {
  findAll(options?: RepositoryListOptions): Promise<RepositoryResult<RepositoryListResult<TEntity>>>;

  findById(id: RepositoryEntityId): Promise<RepositoryResult<TEntity>>;
}