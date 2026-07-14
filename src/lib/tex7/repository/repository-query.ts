export type Tex7RepositoryFilterOperator =
  | "eq"
  | "neq"
  | "in"
  | "notIn"
  | "lt"
  | "lte"
  | "gt"
  | "gte"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "isNull"
  | "isNotNull";

export type Tex7RepositoryLogicalOperator = "and" | "or";

export interface Tex7RepositoryFilter {
  readonly field: string;
  readonly operator: Tex7RepositoryFilterOperator;
  readonly value?: unknown;
}

export interface Tex7RepositoryFilterGroup {
  readonly operator: Tex7RepositoryLogicalOperator;
  readonly filters: readonly (Tex7RepositoryFilter | Tex7RepositoryFilterGroup)[];
}

export interface Tex7RepositorySort {
  readonly field: string;
  readonly direction: "asc" | "desc";
  readonly nulls?: "first" | "last";
}

export interface Tex7RepositoryOffsetPagination {
  readonly mode: "offset";
  readonly page: number;
  readonly pageSize: number;
}

export interface Tex7RepositoryCursorPagination {
  readonly mode: "cursor";
  readonly first?: number;
  readonly after?: string;
  readonly last?: number;
  readonly before?: string;
}

export type Tex7RepositoryPagination =
  | Tex7RepositoryOffsetPagination
  | Tex7RepositoryCursorPagination;

export interface Tex7RepositoryRelationLoad {
  readonly relation: string;
  readonly required?: boolean;
  readonly query?: Omit<Tex7RepositoryQuery, "relations">;
}

export interface Tex7RepositoryQuery {
  readonly filter?: Tex7RepositoryFilter | Tex7RepositoryFilterGroup;
  readonly sort?: readonly Tex7RepositorySort[];
  readonly pagination?: Tex7RepositoryPagination;
  readonly relations?: readonly Tex7RepositoryRelationLoad[];
  readonly includeDeleted?: boolean;
}
