import type { News } from "@/types";
import {
  validateNewsFormInput,
  type NewsValidatedInput,
  type NewsValidationIssue,
  type NewsValidationSource,
} from "@/lib/cms/news/news-validation";
import type { ProductionWriteResult } from "@/lib/cms/production-prisma";
import { saveNewsRecord } from "@/lib/cms/production-prisma";

export type NewsActionMode = "create" | "update";
export type NewsActionStatus = "prepared" | "validation_error" | "mutation_disabled" | "saved";

export interface NewsActionContext {
  readonly mutationEnabled?: boolean;
  readonly existingNewsId?: News["id"];
  readonly environment?: string;
  readonly organizationId?: string;
}

export interface NewsActionSuccess {
  readonly ok: true;
  readonly mode: NewsActionMode;
  readonly status: "prepared" | "saved";
  readonly data: NewsValidatedInput;
  readonly newsId?: News["id"];
  readonly shouldWriteJson: false;
  readonly shouldWriteDatabase: boolean;
  readonly writeResult?: ProductionWriteResult<News>;
  readonly message: string;
}

export interface NewsActionFailure {
  readonly ok: false;
  readonly mode: NewsActionMode;
  readonly status: Exclude<NewsActionStatus, "prepared" | "saved">;
  readonly issues: readonly NewsValidationIssue[];
  readonly newsId?: News["id"];
  readonly shouldWriteJson: false;
  readonly shouldWriteDatabase: false;
  readonly writeResult?: ProductionWriteResult<News>;
  readonly message: string;
}

export type NewsActionResult = NewsActionSuccess | NewsActionFailure;

function preparedResult(mode: NewsActionMode, data: NewsValidatedInput, newsId?: News["id"]): NewsActionSuccess {
  return {
    ok: true,
    mode,
    status: "prepared",
    data,
    newsId,
    shouldWriteJson: false,
    shouldWriteDatabase: false,
    message: "News input is valid. PostgreSQL mutation is disabled unless explicitly enabled.",
  };
}

function savedResult(
  mode: NewsActionMode,
  data: NewsValidatedInput,
  writeResult: ProductionWriteResult<News>,
  newsId?: News["id"],
): NewsActionSuccess {
  return {
    ok: true,
    mode,
    status: "saved",
    data,
    newsId: writeResult.ok ? writeResult.record.id : newsId,
    shouldWriteJson: false,
    shouldWriteDatabase: true,
    writeResult,
    message: writeResult.message,
  };
}

function validationErrorResult(
  mode: NewsActionMode,
  issues: readonly NewsValidationIssue[],
  newsId?: News["id"],
  message = "News input could not be validated.",
): NewsActionFailure {
  return {
    ok: false,
    mode,
    status: "validation_error",
    issues,
    newsId,
    shouldWriteJson: false,
    shouldWriteDatabase: false,
    message,
  };
}

function mutationFailureResult(
  mode: NewsActionMode,
  writeResult: ProductionWriteResult<News>,
  newsId?: News["id"],
): NewsActionFailure {
  return {
    ok: false,
    mode,
    status: "mutation_disabled",
    issues: [],
    newsId,
    shouldWriteJson: false,
    shouldWriteDatabase: false,
    writeResult,
    message: writeResult.message,
  };
}

function requireOrganizationId(mode: NewsActionMode, organizationId: string | undefined, newsId?: News["id"]): NewsActionFailure | null {
  if (organizationId) return null;
  return validationErrorResult(mode, [{ field: "slug", message: "Admin organization context is required for PostgreSQL persistence." }] as readonly NewsValidationIssue[], newsId);
}

export async function prepareCreateNewsAction(
  source: NewsValidationSource,
  context: NewsActionContext = {},
): Promise<NewsActionResult> {
  const validation = validateNewsFormInput(source);

  if (!validation.valid) {
    return validationErrorResult("create", validation.issues);
  }

  if (!context.mutationEnabled) {
    return preparedResult("create", validation.data);
  }

  const organizationBlock = requireOrganizationId("create", context.organizationId);
  if (organizationBlock) return organizationBlock;

  const writeResult = await saveNewsRecord(validation.data, {
    organizationId: context.organizationId as string,
  });

  if (!writeResult.ok) {
    return mutationFailureResult("create", writeResult);
  }

  return savedResult("create", validation.data, writeResult);
}

export async function prepareUpdateNewsAction(
  newsId: News["id"],
  source: NewsValidationSource,
  context: NewsActionContext = {},
): Promise<NewsActionResult> {
  const resolvedNewsId = context.existingNewsId ?? newsId;

  if (!resolvedNewsId) {
    return validationErrorResult("update", [{ field: "slug", message: "News id is required for update preparation." }] as readonly NewsValidationIssue[]);
  }

  const validation = validateNewsFormInput(source);

  if (!validation.valid) {
    return validationErrorResult("update", validation.issues, resolvedNewsId);
  }

  if (!context.mutationEnabled) {
    return preparedResult("update", validation.data, resolvedNewsId);
  }

  const organizationBlock = requireOrganizationId("update", context.organizationId, resolvedNewsId);
  if (organizationBlock) return organizationBlock;

  const writeResult = await saveNewsRecord(validation.data, {
    id: resolvedNewsId,
    organizationId: context.organizationId as string,
  });

  if (!writeResult.ok) {
    return mutationFailureResult("update", writeResult, resolvedNewsId);
  }

  return savedResult("update", validation.data, writeResult, resolvedNewsId);
}
