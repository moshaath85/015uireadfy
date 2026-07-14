import type {
  AdminUser,
  AuthGuardReason,
  AuthSession,
  AuthenticatedSession,
  UnauthenticatedSession,
} from "./auth-types";

export function createAuthenticatedSession(
  user: AdminUser,
  issuedAt?: string,
  expiresAt?: string,
): AuthenticatedSession {
  return {
    status: "authenticated",
    user,
    issuedAt,
    expiresAt,
  };
}

export function createUnauthenticatedSession(reason?: AuthGuardReason): UnauthenticatedSession {
  return {
    status: "unauthenticated",
    user: null,
    reason,
  };
}

export function createPendingAdminSession(): UnauthenticatedSession {
  return createUnauthenticatedSession("unauthenticated");
}

export function isAuthenticatedSession(session: AuthSession): session is AuthenticatedSession {
  return session.status === "authenticated";
}

export function isUnauthenticatedSession(session: AuthSession): session is UnauthenticatedSession {
  return session.status === "unauthenticated";
}

export function getSessionUser(session: AuthSession): AdminUser | null {
  return isAuthenticatedSession(session) ? session.user : null;
}