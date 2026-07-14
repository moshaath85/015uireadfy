import type { Service } from "@/types";
import {
  prepareCreateServiceAction,
  prepareUpdateServiceAction,
  type ServiceActionContext,
  type ServiceActionResult,
} from "./services-actions";
import type { ServiceValidationSource } from "./services-validation";

export type ServiceRuntimeMode = "create" | "update";
export type ServiceRuntimeResult = Promise<ServiceActionResult>;
export type ServiceRuntimeContext = ServiceActionContext;

export function prepareCreateServiceRuntimeAction(
  source: ServiceValidationSource,
  context: ServiceRuntimeContext = {},
): ServiceRuntimeResult {
  return prepareCreateServiceAction(source, context);
}

export function prepareUpdateServiceRuntimeAction(
  serviceId: Service["id"],
  source: ServiceValidationSource,
  context: ServiceRuntimeContext = {},
): ServiceRuntimeResult {
  return prepareUpdateServiceAction(serviceId, source, context);
}
