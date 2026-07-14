import type { Tex7TranslationIdentity } from "./localization-types";
import type { Tex7LocalizationGovernanceActor } from "./localization-governance";

export type Tex7TranslationReviewStatus =
  | "not_requested"
  | "reviewer_assigned"
  | "review_requested"
  | "review_started"
  | "review_completed"
  | "review_rejected"
  | "review_approved";

export type Tex7TranslationReviewDecision =
  | "changes_requested"
  | "approved"
  | "rejected";

export interface Tex7TranslationReviewerAssignment {
  translation: Tex7TranslationIdentity;
  reviewer: Tex7LocalizationGovernanceActor;
  assignedAt: string;
  assignedBy: Tex7LocalizationGovernanceActor;
  dueAt?: string;
  instructions?: string;
}

export interface Tex7TranslationReviewComment {
  commentId: string;
  translation: Tex7TranslationIdentity;
  author: Tex7LocalizationGovernanceActor;
  body: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: Tex7LocalizationGovernanceActor;
  fieldKey?: string;
}

export interface Tex7TranslationReviewHistoryEntry {
  status: Tex7TranslationReviewStatus;
  actor: Tex7LocalizationGovernanceActor;
  occurredAt: string;
  comment?: string;
  decision?: Tex7TranslationReviewDecision;
}

export interface Tex7TranslationReviewState {
  translation: Tex7TranslationIdentity;
  status: Tex7TranslationReviewStatus;
  reviewerAssignment?: Tex7TranslationReviewerAssignment;
  requestedAt?: string;
  startedAt?: string;
  completedAt?: string;
  decision?: Tex7TranslationReviewDecision;
  comments: Tex7TranslationReviewComment[];
  history: Tex7TranslationReviewHistoryEntry[];
}

export interface Tex7TranslationReviewProvider {
  getReviewState(
    translation: Tex7TranslationIdentity,
  ): Promise<Tex7TranslationReviewState>;
  listReviewHistory(
    translation: Tex7TranslationIdentity,
  ): Promise<Tex7TranslationReviewHistoryEntry[]>;
  listReviewComments(
    translation: Tex7TranslationIdentity,
  ): Promise<Tex7TranslationReviewComment[]>;
}