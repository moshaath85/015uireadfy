import type { Tex7DatabaseCapabilities } from "./database-capabilities";
import type { Tex7DatabaseVersionMetadata } from "./database-version";

export type Tex7TenantId = string;
export type Tex7ProductId = string;
export type Tex7RepositoryKey = string;
export type Tex7RecordId = string | number;

export interface Tex7DatabaseActor {
  readonly id: string;
  readonly type: "system" | "user" | "service" | "migration";
  readonly displayName?: string;
}

export interface Tex7DatabaseAuditContext {
  readonly actor?: Tex7DatabaseActor;
  readonly requestId?: string;
  readonly source: "public" | "admin" | "system" | "migration" | "test";
  readonly reason?: string;
}

export interface Tex7DatabaseContext {
  readonly productId: Tex7ProductId;
  readonly tenantId?: Tex7TenantId;
  readonly providerId: string;
  readonly capabilities: Tex7DatabaseCapabilities;
  readonly version: Tex7DatabaseVersionMetadata;
  readonly audit?: Tex7DatabaseAuditContext;
  readonly metadata?: Record<string, unknown>;
}

export interface Tex7OptimisticLock {
  readonly field: string;
  readonly expectedVersion: string | number;
}

export interface Tex7SoftDeleteMetadata {
  readonly deletedAtField: string;
  readonly deletedByField?: string;
  readonly includeDeleted?: boolean;
}

export interface Tex7AuditFieldMapping {
  readonly createdAtField: string;
  readonly createdByField?: string;
  readonly updatedAtField: string;
  readonly updatedByField?: string;
}
