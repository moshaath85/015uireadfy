import type { Collection } from "@/types";
import type {
  CollectionValidatedInput,
  CollectionValidationIssue,
} from "./collections-validation";

export type CollectionRuntimeMode = "create" | "update";
export type CollectionRuntimeStatus =
  | "prepared"
  | "validation_error"
  | "mutation_disabled";

export interface CollectionRuntimeContext {
  readonly mutationEnabled?: boolean;
  readonly existingCollectionId?: Collection["id"];
}

export interface CollectionRuntimeSuccess {
  readonly ok: true;
  readonly mode: CollectionRuntimeMode;
  readonly status: "prepared";
  readonly data: CollectionValidatedInput;
  readonly collectionId?: Collection["id"];
  readonly shouldWriteJson: false;
  readonly message: string;
}

export interface CollectionRuntimeFailure {
  readonly ok: false;
  readonly mode: CollectionRuntimeMode;
  readonly status: Exclude<CollectionRuntimeStatus, "prepared">;
  readonly issues: readonly CollectionValidationIssue[];
  readonly collectionId?: Collection["id"];
  readonly shouldWriteJson: false;
  readonly message: string;
}

export type CollectionRuntimeResult =
  | CollectionRuntimeSuccess
  | CollectionRuntimeFailure;

export function createCollectionPreparedResult(
  mode: CollectionRuntimeMode,
  data: CollectionValidatedInput,
  collectionId?: Collection["id"],
): CollectionRuntimeSuccess {
  return {
    ok: true,
    mode,
    status: "prepared",
    data,
    collectionId,
    shouldWriteJson: false,
    message: "Collection input is valid. JSON mutation is not implemented for Collections yet.",
  };
}

export function createCollectionValidationErrorResult(
  mode: CollectionRuntimeMode,
  issues: readonly CollectionValidationIssue[],
  collectionId?: Collection["id"],
  message = "Collection input could not be validated.",
): CollectionRuntimeFailure {
  return {
    ok: false,
    mode,
    status: "validation_error",
    issues,
    collectionId,
    shouldWriteJson: false,
    message,
  };
}

export function createCollectionMutationDisabledResult(
  mode: CollectionRuntimeMode,
  collectionId?: Collection["id"],
  message = "Collection JSON mutation is intentionally disabled in this runtime foundation patch.",
): CollectionRuntimeFailure {
  return {
    ok: false,
    mode,
    status: "mutation_disabled",
    issues: [],
    collectionId,
    shouldWriteJson: false,
    message,
  };
}