import type {
  TableBulkActionDefinition,
  TableColumnDefinition,
  TableEntity,
  TableFilterDefinition,
  TablePaginationDefinition,
  TableSortDefinition,
} from "./table-types";

export interface TableConfig<TEntity extends TableEntity = TableEntity> {
  readonly key: string;
  readonly title: string;
  readonly description?: string;
  readonly columns: readonly TableColumnDefinition<TEntity>[];
  readonly defaultSort?: TableSortDefinition<TEntity>;
  readonly defaultFilters?: readonly TableFilterDefinition<TEntity>[];
  readonly defaultPagination?: TablePaginationDefinition;
  readonly bulkActions?: readonly TableBulkActionDefinition[];
  readonly emptyTitle?: string;
  readonly emptyDescription?: string;
}

export interface TableModuleConfig<TEntity extends TableEntity = TableEntity> {
  readonly entity: string;
  readonly table: TableConfig<TEntity>;
}

export interface TableConfigRegistry<TEntity extends TableEntity = TableEntity> {
  readonly modules: readonly TableModuleConfig<TEntity>[];
}