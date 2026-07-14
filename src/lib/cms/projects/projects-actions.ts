import type { Project } from "@/types";
import {
  validateProjectFormInput,
  type ProjectValidatedInput,
  type ProjectValidationIssue,
  type ProjectValidationSource,
} from "@/lib/cms/projects/projects-validation";
import type { ProductionWriteResult } from "@/lib/cms/production-prisma";
import { saveProjectRecord } from "@/lib/cms/production-prisma";

export type ProjectActionMode = "create" | "update";
export type ProjectActionStatus = "prepared" | "validation_error" | "mutation_disabled" | "saved";

export interface ProjectActionContext {
  readonly mutationEnabled?: boolean;
  readonly existingProjectId?: Project["id"];
  readonly environment?: string;
  readonly organizationId?: string;
}

export interface ProjectActionSuccess {
  readonly ok: true;
  readonly mode: ProjectActionMode;
  readonly status: "prepared" | "saved";
  readonly data: ProjectValidatedInput;
  readonly projectId?: Project["id"];
  readonly shouldWriteJson: false;
  readonly shouldWriteDatabase: boolean;
  readonly writeResult?: ProductionWriteResult<Project>;
  readonly message: string;
}

export interface ProjectActionFailure {
  readonly ok: false;
  readonly mode: ProjectActionMode;
  readonly status: Exclude<ProjectActionStatus, "prepared" | "saved">;
  readonly issues: readonly ProjectValidationIssue[];
  readonly projectId?: Project["id"];
  readonly shouldWriteJson: false;
  readonly shouldWriteDatabase: false;
  readonly writeResult?: ProductionWriteResult<Project>;
  readonly message: string;
}

export type ProjectActionResult = ProjectActionSuccess | ProjectActionFailure;

function preparedResult(mode: ProjectActionMode, data: ProjectValidatedInput, projectId?: Project["id"]): ProjectActionSuccess {
  return {
    ok: true,
    mode,
    status: "prepared",
    data,
    projectId,
    shouldWriteJson: false,
    shouldWriteDatabase: false,
    message: "Project input is valid. PostgreSQL mutation is disabled unless explicitly enabled.",
  };
}

function savedResult(
  mode: ProjectActionMode,
  data: ProjectValidatedInput,
  writeResult: ProductionWriteResult<Project>,
  projectId?: Project["id"],
): ProjectActionSuccess {
  return {
    ok: true,
    mode,
    status: "saved",
    data,
    projectId: writeResult.ok ? writeResult.record.id : projectId,
    shouldWriteJson: false,
    shouldWriteDatabase: true,
    writeResult,
    message: writeResult.message,
  };
}

function validationErrorResult(
  mode: ProjectActionMode,
  issues: readonly ProjectValidationIssue[],
  projectId?: Project["id"],
  message = "Project input could not be validated.",
): ProjectActionFailure {
  return {
    ok: false,
    mode,
    status: "validation_error",
    issues,
    projectId,
    shouldWriteJson: false,
    shouldWriteDatabase: false,
    message,
  };
}

function mutationFailureResult(
  mode: ProjectActionMode,
  writeResult: ProductionWriteResult<Project>,
  projectId?: Project["id"],
): ProjectActionFailure {
  return {
    ok: false,
    mode,
    status: "mutation_disabled",
    issues: [],
    projectId,
    shouldWriteJson: false,
    shouldWriteDatabase: false,
    writeResult,
    message: writeResult.message,
  };
}

function requireOrganizationId(mode: ProjectActionMode, organizationId: string | undefined, projectId?: Project["id"]): ProjectActionFailure | null {
  if (organizationId) return null;
  return validationErrorResult(mode, [{ field: "slug", message: "Admin organization context is required for PostgreSQL persistence." }] as readonly ProjectValidationIssue[], projectId);
}

export async function prepareCreateProjectAction(
  source: ProjectValidationSource,
  context: ProjectActionContext = {},
): Promise<ProjectActionResult> {
  const validation = validateProjectFormInput(source);

  if (!validation.valid) {
    return validationErrorResult("create", validation.issues);
  }

  if (!context.mutationEnabled) {
    return preparedResult("create", validation.data);
  }

  const organizationBlock = requireOrganizationId("create", context.organizationId);
  if (organizationBlock) return organizationBlock;

  const writeResult = await saveProjectRecord(validation.data, {
    organizationId: context.organizationId as string,
  });

  if (!writeResult.ok) {
    return mutationFailureResult("create", writeResult);
  }

  return savedResult("create", validation.data, writeResult);
}

export async function prepareUpdateProjectAction(
  projectId: Project["id"],
  source: ProjectValidationSource,
  context: ProjectActionContext = {},
): Promise<ProjectActionResult> {
  const resolvedProjectId = context.existingProjectId ?? projectId;

  if (!resolvedProjectId) {
    return validationErrorResult("update", [{ field: "slug", message: "Project id is required for update preparation." }] as readonly ProjectValidationIssue[]);
  }

  const validation = validateProjectFormInput(source);

  if (!validation.valid) {
    return validationErrorResult("update", validation.issues, resolvedProjectId);
  }

  if (!context.mutationEnabled) {
    return preparedResult("update", validation.data, resolvedProjectId);
  }

  const organizationBlock = requireOrganizationId("update", context.organizationId, resolvedProjectId);
  if (organizationBlock) return organizationBlock;

  const writeResult = await saveProjectRecord(validation.data, {
    id: resolvedProjectId,
    organizationId: context.organizationId as string,
  });

  if (!writeResult.ok) {
    return mutationFailureResult("update", writeResult, resolvedProjectId);
  }

  return savedResult("update", validation.data, writeResult, resolvedProjectId);
}
