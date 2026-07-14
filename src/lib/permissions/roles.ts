export type UserRole = "guest" | "user" | "vip" | "editor" | "admin" | "super_admin";

export interface PermissionPrincipal {
  readonly id?: string;
  readonly roles: readonly UserRole[];
}

export function hasRole(principal: PermissionPrincipal | undefined, role: UserRole): boolean {
  return Boolean(principal?.roles.includes(role));
}

export function hasAnyRole(
  principal: PermissionPrincipal | undefined,
  roles: readonly UserRole[]
): boolean {
  return Boolean(principal?.roles.some((role) => roles.includes(role)));
}

export function isAuthenticated(principal: PermissionPrincipal | undefined): boolean {
  return Boolean(principal?.id);
}

export function isAdmin(principal: PermissionPrincipal | undefined): boolean {
  return hasAnyRole(principal, ["admin", "super_admin"]);
}

export function isStaff(principal: PermissionPrincipal | undefined): boolean {
  return hasAnyRole(principal, ["editor", "admin", "super_admin"]);
}