export type AdminUserId = string | number;

export type AdminRole = "owner" | "director" | "editor" | "viewer";

export type AuthSessionStatus = "authenticated" | "unauthenticated";

export type AuthGuardReason =
  | "unauthenticated"
  | "missing-role"
  | "inactive-user"
  | "expired-session";

export interface AdminUser {
  readonly id: AdminUserId;
  readonly email: string;
  readonly name?: string;
  readonly role: AdminRole;
  readonly active: boolean;
}

export interface AuthenticatedSession {
  readonly status: "authenticated";
  readonly user: AdminUser;
  readonly issuedAt?: string;
  readonly expiresAt?: string;
}

export interface UnauthenticatedSession {
  readonly status: "unauthenticated";
  readonly user: null;
  readonly reason?: AuthGuardReason;
}

export type AuthSession = AuthenticatedSession | UnauthenticatedSession;

export interface AuthGuardResult {
  readonly allowed: boolean;
  readonly reason?: AuthGuardReason;
}

export interface RoleGuardRequirement {
  readonly roles: readonly AdminRole[];
  readonly requireActiveUser?: boolean;
}