export type SortDirection = "asc" | "desc";

export interface SortRule {
  readonly field: string;
  readonly direction: SortDirection;
}

export interface SortOption {
  readonly label: string;
  readonly value: string;
  readonly rule: SortRule;
}

export function createSortRule(
  field: string,
  direction: SortDirection = "asc"
): SortRule {
  return {
    field,
    direction
  };
}

export function reverseSortDirection(direction: SortDirection): SortDirection {
  return direction === "asc" ? "desc" : "asc";
}

export function compareSortableValues(
  left: unknown,
  right: unknown,
  direction: SortDirection = "asc"
): number {
  const multiplier = direction === "asc" ? 1 : -1;

  if (typeof left === "number" && typeof right === "number") {
    return (left - right) * multiplier;
  }

  return String(left ?? "").localeCompare(String(right ?? "")) * multiplier;
}

export function normalizeSortRules(
  rules: readonly SortRule[] = []
): readonly SortRule[] {
  return rules.filter((rule) => rule.field.trim().length > 0);
}