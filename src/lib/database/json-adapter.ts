import type {
  DatabaseAdapter,
  DatabaseQuery,
  DatabaseQueryFilter,
  DatabaseRecord
} from "./database";

export type JsonDataSource = Readonly<Record<string, readonly DatabaseRecord[]>>;

function matchesFilter(record: DatabaseRecord, filter: DatabaseQueryFilter): boolean {
  return record[filter.field] === filter.value;
}

function applyFilters(
  records: readonly DatabaseRecord[],
  filters: readonly DatabaseQueryFilter[] = []
): readonly DatabaseRecord[] {
  if (filters.length === 0) {
    return records;
  }

  return records.filter((record) =>
    filters.every((filter) => matchesFilter(record, filter))
  );
}

function compareValues(left: unknown, right: unknown): number {
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left ?? "").localeCompare(String(right ?? ""));
}

function applySorting(
  records: readonly DatabaseRecord[],
  query: DatabaseQuery
): readonly DatabaseRecord[] {
  if (!query.orderBy) {
    return records;
  }

  const direction = query.orderDirection === "desc" ? -1 : 1;

  return [...records].sort(
    (left, right) =>
      compareValues(left[query.orderBy as string], right[query.orderBy as string]) *
      direction
  );
}

function applyPagination(
  records: readonly DatabaseRecord[],
  query: DatabaseQuery
): readonly DatabaseRecord[] {
  const offset = query.offset ?? 0;
  const limit = query.limit ?? records.length;

  return records.slice(offset, offset + limit);
}

export function createJsonAdapter(source: JsonDataSource): DatabaseAdapter {
  return {
    info: {
      provider: "json",
      name: "Local JSON Adapter",
      readOnly: true
    },

    async findMany<TRecord extends DatabaseRecord>(
      query: DatabaseQuery
    ): Promise<readonly TRecord[]> {
      const collection = source[query.collection] ?? [];
      const filtered = applyFilters(collection, query.filters);
      const sorted = applySorting(filtered, query);
      const paginated = applyPagination(sorted, query);

      return paginated as readonly TRecord[];
    },

    async findById<TRecord extends DatabaseRecord>(
      collection: string,
      id: string
    ): Promise<TRecord | null> {
      const records = source[collection] ?? [];
      const record = records.find((item) => item.id === id);

      return (record as TRecord | undefined) ?? null;
    }
  };
}