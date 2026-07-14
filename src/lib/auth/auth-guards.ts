import type {
  AdminRole,
  AuthGuardResult,
  AuthSession,
  RoleGuardRequirement,
} from "./auth-types";
import { isAuthenticatedSession } from "./auth-session";

export function allowAuthGuard(): AuthGuardResult {
  return {
    allowed: true,
  };
}

export function denyAuthGuard(reason: AuthGuardResult["reason"]): AuthGuardResult {
  return {
    allowed: false,
    reason,
  };
}

export function hasAdminRole(session: AuthSession, roles: readonly AdminRole[]): boolean {
  return isAuthenticatedSession(session) && roles.includes(session.user.role);
}

export function requireAuthenticatedSession(session: AuthSession): AuthGuardResult {
  if (!isAuthenticatedSession(session)) {
    return denyAuthGuard(session.reason ?? "unauthenticated");
  }

  return allowAuthGuard();
}

export function requireActiveAdminUser(session: AuthSession): AuthGuardResult {
  const authenticated = requireAuthenticatedSession(session);

  if (!authenticated.allowed) {
    return authenticated;
  }

  if (!isAuthenticatedSession(session) || !session.user.active) {
    return denyAuthGuard("inactive-user");
  }

  return allowAuthGuard();
}

export function requireAdminRole(
  session: AuthSession,
  requirement: RoleGuardRequirement,
): AuthGuardResult {
  const activeUserResult = requirement.requireActiveUser
    ? requireActiveAdminUser(session)
    : requireAuthenticatedSession(session);

  if (!activeUserResult.allowed) {
    return activeUserResult;
  }

  if (!hasAdminRole(session, requirement.roles)) {
    return denyAuthGuard("missing-role");
  }

  return allowAuthGuard();
}

export function getAdminRouteAccessNotice(session: AuthSession): AuthGuardResult {
  return requireAuthenticatedSession(session);
}

export function shouldShowAdminAccessNotice(session: AuthSession): boolean {
  return !getAdminRouteAccessNotice(session).allowed;
}