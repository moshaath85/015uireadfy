import {
  createRuntimeEngine,
  runtimeFailure,
  runtimeSuccess,
  runtimeValidationFailure,
  type RuntimeExecutionContext,
  type RuntimeIssue,
  type RuntimeListData,
  type RuntimeResult,
} from "@/lib/runtime";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { findArtistPrismaRecord, listArtistPrismaRecords } from "./artists-prisma-adapter";
import type { Artist } from "@/types";
import {
  prepareCreateArtistAction,
  prepareUpdateArtistAction,
  type ArtistActionContext,
  type ArtistActionResult,
} from "./artists-actions";
import {
  validateArtistFormInput,
  type ArtistFormSource,
  type ArtistMutationInput,
  type ArtistValidationIssue,
} from "./artists-validation";

export interface ArtistRuntimeUpdateInput {
  readonly artistId: Artist["id"];
  readonly source: ArtistFormSource;
}

export type ArtistRuntimeActionResult = RuntimeResult<ArtistActionResult>;
export type ArtistRuntimeValidationResult = RuntimeResult<ArtistMutationInput>;
export type ArtistRuntimeListResult = RuntimeResult<RuntimeListData<Artist>>;
export type ArtistRuntimeReadResult = RuntimeResult<Artist>;

const artistsRuntimeContext: RuntimeExecutionContext = {
  module: "artists",
};

function toRuntimeIssues(issues: readonly ArtistValidationIssue[]): readonly RuntimeIssue[] {
  return issues.map((issue) => ({
    field: issue.field,
    message: issue.message,
  }));
}

function validateArtistRuntimeSource(source: ArtistFormSource): ArtistRuntimeValidationResult {
  const validation = validateArtistFormInput(source);

  if (!validation.valid) {
    return runtimeValidationFailure("validate", toRuntimeIssues(validation.issues), "Artist input could not be validated.");
  }

  return runtimeSuccess("validate", validation.data);
}

function validateArtistRuntimeUpdateInput(input: ArtistRuntimeUpdateInput): RuntimeResult<ArtistRuntimeUpdateInput> {
  const validation = validateArtistFormInput(input.source);

  if (!validation.valid) {
    return runtimeValidationFailure("validate", toRuntimeIssues(validation.issues), "Artist input could not be validated.");
  }

  return runtimeSuccess("validate", input);
}

function getRuntimeOrganizationId(): string | null {
  return getAdminAuthConfig()?.organizationId ?? null;
}

async function findArtistByRuntimeId(id: string | number): Promise<Artist | null> {
  const organizationId = getRuntimeOrganizationId();

  if (!organizationId) {
    return null;
  }

  const runtimeId = String(id);
  const directRecord = await findArtistPrismaRecord(runtimeId, organizationId);

  if (directRecord) {
    return directRecord;
  }

  const artists = await listArtistPrismaRecords(organizationId);

  return artists.find((artist) => artist.slug === runtimeId) ?? null;
}

function toArtistRuntimeActionResult(
  operation: "create" | "update",
  result: ArtistActionResult,
): ArtistRuntimeActionResult {
  if (result.ok) {
    return runtimeSuccess(operation, result);
  }

  return runtimeFailure(
    operation,
    result.status === "validation_error" ? "VALIDATION_ERROR" : "RUNTIME_ERROR",
    result.message,
    toRuntimeIssues(result.issues),
  );
}

export const artistsRuntime = createRuntimeEngine<Artist, ArtistFormSource, ArtistRuntimeUpdateInput>({
  async list() {
    const organizationId = getRuntimeOrganizationId();
    const artists = organizationId ? await listArtistPrismaRecords(organizationId) : [];

    return {
      items: artists,
      total: artists.length,
    };
  },

  read(request) {
    return findArtistByRuntimeId(request.id);
  },

  validateCreate(source) {
    return validateArtistRuntimeSource(source);
  },

  validateUpdate(input) {
    return validateArtistRuntimeUpdateInput(input);
  },
});

export function listArtistsRuntime(
  context: RuntimeExecutionContext = artistsRuntimeContext,
): Promise<ArtistRuntimeListResult> {
  return artistsRuntime.list({}, context);
}

export function readArtistRuntime(
  artistId: Artist["id"],
  context: RuntimeExecutionContext = artistsRuntimeContext,
): Promise<ArtistRuntimeReadResult> {
  return artistsRuntime.read({ id: artistId }, context);
}

export async function validateCreateArtistRuntime(
  source: ArtistFormSource,
  _context: RuntimeExecutionContext = artistsRuntimeContext,
): Promise<ArtistRuntimeValidationResult> {
  return validateArtistRuntimeSource(source);
}

export async function validateUpdateArtistRuntime(
  input: ArtistRuntimeUpdateInput,
  _context: RuntimeExecutionContext = artistsRuntimeContext,
): Promise<ArtistRuntimeValidationResult> {
  return validateArtistRuntimeSource(input.source);
}

export async function prepareCreateArtistRuntimeAction(
  source: ArtistFormSource,
  context: ArtistActionContext = {},
): Promise<ArtistRuntimeActionResult> {
  const result = await prepareCreateArtistAction(source, context);

  return toArtistRuntimeActionResult("create", result);
}

export async function prepareUpdateArtistRuntimeAction(
  artistId: Artist["id"],
  source: ArtistFormSource,
  context: ArtistActionContext = {},
): Promise<ArtistRuntimeActionResult> {
  const result = await prepareUpdateArtistAction(artistId, source, {
    ...context,
    existingArtistId: context.existingArtistId ?? artistId,
  });

  return toArtistRuntimeActionResult("update", result);
}