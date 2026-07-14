import type { JsonWriteTarget } from "./json-file-types";
import { guardJsonWrite, type JsonWriteGuardOptions } from "./json-write-guards";
import {
  createJsonWriteSuccess,
  type JsonWriteOperation,
  type JsonWriteResult,
} from "./json-write-result";

export interface JsonWriterRequest<TRecord = Record<string, unknown>> {
  operation: JsonWriteOperation;
  target: JsonWriteTarget<TRecord>;
  record?: Partial<TRecord>;
  options?: JsonWriteGuardOptions;
}

export interface JsonWriterAdapter {
  write<TRecord = Record<string, unknown>>(
    request: JsonWriterRequest<TRecord>,
  ): JsonWriteResult<TRecord>;
}

export const createJsonWriterAdapter = (): JsonWriterAdapter => ({
  write<TRecord = Record<string, unknown>>(
    request: JsonWriterRequest<TRecord>,
  ): JsonWriteResult<TRecord> {
    const guardResult = guardJsonWrite<TRecord>(request);

    if (!guardResult.ok) {
      return guardResult;
    }

    return createJsonWriteSuccess(
      request.operation,
      request.target.file.entity,
      "JSON write guard passed. File mutation may proceed through an entity-specific development adapter.",
      request.record as TRecord | undefined,
    );
  },
});

export const jsonWriter = createJsonWriterAdapter();

export const previewJsonWrite = <TRecord = Record<string, unknown>>(
  request: JsonWriterRequest<TRecord>,
): JsonWriteResult<TRecord> => jsonWriter.write(request);