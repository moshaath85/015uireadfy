import type { Collection } from "@/types";
import {
  validateCollectionFormInput,
  type CollectionValidatedInput,
  type CollectionValidationIssue,
  type CollectionValidationSource,
} from "@/lib/cms/collections/collections-validation";
import type { ProductionWriteResult } from "@/lib/cms/production-prisma";
import { saveCollectionRecord } from "@/lib/cms/production-prisma";

export type CollectionActionMode = "create" | "update";
export type CollectionActionStatus = "prepared" | "validation_error" | "mutation_disabled" | "saved";

export interface CollectionActionContext {
  readonly mutationEnabled?: boolean;
  readonly existingCollectionId?: Collection["id"];
  readonly environment?: string;
  readonly organizationId?: string;
}

export interface CollectionActionSuccess {
  readonly ok: true;
  readonly mode: CollectionActionMode;
  readonly status: "prepared" | "saved";
  readonly data: CollectionValidatedInput;
  readonly collectionId?: Collection["id"];
  readonly shouldWriteJson: false;
  readonly shouldWriteDatabase: boolean;
  readonly writeResult?: ProductionWriteResult<Collection>;
  readonly message: string;
}

export interface CollectionActionFailure {
  readonly ok: false;
  readonly mode: CollectionActionMode;
  readonly status: Exclude<CollectionActionStatus, "prepared" | "saved">;
  readonly issues: readonly CollectionValidationIssue[];
  readonly collectionId?: Collection["id"];
  readonly shouldWriteJson: false;
  readonly shouldWriteDatabase: false;
  readonly writeResult?: ProductionWriteResult<Collection>;
  readonly message: string;
}

export type CollectionActionResult = CollectionActionSuccess | CollectionActionFailure;

function preparedResult(mode: CollectionActionMode, data: CollectionValidatedInput, collectionId?: Collection["id"]): CollectionActionSuccess {
  return {
    ok: true,
    mode,
    status: "prepared",
    data,
    collectionId,
    shouldWriteJson: false,
    shouldWriteDatabase: false,
    message: "Collection input is valid. PostgreSQL mutation is disabled unless explicitly enabled.",
  };
}

function savedResult(
  mode: CollectionActionMode,
  data: CollectionValidatedInput,
  writeResult: ProductionWriteResult<Collection>,
  collectionId?: Collection["id"],
): CollectionActionSuccess {
  return {
    ok: true,
    mode,
    status: "saved",
    data,
    collectionId: writeResult.ok ? writeResult.record.id : collectionId,
    shouldWriteJson: false,
    shouldWriteDatabase: true,
    writeResult,
    message: writeResult.message,
  };
}

function validationErrorResult(
  mode: CollectionActionMode,
  issues: readonly CollectionValidationIssue[],
  collectionId?: Collection["id"],
  message = "Collection input could not be validated.",
): CollectionActionFailure {
  return {
    ok: false,
    mode,
    status: "validation_error",
    issues,
    collectionId,
    shouldWriteJson: false,
    shouldWriteDatabase: false,
    message,
  };
}

function mutationFailureResult(
  mode: CollectionActionMode,
  writeResult: ProductionWriteResult<Collection>,
  collectionId?: Collection["id"],
): CollectionActionFailure {
  return {
    ok: false,
    mode,
    status: "mutation_disabled",
    issues: [],
    collectionId,
    shouldWriteJson: false,
    shouldWriteDatabase: false,
    writeResult,
    message: writeResult.message,
  };
}

function requireOrganizationId(mode: CollectionActionMode, organizationId: string | undefined, collectionId?: Collection["id"]): CollectionActionFailure | null {
  if (organizationId) return null;
  return validationErrorResult(mode, [{ field: "slug", message: "Admin organization context is required for PostgreSQL persistence." }] as readonly CollectionValidationIssue[], collectionId);
}

export async function prepareCreateCollectionAction(
  source: CollectionValidationSource,
  context: CollectionActionContext = {},
): Promise<CollectionActionResult> {
  const validation = validateCollectionFormInput(source);

  if (!validation.valid) {
    return validationErrorResult("create", validation.issues);
  }

  if (!context.mutationEnabled) {
    return preparedResult("create", validation.data);
  }

  const organizationBlock = requireOrganizationId("create", context.organizationId);
  if (organizationBlock) return organizationBlock;

  const writeResult = await saveCollectionRecord(validation.data, {
    organizationId: context.organizationId as string,
  });

  if (!writeResult.ok) {
    return mutationFailureResult("create", writeResult);
  }

  return savedResult("create", validation.data, writeResult);
}

export async function prepareUpdateCollectionAction(
  collectionId: Collection["id"],
  source: CollectionValidationSource,
  context: CollectionActionContext = {},
): Promise<CollectionActionResult> {
  const resolvedCollectionId = context.existingCollectionId ?? collectionId;

  if (!resolvedCollectionId) {
    return validationErrorResult("update", [{ field: "slug", message: "Collection id is required for update preparation." }] as readonly CollectionValidationIssue[]);
  }

  const validation = validateCollectionFormInput(source);

  if (!validation.valid) {
    return validationErrorResult("update", validation.issues, resolvedCollectionId);
  }

  if (!context.mutationEnabled) {
    return preparedResult("update", validation.data, resolvedCollectionId);
  }

  const organizationBlock = requireOrganizationId("update", context.organizationId, resolvedCollectionId);
  if (organizationBlock) return organizationBlock;

  const writeResult = await saveCollectionRecord(validation.data, {
    id: resolvedCollectionId,
    organizationId: context.organizationId as string,
  });

  if (!writeResult.ok) {
    return mutationFailureResult("update", writeResult, resolvedCollectionId);
  }

  return savedResult("update", validation.data, writeResult, resolvedCollectionId);
}
