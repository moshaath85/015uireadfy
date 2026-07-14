import "server-only";

import { cookies } from "next/headers";

import {
  ADMIN_SESSION_COOKIE,
  getAdminRoleRank,
  readAdminSessionToken,
  recordAdminSecurityEvent,
  type AdminSessionPayload,
} from "./admin-auth-runtime";
import type { AdminRole } from "./auth-types";

export interface AdminActionAuthorizationContext {
  readonly authenticated: true;
  readonly userId: string;
  readonly email: string;
  readonly role: AdminRole;
  readonly organizationId: string;
}

export class AdminActionAuthorizationError extends Error {
  constructor(message = "Admin authentication is required for this operation.") {
    super(message);
    this.name = "AdminActionAuthorizationError";
  }
}

function toActionContext(session: AdminSessionPayload): AdminActionAuthorizationContext {
  return {
    authenticated: true,
    userId: String(session.user.id),
    email: session.user.email,
    role: session.user.role,
    organizationId: session.user.organizationId,
  };
}

export async function requireAdminServerAction(
  operation: string,
  minimumRole: AdminRole = "editor",
): Promise<AdminActionAuthorizationContext> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await readAdminSessionToken(token);

  if (!session) {
    recordAdminSecurityEvent({
      type: "admin_action_rejected",
      outcome: "failure",
      operation,
      reason: "missing_or_invalid_session",
    });

    throw new AdminActionAuthorizationError();
  }

  if (!session.user.organizationId) {
    recordAdminSecurityEvent({
      type: "admin_action_rejected",
      outcome: "failure",
      operation,
      email: session.user.email,
      role: session.user.role,
      reason: "missing_organization_context",
    });

    throw new AdminActionAuthorizationError("Admin organization context is required.");
  }

  if (getAdminRoleRank(session.user.role) < getAdminRoleRank(minimumRole)) {
    recordAdminSecurityEvent({
      type: "admin_action_rejected",
      outcome: "failure",
      operation,
      email: session.user.email,
      role: session.user.role,
      organizationId: session.user.organizationId,
      reason: "insufficient_role",
    });

    throw new AdminActionAuthorizationError("Admin role is not permitted for this operation.");
  }

  recordAdminSecurityEvent({
    type: "admin_action_authorized",
    outcome: "success",
    operation,
    email: session.user.email,
    role: session.user.role,
    organizationId: session.user.organizationId,
  });

  return toActionContext(session);
}

export function assertRepositoryWriteAuthorized(
  context: AdminActionAuthorizationContext | null | undefined,
  operation: string,
  minimumRole: AdminRole = "editor",
): AdminActionAuthorizationContext {
  if (
    !context?.authenticated ||
    !context.organizationId ||
    getAdminRoleRank(context.role) < getAdminRoleRank(minimumRole)
  ) {
    recordAdminSecurityEvent({
      type: "repository_write_rejected",
      outcome: "failure",
      operation,
      role: context?.role,
      organizationId: context?.organizationId,
      reason: "missing_or_invalid_write_context",
    });

    throw new AdminActionAuthorizationError("Authorized admin context is required for repository writes.");
  }

  return context;
}