export type CrudEntityId = string | number;

export interface CrudEntity {
  readonly id: CrudEntityId;
}

export type CrudOperation = "list" | "get" | "create" | "update" | "delete";

export type CrudFieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "status"
  | "visibility"
  | "image"
  | "url"
  | "text"
  | "json";

export interface CrudFieldDefinition<TEntity extends CrudEntity = CrudEntity> {
  readonly key: keyof TEntity & string;
  readonly label: string;
  readonly type: CrudFieldType;
  readonly required?: boolean;
  readonly readonly?: boolean;
  readonly searchable?: boolean;
  readonly sortable?: boolean;
  readonly visibleInTable?: boolean;
  readonly visibleInForm?: boolean;
  readonly description?: string;
}

export interface CrudTableColumnDefinition<TEntity extends CrudEntity = CrudEntity> {
  readonly key: keyof TEntity & string;
  readonly label: string;
  readonly fieldType?: CrudFieldType;
  readonly sortable?: boolean;
  readonly searchable?: boolean;
  readonly width?: string;
  readonly align?: "left" | "center" | "right";
}

export interface CrudTableDefinition<TEntity extends CrudEntity = CrudEntity> {
  readonly title: string;
  readonly description?: string;
  readonly columns: readonly CrudTableColumnDefinition<TEntity>[];
  readonly emptyTitle?: string;
  readonly emptyDescription?: string;
}

export interface CrudSortDefinition<TEntity extends CrudEntity = CrudEntity> {
  readonly field: keyof TEntity & string;
  readonly direction: "asc" | "desc";
}

export interface CrudListQuery<TEntity extends CrudEntity = CrudEntity> {
  readonly search?: string;
  readonly sort?: CrudSortDefinition<TEntity>;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface CrudListResult<TEntity extends CrudEntity = CrudEntity> {
  readonly items: readonly TEntity[];
  readonly total: number;
}

export type CrudCreateInput<TEntity extends CrudEntity = CrudEntity> = Omit<TEntity, "id">;

export type CrudUpdateInput<TEntity extends CrudEntity = CrudEntity> = Partial<Omit<TEntity, "id">>;