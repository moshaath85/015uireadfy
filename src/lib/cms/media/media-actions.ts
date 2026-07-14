import type { JsonWriteResult } from "@/lib/database/json-write-result";
import type { Media } from "@/types";
import {
  createMediaJsonRecord,
  updateMediaJsonRecord,
  type MediaJsonRecord,
} from "./media-json-adapter";
import {
  validateMediaFormInput,
  validateMediaLifecycleInput,
  type MediaLifecycleValidatedInput,
  type MediaValidatedInput,
  type MediaValidationIssue,
  type MediaValidationSource,
} from "./media-validation";

export type MediaActionMode = "create" | "update";
export type MediaLifecycleActionMode = "archive" | "restore" | "soft_delete";
export type MediaActionStatus = "validation_error" | "mutation_disabled" | "prepared" | "saved";

export interface MediaActionContext {
  readonly environment?: string;
  readonly mutationEnabled?: boolean;
}

export interface MediaActionSuccess {
  readonly ok: true;
  readonly mode: MediaActionMode;
  readonly status: "saved";
  readonly data: MediaValidatedInput;
  readonly writeResult: JsonWriteResult<MediaJsonRecord>;
  readonly shouldWriteJson: true;
  readonly message: string;
}

export interface MediaActionFailure {
  readonly ok: false;
  readonly mode: MediaActionMode | MediaLifecycleActionMode;
  readonly status: Exclude<MediaActionStatus, "saved" | "prepared">;
  readonly issues: readonly MediaValidationIssue[];
  readonly writeResult?: JsonWriteResult<MediaJsonRecord>;
  readonly shouldWriteJson: false;
  readonly message: string;
}

export interface MediaLifecycleActionSuccess {
  readonly ok: true;
  readonly mode: MediaLifecycleActionMode;
  readonly status: "prepared";
  readonly data: MediaLifecycleValidatedInput;
  readonly shouldWriteJson: false;
  readonly message: string;
}

export type MediaActionResult = MediaActionSuccess | MediaActionFailure;
export type MediaLifecycleActionResult = MediaLifecycleActionSuccess | MediaActionFailure;

function guardedJsonEnvironment(context: MediaActionContext): string {
  return context.environment ?? process.env.NODE_ENV ?? "production";
}

function validationFailure(
  mode: MediaActionMode | MediaLifecycleActionMode,
  issues: readonly MediaValidationIssue[],
): MediaActionFailure {
  return {
    ok: false,
    mode,
    status: "validation_error",
    issues,
    shouldWriteJson: false,
    message: "Media input could not be validated.",
  };
}

function mutationDisabledFailure(
  mode: MediaActionMode,
  writeResult: JsonWriteResult<MediaJsonRecord>,
): MediaActionFailure {
  return {
    ok: false,
    mode,
    status: "mutation_disabled",
    issues: [],
    writeResult,
    shouldWriteJson: false,
    message: writeResult.message,
  };
}

export function prepareCreateMediaAction(
  source: MediaValidationSource,
  contextOrEnvironment: MediaActionContext | string = {},
): MediaActionResult {
  const context = typeof contextOrEnvironment === "string" ? { environment: contextOrEnvironment } : contextOrEnvironment;
  const validation = validateMediaFormInput(source);

  if (!validation.valid) {
    return validationFailure("create", validation.issues);
  }

  const writeResult = createMediaJsonRecord(validation.data, {
    allowDevelopmentWrites: true,
    environment: guardedJsonEnvironment(context),
  });

  return writeResult.ok
    ? {
      ok: true,
      mode: "create",
      status: "saved",
      data: validation.data,
      writeResult,
      shouldWriteJson: true,
      message: writeResult.message,
    }
    : mutationDisabledFailure("create", writeResult);
}

export function prepareUpdateMediaAction(
  mediaId: Media["id"],
  source: MediaValidationSource,
  contextOrEnvironment: MediaActionContext | string = {},
): MediaActionResult {
  const context = typeof contextOrEnvironment === "string" ? { environment: contextOrEnvironment } : contextOrEnvironment;
  const validation = validateMediaFormInput(source);

  if (!validation.valid) {
    return validationFailure("update", validation.issues);
  }

  const writeResult = updateMediaJsonRecord(mediaId, validation.data, {
    allowDevelopmentWrites: true,
    environment: guardedJsonEnvironment(context),
  });

  return writeResult.ok
    ? {
      ok: true,
      mode: "update",
      status: "saved",
      data: validation.data,
      writeResult,
      shouldWriteJson: true,
      message: writeResult.message,
    }
    : mutationDisabledFailure("update", writeResult);
}

export function prepareUploadMediaAction(
  source: MediaValidationSource,
  context: MediaActionContext = {},
): MediaActionResult {
  return prepareCreateMediaAction(source, context);
}

export function prepareReplaceMediaAction(
  mediaId: Media["id"],
  source: MediaValidationSource,
  context: MediaActionContext = {},
): MediaActionResult {
  return prepareUpdateMediaAction(mediaId, source, context);
}

function prepareLifecycleMediaAction(
  mode: MediaLifecycleActionMode,
  mediaId: Media["id"],
  source: MediaValidationSource = {},
): MediaLifecycleActionResult {
  const validation = validateMediaLifecycleInput(mediaId, source);

  if (!validation.valid) {
    return validationFailure(mode, validation.issues);
  }

  return {
    ok: true,
    mode,
    status: "prepared",
    data: validation.data,
    shouldWriteJson: false,
    message: `Media ${mode.replace("_", " ")} input is valid. Persistence remains disabled until a future approved write patch.`,
  };
}

export function prepareArchiveMediaAction(
  mediaId: Media["id"],
  source: MediaValidationSource = {},
): MediaLifecycleActionResult {
  return prepareLifecycleMediaAction("archive", mediaId, source);
}

export function prepareRestoreMediaAction(
  mediaId: Media["id"],
  source: MediaValidationSource = {},
): MediaLifecycleActionResult {
  return prepareLifecycleMediaAction("restore", mediaId, source);
}

export function prepareSoftDeleteMediaAction(
  mediaId: Media["id"],
  source: MediaValidationSource = {},
): MediaLifecycleActionResult {
  return prepareLifecycleMediaAction("soft_delete", mediaId, source);
}