export type JsonWriteOperation = "create" | "update" | "delete";

export type JsonWriteBlockReason =
  | "writes_disabled"
  | "unsafe_environment"
  | "authorization_required"
  | "invalid_target"
  | "invalid_path"
  | "invalid_payload"
  | "mutation_not_implemented";

export interface JsonWriteSuccess<TRecord = unknown> {
  ok: true;
  operation: JsonWriteOperation;
  target: string;
  record?: TRecord;
  message: string;
}

export interface JsonWriteFailure {
  ok: false;
  operation: JsonWriteOperation;
  target?: string;
  reason: JsonWriteBlockReason;
  message: string;
  details?: readonly string[];
}

export type JsonWriteResult<TRecord = unknown> =
  | JsonWriteSuccess<TRecord>
  | JsonWriteFailure;

export const createJsonWriteFailure = (
  operation: JsonWriteOperation,
  reason: JsonWriteBlockReason,
  message: string,
  target?: string,
  details: readonly string[] = [],
): JsonWriteFailure => ({
  ok: false,
  operation,
  target,
  reason,
  message,
  details,
});

export const createJsonWriteSuccess = <TRecord = unknown>(
  operation: JsonWriteOperation,
  target: string,
  message: string,
  record?: TRecord,
): JsonWriteSuccess<TRecord> => ({
  ok: true,
  operation,
  target,
  message,
  record,
});