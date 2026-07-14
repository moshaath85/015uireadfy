export type Tex7RepositoryKey = string;
export type Tex7RepositoryProviderId = string;
export type Tex7RepositoryProductId = string;
export type Tex7RepositoryTenantId = string;
export type Tex7RepositoryEntityId = string | number;

export interface Tex7RepositoryActor {
  readonly id: string;
  readonly type: "system" | "user" | "service" | "migration" | "test";
  readonly displayName?: string;
}

export interface Tex7RepositoryAuditContext {
  readonly actor?: Tex7RepositoryActor;
  readonly source: "public" | "admin" | "system" | "migration" | "test";
  readonly requestId?: string;
  readonly reason?: string;
}

export interface Tex7RepositoryVersion {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly label?: string;
}

export interface Tex7RepositorySchemaMetadata {
  readonly schemaKey: string;
  readonly schemaVersion: Tex7RepositoryVersion;
  readonly compatibleFrom?: Tex7RepositoryVersion;
  readonly compatibleUntil?: Tex7RepositoryVersion;
}

export interface Tex7RepositoryContext {
  readonly productId: Tex7RepositoryProductId;
  readonly tenantId?: Tex7RepositoryTenantId;
  readonly providerId: Tex7RepositoryProviderId;
  readonly repositoryKey: Tex7RepositoryKey;
  readonly schema?: Tex7RepositorySchemaMetadata;
  readonly audit?: Tex7RepositoryAuditContext;
  readonly metadata?: Record<string, unknown>;
}

export interface Tex7RepositoryOptimisticLock {
  readonly field: string;
  readonly expectedVersion: string | number;
}

export interface Tex7RepositorySoftDeleteMapping {
  readonly deletedAtField: string;
  readonly deletedByField?: string;
  readonly deletedReasonField?: string;
}

export interface Tex7RepositoryAuditFieldMapping {
  readonly createdAtField: string;
  readonly createdByField?: string;
  readonly updatedAtField: string;
  readonly updatedByField?: string;
}
