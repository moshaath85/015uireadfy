export type {
  PermissionPrincipal,
  UserRole
} from "./roles";

export {
  hasAnyRole,
  hasRole,
  isAdmin,
  isAuthenticated,
  isStaff
} from "./roles";

export type {
  EntityAction,
  EntityResource,
  PermissionRequest
} from "./actions";

export {
  canAccessOwnResource,
  canManageResource,
  canReadPublicResource,
  evaluatePermission,
  hasPermission
} from "./policies";

export type {
  PermissionDecision
} from "./policies";