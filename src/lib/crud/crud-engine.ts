import type {
  CrudCreateInput,
  CrudEntity,
  CrudEntityId,
  CrudListQuery,
  CrudListResult,
  CrudUpdateInput
} from "./crud-types";

export interface CrudEngine<TEntity extends CrudEntity = CrudEntity> {
  list(query?: CrudListQuery<TEntity>): Promise<CrudListResult<TEntity>>;
  get(id: CrudEntityId): Promise<TEntity | null>;
  create(input: CrudCreateInput<TEntity>): Promise<TEntity>;
  update(id: CrudEntityId, input: CrudUpdateInput<TEntity>): Promise<TEntity>;
  delete(id: CrudEntityId): Promise<void>;
}