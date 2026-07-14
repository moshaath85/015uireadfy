import type {
  Tex7RepositoryAuditFieldMapping,
  Tex7RepositoryOptimisticLock,
  Tex7RepositorySoftDeleteMapping,
} from "./repository-context";

export interface Tex7RepositoryWriteAuthorizationContext {
  readonly authenticated: true;
  readonly userId: string;
  readonly role: string;
  readonly organizationId: string;
}

export interface Tex7RepositoryWriteAuthorizationRequirement {
  readonly authorization: Tex7RepositoryWriteAuthorizationContext;
}

export interface Tex7RepositoryCreateOptions extends Partial<Tex7RepositoryWriteAuthorizationRequirement> {
  readonly auditFields?: Tex7RepositoryAuditFieldMapping;
  readonly allowGeneratedId?: boolean;
}

export interface Tex7RepositoryUpdateOptions extends Partial<Tex7RepositoryWriteAuthorizationRequirement> {
  readonly optimisticLock?: Tex7RepositoryOptimisticLock;
  readonly auditFields?: Tex7RepositoryAuditFieldMapping;
  readonly partial?: boolean;
}

export interface Tex7RepositorySoftDeleteOptions extends Partial<Tex7RepositoryWriteAuthorizationRequirement> {
  readonly mapping: Tex7RepositorySoftDeleteMapping;
  readonly optimisticLock?: Tex7RepositoryOptimisticLock;
  readonly reason?: string;
}

export interface Tex7RepositoryRestoreOptions extends Partial<Tex7RepositoryWriteAuthorizationRequirement> {
  readonly mapping: Tex7RepositorySoftDeleteMapping;
  readonly optimisticLock?: Tex7RepositoryOptimisticLock;
}

export interface Tex7RepositoryWriteCapabilities {
  readonly supportsCreate: boolean;
  readonly supportsUpdate: boolean;
  readonly supportsSoftDelete: boolean;
  readonly supportsRestore: boolean;
  readonly supportsOptimisticLocking: boolean;
  readonly supportsAuditFields: boolean;
  readonly writesEnabled: boolean;
  readonly requiresAuthorization: true;
  readonly requiresOrganizationContext: true;
}

export interface Tex7RepositoryWriteResult<TEntity> {
  readonly entity: TEntity;
  readonly created: boolean;
  readonly updated: boolean;
  readonly softDeleted: boolean;
  readonly restored: boolean;
}