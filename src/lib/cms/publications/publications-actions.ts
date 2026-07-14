import type { Publication } from "@/types";
import {
  validatePublicationFormInput,
  type PublicationValidatedInput,
  type PublicationValidationIssue,
  type PublicationValidationSource,
} from "@/lib/cms/publications/publications-validation";
import type { ProductionWriteResult } from "@/lib/cms/production-prisma";
import { savePublicationRecord } from "@/lib/cms/production-prisma";

export type PublicationActionMode = "create" | "update";
export type PublicationActionStatus = "prepared" | "validation_error" | "mutation_disabled" | "saved";

export interface PublicationActionContext {
  readonly mutationEnabled?: boolean;
  readonly existingPublicationId?: Publication["id"];
  readonly environment?: string;
  readonly organizationId?: string;
}

export interface PublicationActionSuccess {
  readonly ok: true;
  readonly mode: PublicationActionMode;
  readonly status: "prepared" | "saved";
  readonly data: PublicationValidatedInput;
  readonly publicationId?: Publication["id"];
  readonly shouldWriteJson: false;
  readonly shouldWriteDatabase: boolean;
  readonly writeResult?: ProductionWriteResult<Publication>;
  readonly message: string;
}

export interface PublicationActionFailure {
  readonly ok: false;
  readonly mode: PublicationActionMode;
  readonly status: Exclude<PublicationActionStatus, "prepared" | "saved">;
  readonly issues: readonly PublicationValidationIssue[];
  readonly publicationId?: Publication["id"];
  readonly shouldWriteJson: false;
  readonly shouldWriteDatabase: false;
  readonly writeResult?: ProductionWriteResult<Publication>;
  readonly message: string;
}

export type PublicationActionResult = PublicationActionSuccess | PublicationActionFailure;

function preparedResult(mode: PublicationActionMode, data: PublicationValidatedInput, publicationId?: Publication["id"]): PublicationActionSuccess {
  return {
    ok: true,
    mode,
    status: "prepared",
    data,
    publicationId,
    shouldWriteJson: false,
    shouldWriteDatabase: false,
    message: "Publication input is valid. PostgreSQL mutation is disabled unless explicitly enabled.",
  };
}

function savedResult(
  mode: PublicationActionMode,
  data: PublicationValidatedInput,
  writeResult: ProductionWriteResult<Publication>,
  publicationId?: Publication["id"],
): PublicationActionSuccess {
  return {
    ok: true,
    mode,
    status: "saved",
    data,
    publicationId: writeResult.ok ? writeResult.record.id : publicationId,
    shouldWriteJson: false,
    shouldWriteDatabase: true,
    writeResult,
    message: writeResult.message,
  };
}

function validationErrorResult(
  mode: PublicationActionMode,
  issues: readonly PublicationValidationIssue[],
  publicationId?: Publication["id"],
  message = "Publication input could not be validated.",
): PublicationActionFailure {
  return {
    ok: false,
    mode,
    status: "validation_error",
    issues,
    publicationId,
    shouldWriteJson: false,
    shouldWriteDatabase: false,
    message,
  };
}

function mutationFailureResult(
  mode: PublicationActionMode,
  writeResult: ProductionWriteResult<Publication>,
  publicationId?: Publication["id"],
): PublicationActionFailure {
  return {
    ok: false,
    mode,
    status: "mutation_disabled",
    issues: [],
    publicationId,
    shouldWriteJson: false,
    shouldWriteDatabase: false,
    writeResult,
    message: writeResult.message,
  };
}

function requireOrganizationId(mode: PublicationActionMode, organizationId: string | undefined, publicationId?: Publication["id"]): PublicationActionFailure | null {
  if (organizationId) return null;
  return validationErrorResult(mode, [{ field: "slug", message: "Admin organization context is required for PostgreSQL persistence." }] as readonly PublicationValidationIssue[], publicationId);
}

export async function prepareCreatePublicationAction(
  source: PublicationValidationSource,
  context: PublicationActionContext = {},
): Promise<PublicationActionResult> {
  const validation = validatePublicationFormInput(source);

  if (!validation.valid) {
    return validationErrorResult("create", validation.issues);
  }

  if (!context.mutationEnabled) {
    return preparedResult("create", validation.data);
  }

  const organizationBlock = requireOrganizationId("create", context.organizationId);
  if (organizationBlock) return organizationBlock;

  const writeResult = await savePublicationRecord(validation.data, {
    organizationId: context.organizationId as string,
  });

  if (!writeResult.ok) {
    return mutationFailureResult("create", writeResult);
  }

  return savedResult("create", validation.data, writeResult);
}

export async function prepareUpdatePublicationAction(
  publicationId: Publication["id"],
  source: PublicationValidationSource,
  context: PublicationActionContext = {},
): Promise<PublicationActionResult> {
  const resolvedPublicationId = context.existingPublicationId ?? publicationId;

  if (!resolvedPublicationId) {
    return validationErrorResult("update", [{ field: "slug", message: "Publication id is required for update preparation." }] as readonly PublicationValidationIssue[]);
  }

  const validation = validatePublicationFormInput(source);

  if (!validation.valid) {
    return validationErrorResult("update", validation.issues, resolvedPublicationId);
  }

  if (!context.mutationEnabled) {
    return preparedResult("update", validation.data, resolvedPublicationId);
  }

  const organizationBlock = requireOrganizationId("update", context.organizationId, resolvedPublicationId);
  if (organizationBlock) return organizationBlock;

  const writeResult = await savePublicationRecord(validation.data, {
    id: resolvedPublicationId,
    organizationId: context.organizationId as string,
  });

  if (!writeResult.ok) {
    return mutationFailureResult("update", writeResult, resolvedPublicationId);
  }

  return savedResult("update", validation.data, writeResult, resolvedPublicationId);
}
