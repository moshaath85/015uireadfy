import type { Tex7TranslationLifecycleStatus } from "./localization-status";
import type { Tex7TranslationIdentity } from "./localization-types";
import type { Tex7LocalizationGovernanceActor } from "./localization-governance";

export type Tex7LocalizationAuditEventType =
  | "created"
  | "updated"
  | "translated"
  | "reviewed"
  | "approved"
  | "published"
  | "archived"
  | "restored"
  | "owner_assigned"
  | "ownership_transferred"
  | "locked"
  | "unlocked";

export interface Tex7LocalizationAuditActor
  extends Tex7LocalizationGovernanceActor {
  ipAddress?: string;
  userAgent?: string;
}

export interface Tex7LocalizationAuditChange {
  fieldKey: string;
  previousValue?: unknown;
  nextValue?: unknown;
  localized: boolean;
}

export interface Tex7LocalizationAuditEntry {
  auditId: string;
  translation: Tex7TranslationIdentity;
  eventType: Tex7LocalizationAuditEventType;
  actor: Tex7LocalizationAuditActor;
  occurredAt: string;
  previousLifecycleStatus?: Tex7TranslationLifecycleStatus;
  nextLifecycleStatus?: Tex7TranslationLifecycleStatus;
  changes?: Tex7LocalizationAuditChange[];
  reason?: string;
  correlationId?: string;
}

export interface Tex7LocalizationAuditTrail {
  translation: Tex7TranslationIdentity;
  entries: Tex7LocalizationAuditEntry[];
}

export interface Tex7LocalizationAuditQuery {
  translation?: Tex7TranslationIdentity;
  actorId?: string;
  eventTypes?: Tex7LocalizationAuditEventType[];
  occurredAfter?: string;
  occurredBefore?: string;
}

export interface Tex7LocalizationAuditProvider {
  listAuditEntries(
    query: Tex7LocalizationAuditQuery,
  ): Promise<Tex7LocalizationAuditEntry[]>;
  getAuditTrail(
    translation: Tex7TranslationIdentity,
  ): Promise<Tex7LocalizationAuditTrail>;
}