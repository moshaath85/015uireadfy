import { randomUUID } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { jsonFileTargets, type JsonWriteTarget } from "@/lib/database/json-file-types";
import { jsonWriter } from "@/lib/database/json-writer";
import type { JsonWriteGuardOptions } from "@/lib/database/json-write-guards";
import type { JsonWriteResult } from "@/lib/database/json-write-result";
import type { Exhibition } from "@/types";
import type { ExhibitionValidatedInput } from "./exhibitions-validation";

export interface ExhibitionJsonSaveOptions extends JsonWriteGuardOptions {
  readonly now?: string;
}

type WritableExhibition = Exhibition & Record<string, unknown>;

const exhibitionsJsonWriteTarget: JsonWriteTarget<WritableExhibition> = {
  file: {
    ...jsonFileTargets.exhibitions,
    writeMode: "development_write_disabled",
    description: "Exhibition records prepared for guarded development-only create and update proof.",
  },
  idField: "id",
  slugField: "slug",
};

const exhibitionsJsonPath = path.join(process.cwd(), jsonFileTargets.exhibitions.relativePath);

function readExhibitionsFile(): Exhibition[] {
  if (!existsSync(exhibitionsJsonPath)) {
    return [];
  }

  const raw = readFileSync(exhibitionsJsonPath, "utf8");
  const parsed = JSON.parse(raw) as unknown;

  return Array.isArray(parsed) ? (parsed as Exhibition[]) : [];
}

function writeExhibitionsFile(records: readonly Exhibition[]) {
  writeFileSync(exhibitionsJsonPath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

function validateExhibitionShape(input: ExhibitionValidatedInput): readonly string[] {
  const issues: string[] = [];

  if (!input.slug || !input.title_en || !input.title_ar) {
    issues.push("identity_fields");
  }

  if (!input.description_en || !input.description_ar) {
    issues.push("description_fields");
  }

  if (!input.start_date || !input.end_date) {
    issues.push("schedule_fields");
  }

  if (!input.venue_en || !input.venue_ar) {
    issues.push("venue_fields");
  }

  if (!input.visibility_status) {
    issues.push("visibility_status");
  }

  return issues;
}

function validationFailure(
  operation: "create" | "update",
  message: string,
  details: readonly string[],
): JsonWriteResult<Exhibition> {
  return {
    ok: false,
    operation,
    target: jsonFileTargets.exhibitions.entity,
    reason: "invalid_payload",
    message,
    details,
  };
}

function createExhibitionRecord(input: ExhibitionValidatedInput, now: string): Exhibition {
  return {
    id: `exh-${randomUUID()}`,
    slug: input.slug,
    title_en: input.title_en,
    title_ar: input.title_ar,
    description_en: input.description_en,
    description_ar: input.description_ar,
    start_date: input.start_date,
    end_date: input.end_date,
    venue_en: input.venue_en,
    venue_ar: input.venue_ar,
    visibility_status: input.visibility_status,
    created_at: now,
    updated_at: now,
  };
}

function updateExhibitionRecord(
  existing: Exhibition,
  input: ExhibitionValidatedInput,
  now: string,
): Exhibition {
  return {
    ...existing,
    slug: input.slug,
    title_en: input.title_en,
    title_ar: input.title_ar,
    description_en: input.description_en,
    description_ar: input.description_ar,
    start_date: input.start_date,
    end_date: input.end_date,
    venue_en: input.venue_en,
    venue_ar: input.venue_ar,
    visibility_status: input.visibility_status,
    updated_at: now,
  };
}

export function createExhibitionJsonRecord(
  input: ExhibitionValidatedInput,
  options: ExhibitionJsonSaveOptions = {},
): JsonWriteResult<Exhibition> {
  const shapeIssues = validateExhibitionShape(input);

  if (shapeIssues.length > 0) {
    return validationFailure("create", "Exhibition payload shape is invalid.", shapeIssues);
  }

  const now = options.now ?? new Date().toISOString();
  const record = createExhibitionRecord(input, now);
  const guardResult = jsonWriter.write<WritableExhibition>({
    operation: "create",
    target: exhibitionsJsonWriteTarget,
    record: record as WritableExhibition,
    options,
  });

  if (!guardResult.ok) {
    return guardResult;
  }

  const exhibitions = readExhibitionsFile();

  if (exhibitions.some((exhibition) => exhibition.id === record.id || exhibition.slug === record.slug)) {
    return validationFailure("create", "Exhibition id or slug already exists.", [record.id, record.slug]);
  }

  writeExhibitionsFile([...exhibitions, record]);

  return {
    ok: true,
    operation: "create",
    target: jsonFileTargets.exhibitions.entity,
    record,
    message: "Development-only exhibition JSON create proof completed.",
  };
}

export function updateExhibitionJsonRecord(
  exhibitionId: Exhibition["id"],
  input: ExhibitionValidatedInput,
  options: ExhibitionJsonSaveOptions = {},
): JsonWriteResult<Exhibition> {
  const shapeIssues = validateExhibitionShape(input);

  if (shapeIssues.length > 0) {
    return validationFailure("update", "Exhibition payload shape is invalid.", shapeIssues);
  }

  const exhibitions = readExhibitionsFile();
  const exhibitionIndex = exhibitions.findIndex((exhibition) => exhibition.id === exhibitionId);

  if (exhibitionIndex < 0) {
    return validationFailure("update", "Exhibition record was not found for update.", [exhibitionId]);
  }

  if (exhibitions.some((exhibition) => exhibition.id !== exhibitionId && exhibition.slug === input.slug)) {
    return validationFailure("update", "Exhibition slug already belongs to another record.", [input.slug]);
  }

  const now = options.now ?? new Date().toISOString();
  const record = updateExhibitionRecord(exhibitions[exhibitionIndex], input, now);
  const guardResult = jsonWriter.write<WritableExhibition>({
    operation: "update",
    target: exhibitionsJsonWriteTarget,
    record: record as WritableExhibition,
    options,
  });

  if (!guardResult.ok) {
    return guardResult;
  }

  const nextExhibitions = exhibitions.map((exhibition) => (exhibition.id === exhibitionId ? record : exhibition));
  writeExhibitionsFile(nextExhibitions);

  return {
    ok: true,
    operation: "update",
    target: jsonFileTargets.exhibitions.entity,
    record,
    message: "Development-only exhibition JSON update proof completed.",
  };
}