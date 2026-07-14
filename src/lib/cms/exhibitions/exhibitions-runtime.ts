import type { Exhibition } from "@/types";
import type {
  ExhibitionValidatedInput,
  ExhibitionValidationIssue,
} from "./exhibitions-validation";

export type ExhibitionRuntimeMode = "create" | "update";
export type ExhibitionRuntimeStatus =
  | "prepared"
  | "validation_error"
  | "mutation_disabled";

export interface ExhibitionRuntimeContext {
  readonly mutationEnabled?: boolean;
  readonly existingExhibitionId?: Exhibition["id"];
}

export interface ExhibitionRuntimeSuccess {
  readonly ok: true;
  readonly mode: ExhibitionRuntimeMode;
  readonly status: "prepared";
  readonly data: ExhibitionValidatedInput;
  readonly exhibitionId?: Exhibition["id"];
  readonly shouldWriteJson: false;
  readonly message: string;
}

export interface ExhibitionRuntimeFailure {
  readonly ok: false;
  readonly mode: ExhibitionRuntimeMode;
  readonly status: Exclude<ExhibitionRuntimeStatus, "prepared">;
  readonly issues: readonly ExhibitionValidationIssue[];
  readonly exhibitionId?: Exhibition["id"];
  readonly shouldWriteJson: false;
  readonly message: string;
}

export type ExhibitionRuntimeResult =
  | ExhibitionRuntimeSuccess
  | ExhibitionRuntimeFailure;

export function createExhibitionPreparedResult(
  mode: ExhibitionRuntimeMode,
  data: ExhibitionValidatedInput,
  exhibitionId?: Exhibition["id"],
): ExhibitionRuntimeSuccess {
  return {
    ok: true,
    mode,
    status: "prepared",
    data,
    exhibitionId,
    shouldWriteJson: false,
    message: "Exhibition input is valid. JSON mutation is not implemented for Exhibitions yet.",
  };
}

export function createExhibitionValidationErrorResult(
  mode: ExhibitionRuntimeMode,
  issues: readonly ExhibitionValidationIssue[],
  exhibitionId?: Exhibition["id"],
  message = "Exhibition input could not be validated.",
): ExhibitionRuntimeFailure {
  return {
    ok: false,
    mode,
    status: "validation_error",
    issues,
    exhibitionId,
    shouldWriteJson: false,
    message,
  };
}

export function createExhibitionMutationDisabledResult(
  mode: ExhibitionRuntimeMode,
  exhibitionId?: Exhibition["id"],
  message = "Exhibition JSON mutation is intentionally disabled in this runtime foundation patch.",
): ExhibitionRuntimeFailure {
  return {
    ok: false,
    mode,
    status: "mutation_disabled",
    issues: [],
    exhibitionId,
    shouldWriteJson: false,
    message,
  };
}