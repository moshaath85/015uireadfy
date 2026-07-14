import type { Artwork } from "@/types";
import {
  validateArtworkFormInput,
  type ArtworkValidatedInput,
  type ArtworkFormValidationIssue,
  type ArtworkValidationSource,
} from "@/lib/cms/artworks/artworks-validation";
import type { ProductionWriteResult } from "@/lib/cms/production-prisma";
import { saveArtworkRecord } from "@/lib/cms/production-prisma";

export type ArtworkActionMode = "create" | "update";
export type ArtworkActionStatus = "prepared" | "validation_error" | "mutation_disabled" | "saved";

export interface ArtworkActionContext {
  readonly mutationEnabled?: boolean;
  readonly existingArtworkId?: Artwork["id"];
  readonly environment?: string;
  readonly organizationId?: string;
}

export interface ArtworkActionSuccess {
  readonly ok: true;
  readonly mode: ArtworkActionMode;
  readonly status: "prepared" | "saved";
  readonly data: ArtworkValidatedInput;
  readonly artworkId?: Artwork["id"];
  readonly shouldWriteJson: false;
  readonly shouldWriteDatabase: boolean;
  readonly writeResult?: ProductionWriteResult<Artwork>;
  readonly message: string;
}

export interface ArtworkActionFailure {
  readonly ok: false;
  readonly mode: ArtworkActionMode;
  readonly status: Exclude<ArtworkActionStatus, "prepared" | "saved">;
  readonly issues: readonly ArtworkFormValidationIssue[];
  readonly artworkId?: Artwork["id"];
  readonly shouldWriteJson: false;
  readonly shouldWriteDatabase: false;
  readonly writeResult?: ProductionWriteResult<Artwork>;
  readonly message: string;
}

export type ArtworkActionResult = ArtworkActionSuccess | ArtworkActionFailure;

function preparedResult(mode: ArtworkActionMode, data: ArtworkValidatedInput, artworkId?: Artwork["id"]): ArtworkActionSuccess {
  return {
    ok: true,
    mode,
    status: "prepared",
    data,
    artworkId,
    shouldWriteJson: false,
    shouldWriteDatabase: false,
    message: "Artwork input is valid. PostgreSQL mutation is disabled unless explicitly enabled.",
  };
}

function savedResult(
  mode: ArtworkActionMode,
  data: ArtworkValidatedInput,
  writeResult: ProductionWriteResult<Artwork>,
  artworkId?: Artwork["id"],
): ArtworkActionSuccess {
  return {
    ok: true,
    mode,
    status: "saved",
    data,
    artworkId: writeResult.ok ? writeResult.record.id : artworkId,
    shouldWriteJson: false,
    shouldWriteDatabase: true,
    writeResult,
    message: writeResult.message,
  };
}

function validationErrorResult(
  mode: ArtworkActionMode,
  issues: readonly ArtworkFormValidationIssue[],
  artworkId?: Artwork["id"],
  message = "Artwork input could not be validated.",
): ArtworkActionFailure {
  return {
    ok: false,
    mode,
    status: "validation_error",
    issues,
    artworkId,
    shouldWriteJson: false,
    shouldWriteDatabase: false,
    message,
  };
}

function mutationFailureResult(
  mode: ArtworkActionMode,
  writeResult: ProductionWriteResult<Artwork>,
  artworkId?: Artwork["id"],
): ArtworkActionFailure {
  return {
    ok: false,
    mode,
    status: "mutation_disabled",
    issues: [],
    artworkId,
    shouldWriteJson: false,
    shouldWriteDatabase: false,
    writeResult,
    message: writeResult.message,
  };
}

function requireOrganizationId(mode: ArtworkActionMode, organizationId: string | undefined, artworkId?: Artwork["id"]): ArtworkActionFailure | null {
  if (organizationId) return null;
  return validationErrorResult(mode, [{ field: "slug", message: "Admin organization context is required for PostgreSQL persistence." }] as readonly ArtworkFormValidationIssue[], artworkId);
}

export async function prepareCreateArtworkAction(
  source: ArtworkValidationSource,
  context: ArtworkActionContext = {},
): Promise<ArtworkActionResult> {
  const validation = validateArtworkFormInput(source);

  if (!validation.valid) {
    return validationErrorResult("create", validation.issues);
  }

  if (!context.mutationEnabled) {
    return preparedResult("create", validation.data);
  }

  const organizationBlock = requireOrganizationId("create", context.organizationId);
  if (organizationBlock) return organizationBlock;

  const writeResult = await saveArtworkRecord(validation.data, {
    organizationId: context.organizationId as string,
  });

  if (!writeResult.ok) {
    return mutationFailureResult("create", writeResult);
  }

  return savedResult("create", validation.data, writeResult);
}

export async function prepareUpdateArtworkAction(
  artworkId: Artwork["id"],
  source: ArtworkValidationSource,
  context: ArtworkActionContext = {},
): Promise<ArtworkActionResult> {
  const resolvedArtworkId = context.existingArtworkId ?? artworkId;

  if (!resolvedArtworkId) {
    return validationErrorResult("update", [{ field: "slug", message: "Artwork id is required for update preparation." }] as readonly ArtworkFormValidationIssue[]);
  }

  const validation = validateArtworkFormInput(source);

  if (!validation.valid) {
    return validationErrorResult("update", validation.issues, resolvedArtworkId);
  }

  if (!context.mutationEnabled) {
    return preparedResult("update", validation.data, resolvedArtworkId);
  }

  const organizationBlock = requireOrganizationId("update", context.organizationId, resolvedArtworkId);
  if (organizationBlock) return organizationBlock;

  const writeResult = await saveArtworkRecord(validation.data, {
    id: resolvedArtworkId,
    organizationId: context.organizationId as string,
  });

  if (!writeResult.ok) {
    return mutationFailureResult("update", writeResult, resolvedArtworkId);
  }

  return savedResult("update", validation.data, writeResult, resolvedArtworkId);
}
