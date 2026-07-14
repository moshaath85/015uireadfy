import type { EntityAction, EntityResource, PermissionPrincipal } from "../permissions";
import type { ServiceResult } from "./service-result";

export type EntityId = string;

export interface ServiceContext {
  readonly principal?: PermissionPrincipal;
}

export interface EntityServicePermission {
  readonly action: EntityAction;
  readonly resource: EntityResource;
  readonly ownerId?: string;
}

export interface EntityListOptions {
  readonly page?: number;
  readonly pageSize?: number;
  readonly query?: string;
  readonly includeDrafts?: boolean;
}

export interface EntityListResult<TEntity> {
  readonly items: readonly TEntity[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export interface EntityService<TEntity, TCreateInput, TUpdateInput> {
  readonly resource: EntityResource;

  list(
    options?: EntityListOptions,
    context?: ServiceContext
  ): Promise<ServiceResult<EntityListResult<TEntity>>>;

  getById(id: EntityId, context?: ServiceContext): Promise<ServiceResult<TEntity>>;

  create(input: TCreateInput, context: ServiceContext): Promise<ServiceResult<TEntity>>;

  update(
    id: EntityId,
    input: TUpdateInput,
    context: ServiceContext
  ): Promise<ServiceResult<TEntity>>;

  delete(id: EntityId, context: ServiceContext): Promise<ServiceResult<void>>;
}

export interface PermissionAwareEntityService<TEntity, TCreateInput, TUpdateInput>
  extends EntityService<TEntity, TCreateInput, TUpdateInput> {
  can(
    permission: EntityServicePermission,
    context?: ServiceContext
  ): ServiceResult<boolean>;
}