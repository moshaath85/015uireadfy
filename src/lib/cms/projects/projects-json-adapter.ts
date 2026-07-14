import { randomUUID } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { jsonFileTargets, type JsonWriteTarget } from "@/lib/database/json-file-types";
import { jsonWriter } from "@/lib/database/json-writer";
import type { JsonWriteGuardOptions } from "@/lib/database/json-write-guards";
import type { JsonWriteResult } from "@/lib/database/json-write-result";
import type { Project } from "@/types";
import type { ProjectValidatedInput } from "./projects-validation";

export interface ProjectJsonSaveOptions extends JsonWriteGuardOptions {
  readonly now?: string;
}

export type ProjectJsonRecord = Project & Record<string, unknown>;

const projectsJsonWriteTarget: JsonWriteTarget<ProjectJsonRecord> = {
  file: {
    ...jsonFileTargets.projects,
    writeMode: "development_write_disabled",
    description: "Project records prepared for guarded development-only create and update proof.",
  },
  idField: "id",
  slugField: "slug",
};

const projectsJsonPath = path.join(process.cwd(), jsonFileTargets.projects.relativePath);

function readProjectsFile(): ProjectJsonRecord[] {
  if (!existsSync(projectsJsonPath)) {
    return [];
  }

  const raw = readFileSync(projectsJsonPath, "utf8");
  const parsed = JSON.parse(raw) as unknown;

  return Array.isArray(parsed) ? (parsed as ProjectJsonRecord[]) : [];
}

function writeProjectsFile(records: readonly ProjectJsonRecord[]) {
  writeFileSync(projectsJsonPath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

function validateProjectShape(input: ProjectValidatedInput): readonly string[] {
  const issues: string[] = [];

  if (!input.slug || !input.title_en || !input.title_ar) {
    issues.push("identity_fields");
  }

  if (!input.description_en || !input.description_ar) {
    issues.push("description_fields");
  }

  if (!input.client || !input.location || !input.completion_date) {
    issues.push("project_detail_fields");
  }

  if (!input.status || !input.visibility_status) {
    issues.push("workflow_fields");
  }

  return issues;
}

function validationFailure(
  operation: "create" | "update",
  message: string,
  details: readonly string[],
): JsonWriteResult<ProjectJsonRecord> {
  return {
    ok: false,
    operation,
    target: jsonFileTargets.projects.entity,
    reason: "invalid_payload",
    message,
    details,
  };
}

function projectYearFromCompletionDate(completionDate: string): number {
  return Number.parseInt(completionDate.slice(0, 4), 10);
}

function createProjectRecord(input: ProjectValidatedInput, now: string): ProjectJsonRecord {
  return {
    id: `proj-${randomUUID()}`,
    slug: input.slug,
    title_en: input.title_en,
    title_ar: input.title_ar,
    description_en: input.description_en,
    description_ar: input.description_ar,
    client_en: input.client,
    client_ar: input.client,
    type: "project",
    year: projectYearFromCompletionDate(input.completion_date),
    status: input.status,
    visibility_status: input.visibility_status,
    client: input.client,
    location: input.location,
    completion_date: input.completion_date,
    created_at: now,
    updated_at: now,
  };
}

function updateProjectRecord(
  existing: ProjectJsonRecord,
  input: ProjectValidatedInput,
  now: string,
): ProjectJsonRecord {
  return {
    ...existing,
    slug: input.slug,
    title_en: input.title_en,
    title_ar: input.title_ar,
    description_en: input.description_en,
    description_ar: input.description_ar,
    client_en: input.client,
    client_ar: input.client,
    year: projectYearFromCompletionDate(input.completion_date),
    status: input.status,
    visibility_status: input.visibility_status,
    client: input.client,
    location: input.location,
    completion_date: input.completion_date,
    updated_at: now,
  };
}

export function createProjectJsonRecord(
  input: ProjectValidatedInput,
  options: ProjectJsonSaveOptions = {},
): JsonWriteResult<ProjectJsonRecord> {
  const shapeIssues = validateProjectShape(input);

  if (shapeIssues.length > 0) {
    return validationFailure("create", "Project payload shape is invalid.", shapeIssues);
  }

  const now = options.now ?? new Date().toISOString();
  const record = createProjectRecord(input, now);
  const guardResult = jsonWriter.write<ProjectJsonRecord>({
    operation: "create",
    target: projectsJsonWriteTarget,
    record,
    options,
  });

  if (!guardResult.ok) {
    return guardResult;
  }

  const projects = readProjectsFile();

  if (projects.some((project) => project.id === record.id || project.slug === record.slug)) {
    return validationFailure("create", "Project id or slug already exists.", [record.id, record.slug]);
  }

  writeProjectsFile([...projects, record]);

  return {
    ok: true,
    operation: "create",
    target: jsonFileTargets.projects.entity,
    record,
    message: "Development-only project JSON create proof completed.",
  };
}

export function updateProjectJsonRecord(
  projectId: Project["id"],
  input: ProjectValidatedInput,
  options: ProjectJsonSaveOptions = {},
): JsonWriteResult<ProjectJsonRecord> {
  const shapeIssues = validateProjectShape(input);

  if (shapeIssues.length > 0) {
    return validationFailure("update", "Project payload shape is invalid.", shapeIssues);
  }

  const projects = readProjectsFile();
  const projectIndex = projects.findIndex((project) => project.id === projectId);

  if (projectIndex < 0) {
    return validationFailure("update", "Project record was not found for update.", [projectId]);
  }

  if (projects.some((project) => project.id !== projectId && project.slug === input.slug)) {
    return validationFailure("update", "Project slug already belongs to another record.", [input.slug]);
  }

  const now = options.now ?? new Date().toISOString();
  const record = updateProjectRecord(projects[projectIndex], input, now);
  const guardResult = jsonWriter.write<ProjectJsonRecord>({
    operation: "update",
    target: projectsJsonWriteTarget,
    record,
    options,
  });

  if (!guardResult.ok) {
    return guardResult;
  }

  const nextProjects = projects.map((project) => (project.id === projectId ? record : project));
  writeProjectsFile(nextProjects);

  return {
    ok: true,
    operation: "update",
    target: jsonFileTargets.projects.entity,
    record,
    message: "Development-only project JSON update proof completed.",
  };
}