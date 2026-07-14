export const TEX7_TRANSLATION_LIFECYCLE_STATUSES = [
  "missing",
  "draft",
  "in_review",
  "published",
  "archived",
] as const;

export type Tex7TranslationLifecycleStatus =
  (typeof TEX7_TRANSLATION_LIFECYCLE_STATUSES)[number];

export type Tex7TranslationLifecycleGroup =
  | "unavailable"
  | "editable"
  | "reviewable"
  | "public"
  | "retired";

export interface Tex7TranslationLifecycleState {
  status: Tex7TranslationLifecycleStatus;
  group: Tex7TranslationLifecycleGroup;
  isPublic: boolean;
  isEditable: boolean;
  isReviewable: boolean;
  isTerminal: boolean;
}

export const TEX7_TRANSLATION_LIFECYCLE_STATES: Record<
  Tex7TranslationLifecycleStatus,
  Tex7TranslationLifecycleState
> = {
  missing: {
    status: "missing",
    group: "unavailable",
    isPublic: false,
    isEditable: false,
    isReviewable: false,
    isTerminal: false,
  },
  draft: {
    status: "draft",
    group: "editable",
    isPublic: false,
    isEditable: true,
    isReviewable: false,
    isTerminal: false,
  },
  in_review: {
    status: "in_review",
    group: "reviewable",
    isPublic: false,
    isEditable: true,
    isReviewable: true,
    isTerminal: false,
  },
  published: {
    status: "published",
    group: "public",
    isPublic: true,
    isEditable: true,
    isReviewable: false,
    isTerminal: false,
  },
  archived: {
    status: "archived",
    group: "retired",
    isPublic: false,
    isEditable: false,
    isReviewable: false,
    isTerminal: true,
  },
};

export function isTex7TranslationLifecycleStatus(
  value: string,
): value is Tex7TranslationLifecycleStatus {
  return TEX7_TRANSLATION_LIFECYCLE_STATUSES.includes(
    value as Tex7TranslationLifecycleStatus,
  );
}

export function getTex7TranslationLifecycleState(
  status: Tex7TranslationLifecycleStatus,
): Tex7TranslationLifecycleState {
  return TEX7_TRANSLATION_LIFECYCLE_STATES[status];
}