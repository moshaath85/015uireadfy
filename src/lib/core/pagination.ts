export interface PaginationInput {
  readonly page?: number;
  readonly pageSize?: number;
}

export interface PaginationOptions {
  readonly defaultPageSize?: number;
  readonly maxPageSize?: number;
}

export interface PaginationState {
  readonly page: number;
  readonly pageSize: number;
  readonly offset: number;
  readonly limit: number;
}

export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;
const DEFAULT_MAX_PAGE_SIZE = 100;

export function normalizePagination(
  input: PaginationInput = {},
  options: PaginationOptions = {}
): PaginationState {
  const maxPageSize = Math.max(1, options.maxPageSize ?? DEFAULT_MAX_PAGE_SIZE);
  const defaultPageSize = Math.min(
    Math.max(1, options.defaultPageSize ?? DEFAULT_PAGE_SIZE),
    maxPageSize
  );

  const page = Math.max(DEFAULT_PAGE, Math.floor(input.page ?? DEFAULT_PAGE));
  const pageSize = Math.min(
    Math.max(1, Math.floor(input.pageSize ?? defaultPageSize)),
    maxPageSize
  );

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
    limit: pageSize
  };
}

export function paginateItems<T>(
  items: readonly T[],
  input: PaginationInput = {},
  options: PaginationOptions = {}
): PaginatedResult<T> {
  const pagination = normalizePagination(input, options);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pagination.pageSize));
  const pagedItems = items.slice(pagination.offset, pagination.offset + pagination.limit);

  return {
    items: pagedItems,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalItems,
    totalPages,
    hasNextPage: pagination.page < totalPages,
    hasPreviousPage: pagination.page > 1
  };
}