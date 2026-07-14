import { requireActiveAdminUser, requireAdminRole } from "@/lib/auth/auth-guards";
import { createPendingAdminSession } from "@/lib/auth/auth-session";
import type { AdminRole, AuthSession } from "@/lib/auth/auth-types";
import type { JsonFileTarget, JsonWriteTarget } from "./json-file-types";
import {
  createJsonWriteFailure,
  createJsonWriteSuccess,
  type JsonWriteOperation,
  type JsonWriteResult,
} from "./json-write-result";

export interface JsonWriteGuardOptions {
  allowDevelopmentWrites?: boolean;
  environment?: string;
  adminSession?: AuthSession;
  requireActiveAdmin?: boolean;
  allowedRoles?: readonly AdminRole[];
}

export interface JsonWriteGuardInput<TRecord = Record<string, unknown>> {
  operation: JsonWriteOperation;
  target: JsonWriteTarget<TRecord>;
  record?: Partial<TRecord>;
  options?: JsonWriteGuardOptions;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const isDevelopmentEnvironment = (
  environment: string | undefined = process.env.NODE_ENV,
): boolean => environment === "development";

export const isSafeJsonFileTarget = (target: JsonFileTarget): boolean =>
  target.relativePath === `data/${target.entity}.json` &&
  target.fileName === `${target.entity}.json` &&
  !target.relativePath.includes("..") &&
  !target.relativePath.startsWith("/") &&
  target.relativePath.endsWith(".json");

export const guardJsonWrite = <TRecord = Record<string, unknown>>({
  operation,
  target,
  record,
  options = {},
}: JsonWriteGuardInput<TRecord>): JsonWriteResult<TRecord> => {
  if (!isSafeJsonFileTarget(target.file)) {
    return createJsonWriteFailure(
      operation,
      "invalid_target",
      "JSON write target is not an approved data file target.",
      target.file.entity,
      [target.file.relativePath],
    );
  }

  if (!isDevelopmentEnvironment(options.environment)) {
    return createJsonWriteFailure(
      operation,
      "unsafe_environment",
      "JSON writes are only allowed in a development environment.",
      target.file.entity,
    );
  }

  if (target.file.writeMode !== "development_write_disabled") {
    return createJsonWriteFailure(
      operation,
      "writes_disabled",
      "This JSON target is currently configured as read-only.",
      target.file.entity,
    );
  }

  if (!options.allowDevelopmentWrites) {
    return createJsonWriteFailure(
      operation,
      "writes_disabled",
      "Development JSON writes are disabled by default.",
      target.file.entity,
    );
  }

  const session = options.adminSession ?? createPendingAdminSession();
  const authResult = options.allowedRoles?.length
    ? requireAdminRole(session, {
        roles: options.allowedRoles,
        requireActiveUser: options.requireActiveAdmin ?? true,
      })
    : requireActiveAdminUser(session);

  if (!authResult.allowed) {
    return createJsonWriteFailure(
      operation,
      "authorization_required",
      "Runtime authorization is required before admin JSON mutation can proceed.",
      target.file.entity,
      [authResult.reason ?? "unauthenticated"],
    );
  }

  if (operation === "delete") {
    return createJsonWriteFailure(
      operation,
      "writes_disabled",
      "Delete operations are not enabled for the development JSON save proof.",
      target.file.entity,
    );
  }

  if (!isPlainObject(record)) {
    return createJsonWriteFailure(
      operation,
      "invalid_payload",
      "Create and update operations require a plain object payload.",
      target.file.entity,
    );
  }

  return createJsonWriteSuccess(
    operation,
    target.file.entity,
    "JSON write guards passed for an explicitly enabled development-only mutation.",
    record as TRecord | undefined,
  );
};