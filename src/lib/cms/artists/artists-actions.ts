import { revalidatePath } from "next/cache";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import type { Artist } from "@/types";
import { createArtistPrismaRecord, updateArtistPrismaRecord, type ArtistPrismaWriteResult } from "./artists-prisma-adapter";
import {
  validateArtistFormInput,
  type ArtistFormSource,
  type ArtistMutationInput,
  type ArtistValidationIssue,
} from "./artists-validation";

export type ArtistActionMode = "create" | "update";
export type ArtistActionStatus = "prepared" | "validation_error" | "mutation_disabled" | "saved";

export interface ArtistActionContext {
  readonly mutationEnabled?: boolean;
  readonly existingArtistId?: string;
  readonly environment?: string;
  readonly organizationId?: string;
}

export interface ArtistActionSuccess {
  readonly ok: true;
  readonly mode: ArtistActionMode;
  readonly status: "prepared" | "saved";
  readonly data: ArtistMutationInput;
  readonly artistId?: string;
  readonly shouldWriteJson: false;
  readonly shouldWriteDatabase: boolean;
  readonly writeResult?: ArtistPrismaWriteResult;
  readonly message: string;
}

export interface ArtistActionFailure {
  readonly ok: false;
  readonly mode: ArtistActionMode;
  readonly status: Exclude<ArtistActionStatus, "prepared" | "saved">;
  readonly issues: readonly ArtistValidationIssue[];
  readonly shouldWriteJson: false;
  readonly shouldWriteDatabase: false;
  readonly writeResult?: ArtistPrismaWriteResult;
  readonly message: string;
}

export type ArtistActionResult = ArtistActionSuccess | ArtistActionFailure;

export type ArtistCreateFormStatus = "idle" | "success" | "error";

export interface ArtistCreateFormState {
  readonly status: ArtistCreateFormStatus;
  readonly message: string;
  readonly artistId?: string;
  readonly issues: readonly ArtistValidationIssue[];
}

export const initialArtistCreateFormState: ArtistCreateFormState = {
  status: "idle",
  message: "PostgreSQL save is available for artist create testing.",
  issues: [],
};

export const initialArtistUpdateFormState: ArtistCreateFormState = {
  status: "idle",
  message: "PostgreSQL update is available for artist edit testing.",
  issues: [],
};

function preparedResult(mode: ArtistActionMode, data: ArtistMutationInput, artistId?: string): ArtistActionSuccess {
  return {
    ok: true,
    mode,
    status: "prepared",
    data,
    artistId,
    shouldWriteJson: false,
    shouldWriteDatabase: false,
    message: "Artist input is valid. PostgreSQL mutation is disabled unless explicitly enabled.",
  };
}

function savedResult(
  mode: ArtistActionMode,
  data: ArtistMutationInput,
  writeResult: ArtistPrismaWriteResult,
  artistId?: string,
): ArtistActionSuccess {
  return {
    ok: true,
    mode,
    status: "saved",
    data,
    artistId: writeResult.ok ? writeResult.record.id : artistId,
    shouldWriteJson: false,
    shouldWriteDatabase: true,
    writeResult,
    message: writeResult.message,
  };
}

function validationErrorResult(
  mode: ArtistActionMode,
  issues: readonly ArtistValidationIssue[],
  message = "Artist input could not be validated.",
): ArtistActionFailure {
  return {
    ok: false,
    mode,
    status: "validation_error",
    issues,
    shouldWriteJson: false,
    shouldWriteDatabase: false,
    message,
  };
}

function mutationFailureResult(
  mode: ArtistActionMode,
  writeResult: ArtistPrismaWriteResult,
  message = "Artist PostgreSQL mutation did not complete.",
): ArtistActionFailure {
  return {
    ok: false,
    mode,
    status: "mutation_disabled",
    issues: [],
    shouldWriteJson: false,
    shouldWriteDatabase: false,
    writeResult,
    message: writeResult.message || message,
  };
}

function requireOrganizationId(mode: ArtistActionMode, organizationId: string | undefined): ArtistActionFailure | null {
  if (organizationId) {
    return null;
  }

  return validationErrorResult(mode, [
    {
      field: "slug",
      message: "Admin organization context is required for PostgreSQL persistence.",
    },
  ]);
}

function getSubmittedArtistPhoto(source: ArtistFormSource): File | null {
  if (typeof FormData === "undefined" || !(source instanceof FormData) || typeof File === "undefined") {
    return null;
  }

  const upload = source.get("profile_image_id__upload");
  const replace = source.get("profile_image_id__replace");
  const file = upload instanceof File && upload.size > 0 ? upload : replace instanceof File && replace.size > 0 ? replace : null;

  return file;
}

