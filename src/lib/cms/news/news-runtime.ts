import type { News } from "@/types";
import {
  prepareCreateNewsAction,
  prepareUpdateNewsAction,
  type NewsActionContext,
  type NewsActionResult,
} from "./news-actions";
import type { NewsValidationSource } from "./news-validation";

export type NewsRuntimeMode = "create" | "update";
export type NewsRuntimeResult = Promise<NewsActionResult>;
export type NewsRuntimeContext = NewsActionContext;

export function prepareCreateNewsRuntimeAction(
  source: NewsValidationSource,
  context: NewsRuntimeContext = {},
): NewsRuntimeResult {
  return prepareCreateNewsAction(source, context);
}

export function prepareUpdateNewsRuntimeAction(
  newsId: News["id"],
  source: NewsValidationSource,
  context: NewsRuntimeContext = {},
): NewsRuntimeResult {
  return prepareUpdateNewsAction(newsId, source, context);
}
