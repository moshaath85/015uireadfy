import { randomUUID } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { jsonFileTargets, type JsonWriteTarget } from "@/lib/database/json-file-types";
import { jsonWriter } from "@/lib/database/json-writer";
import type { JsonWriteGuardOptions } from "@/lib/database/json-write-guards";
import type { JsonWriteResult } from "@/lib/database/json-write-result";
import type { Service } from "@/types";
import type { ServiceValidatedInput } from "./services-validation";

export interface ServiceJsonSaveOptions extends JsonWriteGuardOptions {
  readonly now?: string;
}

export type ServiceJsonRecord = Service & Record<string, unknown>;

const servicesJsonWriteTarget: JsonWriteTarget<ServiceJsonRecord> = {
  file: {
    ...jsonFileTargets.services,
    writeMode: "development_write_disabled",
    description: "Service records prepared for guarded development-only create and update proof.",
  },
  idField: "id",
  slugField: "slug",
};

const servicesJsonPath = path.join(process.cwd(), "data", "services.json");

function readServicesFile(): ServiceJsonRecord[] {
  if (!existsSync(servicesJsonPath)) {
    return [];
  }

  const raw = readFileSync(servicesJsonPath, "utf8");
  const parsed = JSON.parse(raw) as unknown;

  return Array.isArray(parsed) ? (parsed as ServiceJsonRecord[]) : [];
}

function writeServicesFile(records: readonly ServiceJsonRecord[]) {
  writeFileSync(servicesJsonPath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

function validationFailure(
  operation: "create" | "update",
  message: string,
  details: readonly string[],
): JsonWriteResult<ServiceJsonRecord> {
  return {
    ok: false,
    operation,
    target: jsonFileTargets.services.entity,
    reason: "invalid_payload",
    message,
    details,
  };
}

function createServiceRecord(input: ServiceValidatedInput, now: string): ServiceJsonRecord {
  return {
    id: `svc-${randomUUID()}`,
    slug: input.slug,
    title_en: input.title_en,
    title_ar: input.title_ar,
    description_en: input.description_en,
    description_ar: input.description_ar,
    features_en: [...input.features_en],
    features_ar: [...input.features_ar],
    price_info: input.price_info,
    visibility_status: input.visibility_status,
    created_at: now,
    updated_at: now,
  };
}

function updateServiceRecord(existing: ServiceJsonRecord, input: ServiceValidatedInput, now: string): ServiceJsonRecord {
  return {
    ...existing,
    slug: input.slug,
    title_en: input.title_en,
    title_ar: input.title_ar,
    description_en: input.description_en,
    description_ar: input.description_ar,
    features_en: [...input.features_en],
    features_ar: [...input.features_ar],
    price_info: input.price_info,
    visibility_status: input.visibility_status,
    updated_at: now,
  };
}

export function createServiceJsonRecord(
  input: ServiceValidatedInput,
  options: ServiceJsonSaveOptions = {},
): JsonWriteResult<ServiceJsonRecord> {
  const now = options.now ?? new Date().toISOString();
  const record = createServiceRecord(input, now);
  const guardResult = jsonWriter.write<ServiceJsonRecord>({
    operation: "create",
    target: servicesJsonWriteTarget,
    record,
    options,
  });

  if (!guardResult.ok) {
    return guardResult;
  }

  const services = readServicesFile();

  if (services.some((service) => service.id === record.id || service.slug === record.slug)) {
    return validationFailure("create", "Service id or slug already exists.", [record.id, record.slug]);
  }

  writeServicesFile([...services, record]);

  return {
    ok: true,
    operation: "create",
    target: jsonFileTargets.services.entity,
    record,
    message: "Development-only service JSON create proof completed.",
  };
}

export function updateServiceJsonRecord(
  serviceId: Service["id"],
  input: ServiceValidatedInput,
  options: ServiceJsonSaveOptions = {},
): JsonWriteResult<ServiceJsonRecord> {
  const services = readServicesFile();
  const serviceIndex = services.findIndex((service) => service.id === serviceId);

  if (serviceIndex < 0) {
    return validationFailure("update", "Service record was not found for update.", [serviceId]);
  }

  if (services.some((service) => service.id !== serviceId && service.slug === input.slug)) {
    return validationFailure("update", "Service slug already belongs to another record.", [input.slug]);
  }

  const now = options.now ?? new Date().toISOString();
  const record = updateServiceRecord(services[serviceIndex], input, now);
  const guardResult = jsonWriter.write<ServiceJsonRecord>({
    operation: "update",
    target: servicesJsonWriteTarget,
    record,
    options,
  });

  if (!guardResult.ok) {
    return guardResult;
  }

  writeServicesFile(services.map((service) => (service.id === serviceId ? record : service)));

  return {
    ok: true,
    operation: "update",
    target: jsonFileTargets.services.entity,
    record,
    message: "Development-only service JSON update proof completed.",
  };
}