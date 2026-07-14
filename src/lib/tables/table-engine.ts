import type { TableConfig } from "./table-config";
import type {
  TableBulkActionDefinition,
  TableEntity,
  TableFilterDefinition,
  TableQuery,
  TableResult,
  TableSelection,
  TableSortDefinition,
  TableState,
} from "./table-types";

export interface TableQueryEngine<TEntity extends TableEntity = TableEntity> {
  createInitialState(config: TableConfig<TEntity>): TableState<TEntity>;
  applySearch(state: TableState<TEntity>, search: string): TableState<TEntity>;
  applySort(state: TableState<TEntity>, sort: TableSortDefinition<TEntity>): TableState<TEntity>;
  applyFilters(
    state: TableState<TEntity>,
    filters: readonly TableFilterDefinition<TEntity>[],
  ): TableState<TEntity>;
  applyPage(state: TableState<TEntity>, page: number, pageSize: number): TableState<TEntity>;
}

export interface TableSelectionEngine<TEntity extends TableEntity = TableEntity> {
  selectOne(state: TableState<TEntity>, id: TEntity["id"]): TableState<TEntity>;
  deselectOne(state: TableState<TEntity>, id: TEntity["id"]): TableState<TEntity>;
  selectMany(state: TableState<TEntity>, selection: TableSelection<TEntity>): TableState<TEntity>;
  clearSelection(state: TableState<TEntity>): TableState<TEntity>;
}

export interface TableBulkActionContext<TEntity extends TableEntity = TableEntity> {
  readonly action: TableBulkActionDefinition;
  readonly selection: TableSelection<TEntity>;
  readonly query: TableQuery<TEntity>;
}

export interface TableEngine<TEntity extends TableEntity = TableEntity>
  extends TableQueryEngine<TEntity>,
    TableSelectionEngine<TEntity> {
  resolveQuery(state: TableState<TEntity>): TableQuery<TEntity>;
  resolveResult(query: TableQuery<TEntity>): Promise<TableResult<TEntity>>;
  canRunBulkAction(context: TableBulkActionContext<TEntity>): boolean;
}