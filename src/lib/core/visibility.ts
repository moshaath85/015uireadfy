export type Visibility = "public" | "private" | "vip" | "hidden";

export interface VisibilityContext {
  readonly isAuthenticated?: boolean;
  readonly isVip?: boolean;
  readonly canViewPrivate?: boolean;
  readonly canViewHidden?: boolean;
}

export interface VisibilityRecord {
  readonly visibility?: Visibility;
  readonly is_public?: boolean;
}

export function normalizeVisibility(record: VisibilityRecord): Visibility {
  if (record.visibility) {
    return record.visibility;
  }

  return record.is_public === false ? "private" : "public";
}

export function canViewVisibility(
  visibility: Visibility,
  context: VisibilityContext = {}
): boolean {
  switch (visibility) {
    case "public":
      return true;
    case "private":
      return Boolean(context.isAuthenticated || context.canViewPrivate);
    case "vip":
      return Boolean(context.isVip || context.canViewPrivate);
    case "hidden":
      return Boolean(context.canViewHidden);
    default:
      return false;
  }
}

export function isVisibleRecord(
  record: VisibilityRecord,
  context: VisibilityContext = {}
): boolean {
  return canViewVisibility(normalizeVisibility(record), context);
}

export function filterVisibleRecords<T extends VisibilityRecord>(
  records: readonly T[],
  context: VisibilityContext = {}
): T[] {
  return records.filter((record) => isVisibleRecord(record, context));
}