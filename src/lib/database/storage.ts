import type {
  DatabaseAdapter,
  DatabaseDeleteInput,
  DatabaseQuery,
  DatabaseRecord,
  DatabaseRecordId,
  DatabaseUpdateInput,
  DatabaseWriteInput
} from "./database";

export interface DataStorage {
  readonly adapter: DatabaseAdapter;

  findMany<TRecord extends DatabaseRecord>(
    query: DatabaseQuery
  ): Promise<readonly TRecord[]>;

  findById<TRecord extends DatabaseRecord>(
    collection: string,
    id: DatabaseRecordId
  ): Promise<TRecord | null>;

  create<TRecord extends DatabaseRecord>(
    input: DatabaseWriteInput
  ): Promise<TRecord>;

  update<TRecord extends DatabaseRecord>(
    input: DatabaseUpdateInput
  ): Promise<TRecord>;

  delete(input: DatabaseDeleteInput): Promise<void>;
}

function assertWritable(
  method: "create" | "update" | "delete",
  adapter: DatabaseAdapter
): void {
  if (!adapter[method]) {
    throw new Error(
      `The ${adapter.info.name} data adapter does not support ${method}.`
    );
  }
}

export function createDataStorage(adapter: DatabaseAdapter): DataStorage {
  return {
    adapter,

    findMany<TRecord extends DatabaseRecord>(
      query: DatabaseQuery
    ): Promise<readonly TRecord[]> {
      return adapter.findMany<TRecord>(query);
    },

    findById<TRecord extends DatabaseRecord>(
      collection: string,
      id: DatabaseRecordId
    ): Promise<TRecord | null> {
      return adapter.findById<TRecord>(collection, id);
    },

    create<TRecord extends DatabaseRecord>(
      input: DatabaseWriteInput
    ): Promise<TRecord> {
      assertWritable("create", adapter);
      return adapter.create!(input);
    },

    update<TRecord extends DatabaseRecord>(
      input: DatabaseUpdateInput
    ): Promise<TRecord> {
      assertWritable("update", adapter);
      return adapter.update!(input);
    },

    delete(input: DatabaseDeleteInput): Promise<void> {
      assertWritable("delete", adapter);
      return adapter.delete!(input);
    }
  };
}