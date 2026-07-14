import type { Exhibition } from "@/types";
import {
  validateExhibitionFormInput,
  type ExhibitionValidatedInput,
  type ExhibitionValidationIssue,
  type ExhibitionValidationSource,
} from "@/lib/cms/exhibitions/exhibitions-validation";
import type { ProductionWriteResult } from "@/lib/cms/production-prisma";
import { saveExhibitionRecord } from "@/lib/cms/production-prisma";

export type ExhibitionActionMode = "create" | "update";
export type ExhibitionActionStatus = "prepared" | "validation_error" | "mutation_disabled" | "saved";

export interface ExhibitionActionContext {
  readonly mutationEnabled?: boolean;
  readonly existingExhibitionId?: Exhibition["id"];
  readonly environment?: string;
  readonly organizationId?: string;
}

export interface ExhibitionActionSuccess {
  readonly ok: true;
  readonly mode: ExhibitionActionMode;
  readonly status: "prepared" | "saved";
  readonly data: ExhibitionValidatedInput;
  readonly exhibitionId?: Exhibition["id"];
  readonly shouldWriteJson: false;
  readonly shouldWriteDatabase: boolean;
  readonly writeResult?: ProductionWriteResult<Exhibition>;
  readonly message: string;
}

export interface ExhibitionActionFailure {
  readonly ok: false;
  readonly mode: ExhibitionActionMode;
  readonly status: Exclude<ExhibitionActionStatus, "prepared" | "saved">;
  readonly issues: readonly ExhibitionValidationIssue[];
  readonly exhibitionId?: Exhibition["id"];
  readonly shouldWriteJson: false;
  readonly shouldWriteDatabase: false;
  readonly writeResult?: ProductionWriteResult<Exhibition>;
  readonly message: string;
}

export type ExhibitionActionResult = ExhibitionActionSuccess | ExhibitionActionFailure;

function preparedResult(mode: ExhibitionActionMode, data: ExhibitionValidatedInput, exhibitionId?: Exhibition["id"]): ExhibitionActionSuccess {
  return {
    ok: true,
    mode,
    status: "prepared",
    data,
    exhibitionId,
    shouldWriteJson: false,
    shouldWriteDatabase: false,
    message: "Exhibition input is valid. PostgreSQL mutation is disabled unless explicitly enabled.",
  };
}

function savedResult(
  mode: ExhibitionActionMode,
  data: ExhibitionValidatedInput,
  writeResult: ProductionWriteResult<Exhibition>,
  exhibitionId?: Exhibition["id"],
): ExhibitionActionSuccess {
  return {
    ok: true,
    mode,
    status: "saved",
    data,
    exhibitionId: writeResult.ok ? writeResult.record.id : exhibitionId,
    shouldWriteJson: false,
    shouldWriteDatabase: true,
    writeResult,
    message: writeResult.message,
  };
}

function validationErrorResult(
  mode: ExhibitionActionMode,
  issues: readonly ExhibitionValidationIssue[],
  exhibitionId?: Exhibition["id"],
  message = "Exhibition input could not be validated.",
): ExhibitionActionFailure {
  return {
    ok: false,
    mode,
    status: "validation_error",
    issues,
    exhibitionId,
    shouldWriteJson: false,
    shouldWriteDatabase: false,
    message,
  };
}

function mutationFailureResult(
  mode: ExhibitionActionMode,
  writeResult: ProductionWriteResult<Exhibition>,
  exhibitionId?: Exhibition["id"],
): ExhibitionActionFailure {
  return {
    ok: false,
    mode,
    status: "mutation_disabled",
    issues: [],
    exhibitionId,
    shouldWriteJson: false,
    shouldWriteDatabase: false,
    writeResult,
    message: writeResult.message,
  };
}

function requireOrganizationId(mode: ExhibitionActionMode, organizationId: string | undefined, exhibitionId?: Exhibition["id"]): ExhibitionActionFailure | null {
  if (organizationId) return null;
  return validationErrorResult(mode, [{ field: "slug", message: "Admin organization context is required for PostgreSQL persistence." }] as readonly ExhibitionValidationIssue[], exhibitionId);
}

export async function prepareCreateExhibitionAction(
  source: ExhibitionValidationSource,
  context: ExhibitionActionContext = {},
): Promise<ExhibitionActionResult> {
  const validation = validateExhibitionFormInput(source);

  if (!validation.valid) {
    return validationErrorResult("create", validation.issues);
  }

  if (!context.mutationEnabled) {
    return preparedResult("create", validation.data);
  }

  const organizationBlock = requireOrganizationId("create", context.organizationId);
  if (organizationBlock) return organizationBlock;

  const writeResult = await saveExhibitionRecord(validation.data, {
    organizationId: context.organizationId as string,
  });

  if (!writeResult.ok) {
    return mutationFailureResult("create", writeResult);
  }

  return savedResult("create", validation.data, writeResult);
}

export async function prepareUpdateExhibitionAction(
  exhibitionId: Exhibition["id"],
  source: ExhibitionValidationSource,
  context: ExhibitionActionContext = {},
): Promise<ExhibitionActionResult> {
  const resolvedExhibitionId = context.existingExhibitionId ?? exhibitionId;

  if (!resolvedExhibitionId) {
    return validationErrorResult("update", [{ field: "slug", message: "Exhibition id is required for update preparation." }] as readonly ExhibitionValidationIssue[]);
  }

  const validation = validateExhibitionFormInput(source);

  if (!validation.valid) {
    return validationErrorResult("update", validation.issues, resolvedExhibitionId);
  }

  if (!context.mutationEnabled) {
    return preparedResult("update", validation.data, resolvedExhibitionId);
  }

  const organizationBlock = requireOrganizationId("update", context.organizationId, resolvedExhibitionId);
  if (organizationBlock) return organizationBlock;

  const writeResult = await saveExhibitionRecord(validation.data, {
    id: resolvedExhibitionId,
    organizationId: context.organizationId as string,
  });

  if (!writeResult.ok) {
    return mutationFailureResult("update", writeResult, resolvedExhibitionId);
  }

  return savedResult("update", validation.data, writeResult, resolvedExhibitionId);
}
