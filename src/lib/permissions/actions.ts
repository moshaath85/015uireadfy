export type EntityAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "publish"
  | "unpublish"
  | "archive"
  | "restore"
  | "manage";

export type EntityResource =
  | "artist"
  | "artwork"
  | "collection"
  | "exhibition"
  | "project"
  | "service"
  | "news"
  | "publication"
  | "media"
  | "inquiry"
  | "appointment"
  | "certificate"
  | "settings"
  | "audit_log";

export interface PermissionRequest {
  readonly action: EntityAction;
  readonly resource: EntityResource;
  readonly ownerId?: string;
}