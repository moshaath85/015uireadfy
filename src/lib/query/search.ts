import type { FilterInput } from "./filters";
import type { SortRule } from "./sorting";

export interface SearchPagination {
  readonly page: number;
  readonly pageSize: number;
}

export interface SearchQuery {
  readonly term?: string;
  readonly filters?: readonly FilterInput[];
  readonly sort?: readonly SortRule[];
  readonly pagination?: SearchPagination;
}

export interface SearchResult<TItem> {
  readonly items: readonly TItem[];
  readonly total: number;
  readonly query: SearchQuery;
}

export function createSearchQuery(input: SearchQuery = {}): SearchQuery {
  return {
    term: normalizeSearchTerm(input.term),
    filters: input.filters ?? [],
    sort: input.sort ?? [],
    pagination: input.pagination
  };
}

export function normalizeSearchTerm(term?: string): string | undefined {
  const normalized = term?.trim();

  return normalized ? normalized : undefined;
}

export function hasSearchTerm(query: SearchQuery): boolean {
  return Boolean(normalizeSearchTerm(query.term));
}

export function getSearchOffset(pagination?: SearchPagination): number {
  if (!pagination) {
    return 0;
  }

  return Math.max(0, pagination.page - 1) * pagination.pageSize;
}