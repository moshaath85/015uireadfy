import type {
  ReadonlyEntityRepository,
  RepositoryEntityId,
  RepositoryListOptions,
  RepositoryListResult
} from "./entity-repository";
import type { RepositoryResult } from "./repository-result";

export interface RepositoryPublishState {
  readonly isPublished: boolean;
  readonly publishedAt?: string;
  readonly archivedAt?: string;
}

export interface RepositoryContentRecord<TEntity> {
  readonly id: RepositoryEntityId;
  readonly slug?: string;
  readonly data: TEntity;
  readonly publishState: RepositoryPublishState;
}

export interface ContentRepository<TEntity, TCreateInput, TUpdateInput>
  extends ReadonlyEntityRepository<RepositoryContentRecord<TEntity>> {
  findPublished(
    options?: RepositoryListOptions
  ): Promise<RepositoryResult<RepositoryListResult<RepositoryContentRecord<TEntity>>>>;

  findPublishedBySlug(slug: string): Promise<RepositoryResult<RepositoryContentRecord<TEntity>>>;

  findDrafts(
    options?: RepositoryListOptions
  ): Promise<RepositoryResult<RepositoryListResult<RepositoryContentRecord<TEntity>>>>;

  createDraft(input: TCreateInput): Promise<RepositoryResult<RepositoryContentRecord<TEntity>>>;

  updateDraft(
    id: RepositoryEntityId,
    input: TUpdateInput
  ): Promise<RepositoryResult<RepositoryContentRecord<TEntity>>>;

  publish(id: RepositoryEntityId): Promise<RepositoryResult<RepositoryContentRecord<TEntity>>>;

  unpublish(id: RepositoryEntityId): Promise<RepositoryResult<RepositoryContentRecord<TEntity>>>;

  archive(id: RepositoryEntityId): Promise<RepositoryResult<RepositoryContentRecord<TEntity>>>;
}