import type { Publication } from "@/types";
import {
  prepareCreatePublicationAction,
  prepareUpdatePublicationAction,
  type PublicationActionContext,
  type PublicationActionResult,
} from "./publications-actions";
import type { PublicationValidationSource } from "./publications-validation";

export type PublicationRuntimeMode = "create" | "update";
export type PublicationRuntimeResult = Promise<PublicationActionResult>;
export type PublicationRuntimeContext = PublicationActionContext;

export function prepareCreatePublicationRuntimeAction(
  source: PublicationValidationSource,
  context: PublicationRuntimeContext = {},
): PublicationRuntimeResult {
  return prepareCreatePublicationAction(source, context);
}

export function prepareUpdatePublicationRuntimeAction(
  publicationId: Publication["id"],
  source: PublicationValidationSource,
  context: PublicationRuntimeContext = {},
): PublicationRuntimeResult {
  return prepareUpdatePublicationAction(publicationId, source, context);
}
