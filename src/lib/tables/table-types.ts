export type TableEntityId = string | number;

export interface TableEntity {
  readonly id: TableEntityId;
}

export type TableColumnType =
  | "text"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "status"
  | "visibility"
  | "image"
  | "url"
  | "email"
  | "tags"
  | "json";

export type TableSortDirection = "asc" | "desc";

export type TableFilterOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "in"
  | "notIn"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "exists";

export type TableBulkActionType =
  | "publish"
  | "unpublish"
  | "archive"
  | "restore"
  | "delete"
  | "custom";

export interface TableColumnDefinition<TEntity extends TableEntity = TableEntity> {
  readonly key: keyof TEntity & string;
  readonly label: string;
  readonly type: TableColumnType;
  readonly sortable?: boolean;
  readonly filterable?: boolean;
  readonly searchable?: boolean;
  readonly hidden?: boolean;
  readonly width?: string;
  readonly align?: "left" | "center" | "right";
  readonly description?: string;
}

export interface TableSortDefinition<TEntity extends TableEntity = TableEntity> {
  readonly field: keyof TEntity & string;
  readonly direction: TableSortDirection;
}

export interface TableFilterDefinition<TEntity extends TableEntity = TableEntity> {
  readonly field: keyof TEntity & string;
  readonly operator: TableFilterOperator;
  readonly value?: unknown;
}

export interface TablePaginationDefinition {
  readonly page: number;
  readonly pageSize: number;
}

export interface TableBulkActionDefinition {
  readonly key: string;
  readonly label: string;
  readonly type: TableBulkActionType;
  readonly confirmationRequired?: boolean;
  readonly description?: string;
}

export interface TableQuery<TEntity extends TableEntity = TableEntity> {
  readonly search?: string;
  readonly sort?: TableSortDefinition<TEntity>;
  readonly filters?: readonly TableFilterDefinition<TEntity>[];
  readonly pagination?: TablePaginationDefinition;
}

export interface TableResult<TEntity extends TableEntity = TableEntity> {
  readonly items: readonly TEntity[];
  readonly total: number;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface TableSelection<TEntity extends TableEntity = TableEntity> {
  readonly ids: readonly TEntity["id"][];
}

export interface TableState<TEntity extends TableEntity = TableEntity> {
  readonly query: TableQuery<TEntity>;
  readonly selection?: TableSelection<TEntity>;
}