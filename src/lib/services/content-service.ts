import type { EntityResource } from "../permissions";
import type {
  EntityId,
  EntityListOptions,
  EntityListResult,
  ServiceContext
} from "./entity-service";
import type { ServiceResult } from "./service-result";

export type ContentLocale = "en" | "zh";

export interface LocalizedContentValue {
  readonly en: string;
  readonly zh?: string;
}

export interface ContentPublishState {
  readonly isPublished: boolean;
  readonly publishedAt?: string;
}

export interface ContentDraft<TEntity> {
  readonly id?: EntityId;
  readonly resource: EntityResource;
  readonly values: TEntity;
  readonly publishState?: ContentPublishState;
}

export interface ContentService<TEntity, TCreateInput, TUpdateInput> {
  readonly resource: EntityResource;

  listPublished(
    options?: EntityListOptions,
    context?: ServiceContext
  ): Promise<ServiceResult<EntityListResult<TEntity>>>;

  getPublishedBySlug(slug: string, context?: ServiceContext): Promise<ServiceResult<TEntity>>;

  listDrafts(
    options: EntityListOptions | undefined,
    context: ServiceContext
  ): Promise<ServiceResult<EntityListResult<ContentDraft<TEntity>>>>;

  createDraft(
    input: TCreateInput,
    context: ServiceContext
  ): Promise<ServiceResult<ContentDraft<TEntity>>>;

  updateDraft(
    id: EntityId,
    input: TUpdateInput,
    context: ServiceContext
  ): Promise<ServiceResult<ContentDraft<TEntity>>>;

  publish(id: EntityId, context: ServiceContext): Promise<ServiceResult<TEntity>>;

  unpublish(id: EntityId, context: ServiceContext): Promise<ServiceResult<ContentDraft<TEntity>>>;
}