function validateSubmittedArtistPhoto(mode: ArtistActionMode, source: ArtistFormSource): ArtistActionFailure | null {
  const file = getSubmittedArtistPhoto(source);

  if (!file) {
    return null;
  }

  const maxArtistPhotoBytes = 10 * 1024 * 1024;

  if (!file.type.startsWith("image/")) {
    return validationErrorResult(mode, [
      {
        field: "profile_image_id",
        message: "Artist photo uploads must be image files.",
      },
    ]);
  }

  if (file.size > maxArtistPhotoBytes) {
    return validationErrorResult(mode, [
      {
        field: "profile_image_id",
        message: "Artist photo uploads must be 10 MB or smaller.",
      },
    ]);
  }

  return validationErrorResult(mode, [
    {
      field: "profile_image_id",
      message: "The photo was received safely, but file storage is not connected yet. Select an existing Media record for now.",
    },
  ]);
}

export async function prepareCreateArtistAction(
  source: ArtistFormSource,
  context: ArtistActionContext = {},
): Promise<ArtistActionResult> {
  const photoValidation = validateSubmittedArtistPhoto("create", source);

  if (photoValidation) {
    return photoValidation;
  }

  const validation = validateArtistFormInput(source);

  if (!validation.valid) {
    return validationErrorResult("create", validation.issues);
  }

  if (!context.mutationEnabled) {
    return preparedResult("create", validation.data);
  }

  const organizationId = context.organizationId;

  if (!organizationId) {
    return requireOrganizationId("create", organizationId) as ArtistActionFailure;
  }

  const writeResult = await createArtistPrismaRecord(validation.data, {
    organizationId,
  });

  if (!writeResult.ok) {
    return mutationFailureResult("create", writeResult);
  }

  return savedResult("create", validation.data, writeResult);
}

export async function prepareUpdateArtistAction(
  artistId: Artist["id"],
  source: ArtistFormSource,
  context: ArtistActionContext = {},
): Promise<ArtistActionResult> {
  const photoValidation = validateSubmittedArtistPhoto("update", source);

  if (photoValidation) {
    return photoValidation;
  }

  const validation = validateArtistFormInput(source);
  const resolvedArtistId = context.existingArtistId ?? artistId;

  if (!resolvedArtistId) {
    return validationErrorResult("update", [
      {
        field: "slug",
        message: "Artist id is required for update preparation.",
      },
    ]);
  }

  if (!validation.valid) {
    return validationErrorResult("update", validation.issues);
  }

  if (!context.mutationEnabled) {
    return preparedResult("update", validation.data, resolvedArtistId);
  }

  const organizationId = context.organizationId;

  if (!organizationId) {
    return requireOrganizationId("update", organizationId) as ArtistActionFailure;
  }

  const writeResult = await updateArtistPrismaRecord(resolvedArtistId, validation.data, {
    organizationId,
  });

  if (!writeResult.ok) {
    return mutationFailureResult("update", writeResult);
  }

  return savedResult("update", validation.data, writeResult, resolvedArtistId);
}

export async function submitCreateArtistFormAction(
  _previousState: ArtistCreateFormState,
  formData: FormData,
): Promise<ArtistCreateFormState> {
  "use server";

  const adminContext = await requireAdminServerAction("artists.create");

  const result = await prepareCreateArtistAction(formData, {
    mutationEnabled: true,
    environment: process.env.NODE_ENV,
    organizationId: adminContext.organizationId,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
      issues: result.issues,
    };
  }

  revalidatePath("/");
  revalidatePath("/admin/artists");
  revalidatePath("/artists");

  return {
    status: "success",
    message: result.message,
    artistId: result.artistId,
    issues: [],
  };
}

export async function submitUpdateArtistFormAction(
  artistId: Artist["id"],
  _previousState: ArtistCreateFormState,
  formData: FormData,
): Promise<ArtistCreateFormState> {
  "use server";

  const adminContext = await requireAdminServerAction("artists.update");

  const result = await prepareUpdateArtistAction(artistId, formData, {
    mutationEnabled: true,
    existingArtistId: artistId,
    environment: process.env.NODE_ENV,
    organizationId: adminContext.organizationId,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
      artistId,
      issues: result.issues,
    };
  }

  revalidatePath("/");
  revalidatePath("/admin/artists");
  revalidatePath("/artists");

  return {
    status: "success",
    message: result.message,
    artistId: result.artistId ?? artistId,
    issues: [],
  };
}