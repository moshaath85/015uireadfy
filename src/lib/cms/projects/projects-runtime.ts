import type { Project } from "@/types";
import type { ProjectValidatedInput, ProjectValidationIssue } from "./projects-validation";

export type ProjectRuntimeMode = "create" | "update";
export type ProjectRuntimeStatus = "prepared" | "validation_error" | "mutation_disabled";

export interface ProjectRuntimeContext {
  readonly mutationEnabled?: boolean;
  readonly existingProjectId?: Project["id"];
}

export interface ProjectRuntimeSuccess {
  readonly ok: true;
  readonly mode: ProjectRuntimeMode;
  readonly status: "prepared";
  readonly data: ProjectValidatedInput;
  readonly projectId?: Project["id"];
  readonly shouldWriteJson: false;
  readonly message: string;
}

export interface ProjectRuntimeFailure {
  readonly ok: false;
  readonly mode: ProjectRuntimeMode;
  readonly status: Exclude<ProjectRuntimeStatus, "prepared">;
  readonly issues: readonly ProjectValidationIssue[];
  readonly projectId?: Project["id"];
  readonly shouldWriteJson: false;
  readonly message: string;
}

export type ProjectRuntimeResult = ProjectRuntimeSuccess | ProjectRuntimeFailure;

export function createProjectPreparedResult(
  mode: ProjectRuntimeMode,
  data: ProjectValidatedInput,
  projectId?: Project["id"],
): ProjectRuntimeSuccess {
  return {
    ok: true,
    mode,
    status: "prepared",
    data,
    projectId,
    shouldWriteJson: false,
    message: "Project input is valid. JSON mutation is disabled unless explicitly enabled in development.",
  };
}

export function createProjectValidationErrorResult(
  mode: ProjectRuntimeMode,
  issues: readonly ProjectValidationIssue[],
  projectId?: Project["id"],
  message = "Project input could not be validated.",
): ProjectRuntimeFailure {
  return {
    ok: false,
    mode,
    status: "validation_error",
    issues,
    projectId,
    shouldWriteJson: false,
    message,
  };
}

export function createProjectMutationDisabledResult(
  mode: ProjectRuntimeMode,
  projectId?: Project["id"],
  message = "Project JSON mutation is intentionally disabled unless guarded development writes are enabled.",
): ProjectRuntimeFailure {
  return {
    ok: false,
    mode,
    status: "mutation_disabled",
    issues: [],
    projectId,
    shouldWriteJson: false,
    message,
  };
}