import type { Tex7TranslationLifecycleStatus } from "./localization-status";
import type { Tex7TranslationIdentity } from "./localization-types";
import type { Tex7LocalizationGovernanceActor } from "./localization-governance";

export type Tex7LocalizationPermissionAction =
  | "read"
  | "edit"
  | "review"
  | "approve"
  | "publish"
  | "archive"
  | "restore"
  | "lock"
  | "unlock";

export interface Tex7LocalizationPermissionPrincipal {
  principalId: string;
  principalType: string;
  roleRefs?: string[];
  groupRefs?: string[];
  providerRef?: string;
}

export interface Tex7LocalizationPermissionContext {
  translation: Tex7TranslationIdentity;
  action: Tex7LocalizationPermissionAction;
  principal: Tex7LocalizationPermissionPrincipal;
  lifecycleStatus?: Tex7TranslationLifecycleStatus;
  assignedGovernanceActors?: Tex7LocalizationGovernanceActor[];
  isLocked?: boolean;
  lockOwnerId?: string;
}

export interface Tex7LocalizationPermissionRule {
  action: Tex7LocalizationPermissionAction;
  allowedPrincipalTypes?: string[];
  allowedRoleRefs?: string[];
  requireOwnershipAssignment?: boolean;
  requireReviewerAssignment?: boolean;
  requireApproverAssignment?: boolean;
  requirePublisherAssignment?: boolean;
  allowWhenLockedBySelf?: boolean;
  allowWhenLockedByOther?: boolean;
}

export interface Tex7LocalizationPermissionPolicy {
  policyId: string;
  rules: Tex7LocalizationPermissionRule[];
  authenticationProviderAgnostic: true;
}

export type Tex7LocalizationPermissionDecisionStatus = "allow" | "deny";

export interface Tex7LocalizationPermissionDecision {
  status: Tex7LocalizationPermissionDecisionStatus;
  action: Tex7LocalizationPermissionAction;
  principal: Tex7LocalizationPermissionPrincipal;
  translation: Tex7TranslationIdentity;
  matchedRule?: Tex7LocalizationPermissionRule;
  reasons: string[];
}

export interface Tex7LocalizationPermissionEvaluator {
  canPerform(
    context: Tex7LocalizationPermissionContext,
    policy: Tex7LocalizationPermissionPolicy,
  ): Promise<Tex7LocalizationPermissionDecision>;
}