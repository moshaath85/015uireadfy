import type { Service } from "@/types";
import {
  validateServiceFormInput,
  type ServiceValidatedInput,
  type ServiceValidationIssue,
  type ServiceValidationSource,
} from "@/lib/cms/services/services-validation";
import type { ProductionWriteResult } from "@/lib/cms/production-prisma";
import { saveServiceRecord } from "@/lib/cms/production-prisma";

export type ServiceActionMode = "create" | "update";
export type ServiceActionStatus = "prepared" | "validation_error" | "mutation_disabled" | "saved";

export interface ServiceActionContext {
  readonly mutationEnabled?: boolean;
  readonly existingServiceId?: Service["id"];
  readonly environment?: string;
  readonly organizationId?: string;
}

export interface ServiceActionSuccess {
  readonly ok: true;
  readonly mode: ServiceActionMode;
  readonly status: "prepared" | "saved";
  readonly data: ServiceValidatedInput;
  readonly serviceId?: Service["id"];
  readonly shouldWriteJson: false;
  readonly shouldWriteDatabase: boolean;
  readonly writeResult?: ProductionWriteResult<Service>;
  readonly message: string;
}

export interface ServiceActionFailure {
  readonly ok: false;
  readonly mode: ServiceActionMode;
  readonly status: Exclude<ServiceActionStatus, "prepared" | "saved">;
  readonly issues: readonly ServiceValidationIssue[];
  readonly serviceId?: Service["id"];
  readonly shouldWriteJson: false;
  readonly shouldWriteDatabase: false;
  readonly writeResult?: ProductionWriteResult<Service>;
  readonly message: string;
}

export type ServiceActionResult = ServiceActionSuccess | ServiceActionFailure;

function preparedResult(mode: ServiceActionMode, data: ServiceValidatedInput, serviceId?: Service["id"]): ServiceActionSuccess {
  return {
    ok: true,
    mode,
    status: "prepared",
    data,
    serviceId,
    shouldWriteJson: false,
    shouldWriteDatabase: false,
    message: "Service input is valid. PostgreSQL mutation is disabled unless explicitly enabled.",
  };
}

function savedResult(
  mode: ServiceActionMode,
  data: ServiceValidatedInput,
  writeResult: ProductionWriteResult<Service>,
  serviceId?: Service["id"],
): ServiceActionSuccess {
  return {
    ok: true,
    mode,
    status: "saved",
    data,
    serviceId: writeResult.ok ? writeResult.record.id : serviceId,
    shouldWriteJson: false,
    shouldWriteDatabase: true,
    writeResult,
    message: writeResult.message,
  };
}

function validationErrorResult(
  mode: ServiceActionMode,
  issues: readonly ServiceValidationIssue[],
  serviceId?: Service["id"],
  message = "Service input could not be validated.",
): ServiceActionFailure {
  return {
    ok: false,
    mode,
    status: "validation_error",
    issues,
    serviceId,
    shouldWriteJson: false,
    shouldWriteDatabase: false,
    message,
  };
}

function mutationFailureResult(
  mode: ServiceActionMode,
  writeResult: ProductionWriteResult<Service>,
  serviceId?: Service["id"],
): ServiceActionFailure {
  return {
    ok: false,
    mode,
    status: "mutation_disabled",
    issues: [],
    serviceId,
    shouldWriteJson: false,
    shouldWriteDatabase: false,
    writeResult,
    message: writeResult.message,
  };
}

function requireOrganizationId(mode: ServiceActionMode, organizationId: string | undefined, serviceId?: Service["id"]): ServiceActionFailure | null {
  if (organizationId) return null;
  return validationErrorResult(mode, [{ field: "slug", message: "Admin organization context is required for PostgreSQL persistence." }] as readonly ServiceValidationIssue[], serviceId);
}

export async function prepareCreateServiceAction(
  source: ServiceValidationSource,
  context: ServiceActionContext = {},
): Promise<ServiceActionResult> {
  const validation = validateServiceFormInput(source);

  if (!validation.valid) {
    return validationErrorResult("create", validation.issues);
  }

  if (!context.mutationEnabled) {
    return preparedResult("create", validation.data);
  }

  const organizationBlock = requireOrganizationId("create", context.organizationId);
  if (organizationBlock) return organizationBlock;

  const writeResult = await saveServiceRecord(validation.data, {
    organizationId: context.organizationId as string,
  });

  if (!writeResult.ok) {
    return mutationFailureResult("create", writeResult);
  }

  return savedResult("create", validation.data, writeResult);
}

export async function prepareUpdateServiceAction(
  serviceId: Service["id"],
  source: ServiceValidationSource,
  context: ServiceActionContext = {},
): Promise<ServiceActionResult> {
  const resolvedServiceId = context.existingServiceId ?? serviceId;

  if (!resolvedServiceId) {
    return validationErrorResult("update", [{ field: "slug", message: "Service id is required for update preparation." }] as readonly ServiceValidationIssue[]);
  }

  const validation = validateServiceFormInput(source);

  if (!validation.valid) {
    return validationErrorResult("update", validation.issues, resolvedServiceId);
  }

  if (!context.mutationEnabled) {
    return preparedResult("update", validation.data, resolvedServiceId);
  }

  const organizationBlock = requireOrganizationId("update", context.organizationId, resolvedServiceId);
  if (organizationBlock) return organizationBlock;

  const writeResult = await saveServiceRecord(validation.data, {
    id: resolvedServiceId,
    organizationId: context.organizationId as string,
  });

  if (!writeResult.ok) {
    return mutationFailureResult("update", writeResult, resolvedServiceId);
  }

  return savedResult("update", validation.data, writeResult, resolvedServiceId);
}
