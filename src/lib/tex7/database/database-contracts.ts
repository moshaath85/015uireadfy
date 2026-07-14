import type {
  Tex7AuditFieldMapping,
  Tex7OptimisticLock,
  Tex7RepositoryKey,
  Tex7SoftDeleteMetadata,
} from "./database-context";
import type { Tex7ConnectionPage, Tex7DatabaseResult } from "./database-result";
import type { Tex7DatabaseTransaction } from "./database-transaction";

export type Tex7FilterOperator =
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

export interface Tex7DatabaseFilter {
  readonly field: string;
  readonly operator: Tex7FilterOperator;
  readonly value?: unknown;
}

export interface Tex7DatabaseSort {
  readonly field: string;
  readonly direction: "asc" | "desc";
  readonly nulls?: "first" | "last";
}

export interface Tex7OffsetPagination {
  readonly mode: "offset";
  readonly page: number;
  readonly pageSize: number;
}

export interface Tex7CursorPagination {
  readonly mode: "cursor";
  readonly first?: number;
  readonly after?: string;
  readonly last?: number;
  readonly before?: string;
}

export type Tex7Pagination = Tex7OffsetPagination | Tex7CursorPagination;

export interface Tex7DatabaseQuery {
  readonly filters?: readonly Tex7DatabaseFilter[];
  readonly sort?: readonly Tex7DatabaseSort[];
  readonly pagination?: Tex7Pagination;
  readonly includeDeleted?: boolean;
}

export interface Tex7CreateOptions {
  readonly audit?: Tex7AuditFieldMapping;
}

export interface Tex7UpdateOptions {
  readonly optimisticLock?: Tex7OptimisticLock;
  readonly audit?: Tex7AuditFieldMapping;
}

export interface Tex7DeleteOptions {
  readonly softDelete?: Tex7SoftDeleteMetadata;
  readonly optimisticLock?: Tex7OptimisticLock;
}

export interface Tex7DatabaseRepositoryContract<TEntity extends Record<string, unknown>> {
  readonly key: Tex7RepositoryKey;
  readonly entityName: string;
  readonly findMany: (
    query?: Tex7DatabaseQuery,
    transaction?: Tex7DatabaseTransaction,
  ) => Promise<Tex7DatabaseResult<Tex7ConnectionPage<TEntity>>>;
  readonly findById: (
    id: string | number,
    transaction?: Tex7DatabaseTransaction,
  ) => Promise<Tex7DatabaseResult<TEntity | null>>;
  readonly create: (
    input: Partial<TEntity>,
    options?: Tex7CreateOptions,
    transaction?: Tex7DatabaseTransaction,
  ) => Promise<Tex7DatabaseResult<TEntity>>;
  readonly update: (
    id: string | number,
    input: Partial<TEntity>,
    options?: Tex7UpdateOptions,
    transaction?: Tex7DatabaseTransaction,
  ) => Promise<Tex7DatabaseResult<TEntity>>;
  readonly delete: (
    id: string | number,
    options?: Tex7DeleteOptions,
    transaction?: Tex7DatabaseTransaction,
  ) => Promise<Tex7DatabaseResult<{ readonly deleted: boolean }>>;
}

export interface Tex7RepositoryRegistration<TEntity extends Record<string, unknown>> {
  readonly repository: Tex7DatabaseRepositoryContract<TEntity>;
  readonly providerId?: string;
  readonly productId?: string;
}
