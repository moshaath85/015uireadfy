export type FilterOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "in"
  | "notIn"
  | "exists"
  | "greaterThan"
  | "greaterThanOrEqual"
  | "lessThan"
  | "lessThanOrEqual";

export type FilterValue = string | number | boolean | null | readonly string[] | readonly number[];

export interface QueryFilter {
  readonly field: string;
  readonly operator: FilterOperator;
  readonly value?: FilterValue;
}

export interface FilterGroup {
  readonly mode: "and" | "or";
  readonly filters: readonly QueryFilter[];
}

export type FilterInput = QueryFilter | FilterGroup;

export function createFilter(
  field: string,
  operator: FilterOperator,
  value?: FilterValue
): QueryFilter {
  return {
    field,
    operator,
    value
  };
}

export function createFilterGroup(
  mode: "and" | "or",
  filters: readonly QueryFilter[]
): FilterGroup {
  return {
    mode,
    filters
  };
}

export function hasActiveFilters(filters: readonly FilterInput[] = []): boolean {
  return filters.some((filter) => {
    if ("filters" in filter) {
      return filter.filters.length > 0;
    }

    return filter.operator === "exists" || filter.value !== undefined;
  });
}