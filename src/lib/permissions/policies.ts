import type { EntityAction, EntityResource, PermissionRequest } from "./actions";
import {
  hasAnyRole,
  isAdmin,
  isAuthenticated,
  isStaff,
  type PermissionPrincipal
} from "./roles";

export interface PermissionDecision {
  readonly allowed: boolean;
  readonly reason?: string;
}

const PUBLIC_READ_RESOURCES: readonly EntityResource[] = [
  "artist",
  "artwork",
  "collection",
  "exhibition",
  "project",
  "service",
  "news",
  "publication",
  "media"
];

const STAFF_MUTATION_ACTIONS: readonly EntityAction[] = [
  "create",
  "update",
  "publish",
  "unpublish",
  "archive",
  "restore"
];

const ADMIN_ONLY_RESOURCES: readonly EntityResource[] = [
  "certificate",
  "settings",
  "audit_log"
];

function allow(): PermissionDecision {
  return { allowed: true };
}

function deny(reason: string): PermissionDecision {
  return { allowed: false, reason };
}

export function canReadPublicResource(request: PermissionRequest): boolean {
  return request.action === "read" && PUBLIC_READ_RESOURCES.includes(request.resource);
}

export function canManageResource(
  principal: PermissionPrincipal | undefined,
  request: PermissionRequest
): boolean {
  if (hasAnyRole(principal, ["super_admin"])) {
    return true;
  }

  if (request.action === "manage") {
    return isAdmin(principal);
  }

  if (ADMIN_ONLY_RESOURCES.includes(request.resource)) {
    return isAdmin(principal);
  }

  if (STAFF_MUTATION_ACTIONS.includes(request.action)) {
    return isStaff(principal);
  }

  if (request.action === "delete") {
    return isAdmin(principal);
  }

  return false;
}

export function canAccessOwnResource(
  principal: PermissionPrincipal | undefined,
  request: PermissionRequest
): boolean {
  return isAuthenticated(principal) && Boolean(request.ownerId && principal?.id === request.ownerId);
}

export function evaluatePermission(
  principal: PermissionPrincipal | undefined,
  request: PermissionRequest
): PermissionDecision {
  if (canReadPublicResource(request)) {
    return allow();
  }

  if (canManageResource(principal, request)) {
    return allow();
  }

  if (request.action === "read" && canAccessOwnResource(principal, request)) {
    return allow();
  }

  return deny("Permission denied for this action and resource.");
}

export function hasPermission(
  principal: PermissionPrincipal | undefined,
  request: PermissionRequest
): boolean {
  return evaluatePermission(principal, request).allowed;
}