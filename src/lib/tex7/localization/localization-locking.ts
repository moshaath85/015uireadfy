import type { Tex7TranslationIdentity } from "./localization-types";
import type { Tex7LocalizationGovernanceActor } from "./localization-governance";

export type Tex7TranslationLockStatus = "unlocked" | "locked" | "expired";

export interface Tex7TranslationLockIdentity {
  lockId: string;
  translation: Tex7TranslationIdentity;
}

export interface Tex7TranslationLockState extends Tex7TranslationLockIdentity {
  status: Tex7TranslationLockStatus;
  lockedBy?: Tex7LocalizationGovernanceActor;
  lockedAt?: string;
  expiresAt?: string;
  reason?: string;
}

export interface Tex7TranslationForceUnlockPolicy {
  allowForceUnlock: boolean;
  allowedPrincipalTypes?: string[];
  allowedRoleRefs?: string[];
  requireReason: boolean;
  requireAuditEntry: boolean;
}

export interface Tex7TranslationLockPolicy {
  defaultLockDurationSeconds?: number;
  expireLocksAutomatically: boolean;
  allowOwnerToRelock: boolean;
  allowConcurrentLocks: false;
  forceUnlockPolicy: Tex7TranslationForceUnlockPolicy;
}

export interface Tex7TranslationLockRequest {
  translation: Tex7TranslationIdentity;
  requestedBy: Tex7LocalizationGovernanceActor;
  requestedAt: string;
  reason?: string;
  durationSeconds?: number;
}

export interface Tex7TranslationUnlockRequest {
  lock: Tex7TranslationLockIdentity;
  requestedBy: Tex7LocalizationGovernanceActor;
  requestedAt: string;
  force: boolean;
  reason?: string;
}

export interface Tex7TranslationLockProvider {
  getLockState(
    translation: Tex7TranslationIdentity,
  ): Promise<Tex7TranslationLockState>;
  listActiveLocks(
    translation: Tex7TranslationIdentity,
  ): Promise<Tex7TranslationLockState[]>;
}