export type DatabaseProvider =
  | "json"
  | "postgresql"
  | "sqlite"
  | "supabase"
  | "rest";

export type DatabaseRecord = Record<string, unknown>;

export type DatabaseRecordId = string;

export type DatabaseSortDirection = "asc" | "desc";

export interface DatabaseAdapterInfo {
  readonly provider: DatabaseProvider;
  readonly name: string;
  readonly readOnly: boolean;
}

export interface DatabaseQueryFilter {
  readonly field: string;
  readonly value: unknown;
}

export interface DatabaseQuery {
  readonly collection: string;
  readonly filters?: readonly DatabaseQueryFilter[];
  readonly limit?: number;
  readonly offset?: number;
  readonly orderBy?: string;
  readonly orderDirection?: DatabaseSortDirection;
}

export interface DatabaseWriteInput {
  readonly collection: string;
  readonly record: DatabaseRecord;
}

export interface DatabaseUpdateInput {
  readonly collection: string;
  readonly id: DatabaseRecordId;
  readonly record: Partial<DatabaseRecord>;
}

export interface DatabaseDeleteInput {
  readonly collection: string;
  readonly id: DatabaseRecordId;
}

export interface DatabaseAdapter {
  readonly info: DatabaseAdapterInfo;

  connect?(): Promise<void>;

  disconnect?(): Promise<void>;

  findMany<TRecord extends DatabaseRecord>(
    query: DatabaseQuery
  ): Promise<readonly TRecord[]>;

  findById<TRecord extends DatabaseRecord>(
    collection: string,
    id: DatabaseRecordId
  ): Promise<TRecord | null>;

  create?<TRecord extends DatabaseRecord>(
    input: DatabaseWriteInput
  ): Promise<TRecord>;

  update?<TRecord extends DatabaseRecord>(
    input: DatabaseUpdateInput
  ): Promise<TRecord>;

  delete?(input: DatabaseDeleteInput): Promise<void>;
}