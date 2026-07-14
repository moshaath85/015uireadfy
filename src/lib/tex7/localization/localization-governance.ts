import type { Tex7CompletenessResult } from "./localization-completeness";
import type { Tex7TranslationLifecycleStatus } from "./localization-status";
import type {
  Tex7LocalizedEntityIdentity,
  Tex7TranslationHealthReport,
  Tex7TranslationIdentity,
} from "./localization-types";

export type Tex7LocalizationGovernanceRole =
  | "owner"
  | "current_editor"
  | "reviewer"
  | "approver"
  | "publisher";

export interface Tex7LocalizationGovernanceActor {
  actorId: string;
  actorType: string;
  displayName?: string;
  providerRef?: string;
}

export interface Tex7TranslationOwnershipAssignment {
  role: Tex7LocalizationGovernanceRole;
  actor: Tex7LocalizationGovernanceActor;
  assignedAt: string;
  assignedBy?: Tex7LocalizationGovernanceActor;
  reason?: string;
}

export interface Tex7TranslationOwnershipTransfer {
  translation: Tex7TranslationIdentity;
  role: Tex7LocalizationGovernanceRole;
  fromActor?: Tex7LocalizationGovernanceActor;
  toActor: Tex7LocalizationGovernanceActor;
  transferredAt: string;
  transferredBy: Tex7LocalizationGovernanceActor;
  reason?: string;
}

export interface Tex7TranslationOwnershipHistoryEntry {
  transfer: Tex7TranslationOwnershipTransfer;
  previousAssignment?: Tex7TranslationOwnershipAssignment;
  resultingAssignment: Tex7TranslationOwnershipAssignment;
}

export interface Tex7TranslationGovernanceOwnership {
  translation: Tex7TranslationIdentity;
  owner?: Tex7TranslationOwnershipAssignment;
  currentEditor?: Tex7TranslationOwnershipAssignment;
  reviewer?: Tex7TranslationOwnershipAssignment;
  approver?: Tex7TranslationOwnershipAssignment;
  publisher?: Tex7TranslationOwnershipAssignment;
  ownershipHistory: Tex7TranslationOwnershipHistoryEntry[];
}

export type Tex7EditorialReadinessStatus =
  | "not_ready"
  | "ready_for_editing"
  | "ready_for_review"
  | "ready_for_approval"
  | "ready_for_publication";

export type Tex7LocalizationGovernanceStatus =
  | "unassigned"
  | "assigned"
  | "editing"
  | "reviewing"
  | "approved"
  | "published"
  | "blocked";

export interface Tex7TranslationGovernanceReadiness {
  translation: Tex7TranslationIdentity;
  lifecycleStatus: Tex7TranslationLifecycleStatus;
  completeness: Tex7CompletenessResult;
  editorialReadiness: Tex7EditorialReadinessStatus;
  reviewReady: boolean;
  publicationReady: boolean;
  governanceStatus: Tex7LocalizationGovernanceStatus;
  blockingReasons: string[];
}

export interface Tex7TranslationGovernanceHealth {
  entity: Tex7LocalizedEntityIdentity;
  translationHealth: Tex7TranslationHealthReport;
  readinessByLocale: Tex7TranslationGovernanceReadiness[];
  unassignedTranslations: string[];
  blockedTranslations: string[];
  translationsAwaitingOwnerAction: string[];
}

export interface Tex7LocalizationGovernanceProvider {
  getOwnership(
    translation: Tex7TranslationIdentity,
  ): Promise<Tex7TranslationGovernanceOwnership>;
  listOwnershipHistory(
    translation: Tex7TranslationIdentity,
  ): Promise<Tex7TranslationOwnershipHistoryEntry[]>;
  getGovernanceReadiness(
    translation: Tex7TranslationIdentity,
  ): Promise<Tex7TranslationGovernanceReadiness>;
  getGovernanceHealth(
    entity: Tex7LocalizedEntityIdentity,
  ): Promise<Tex7TranslationGovernanceHealth>;
}