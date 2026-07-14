import type {
  CrudEntity,
  CrudFieldDefinition,
  CrudSortDefinition,
  CrudTableColumnDefinition,
  CrudTableDefinition
} from "./crud-types";

export interface CrudModuleConfiguration<TEntity extends CrudEntity = CrudEntity> {
  readonly moduleKey: string;
  readonly moduleLabel: string;
  readonly routePath: string;
  readonly entityLabel: string;
  readonly entityLabelPlural: string;
  readonly fields: readonly CrudFieldDefinition<TEntity>[];
  readonly columns: readonly CrudTableColumnDefinition<TEntity>[];
  readonly searchFields: readonly (keyof TEntity & string)[];
  readonly defaultSort?: CrudSortDefinition<TEntity>;
  readonly statusField?: keyof TEntity & string;
  readonly visibilityField?: keyof TEntity & string;
  readonly table: CrudTableDefinition<TEntity>;
}

export interface CrudModuleRegistry {
  readonly modules: readonly CrudModuleConfiguration[];
}