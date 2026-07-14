import type { Tex7TranslationLifecycleStatus } from "./localization-status";

export type Tex7CompletenessFieldCategory =
  | "title"
  | "slug"
  | "summary"
  | "content"
  | "seo"
  | "media_metadata"
  | "alt_text"
  | "caption"
  | "relationship"
  | "custom";

export type Tex7CompletenessValueReader<TTranslation> = (
  translation: TTranslation,
) => unknown;

export interface Tex7CompletenessRule<TTranslation = unknown> {
  key: string;
  label: string;
  category: Tex7CompletenessFieldCategory;
  weight: number;
  requiredForPublishing: boolean;
  readValue: Tex7CompletenessValueReader<TTranslation>;
}

export interface Tex7CompletenessConfig<TTranslation = unknown> {
  rules: Tex7CompletenessRule<TTranslation>[];
  publishThresholdPercentage: number;
}

export interface Tex7CompletenessRuleResult {
  key: string;
  label: string;
  category: Tex7CompletenessFieldCategory;
  weight: number;
  isComplete: boolean;
  isRequiredForPublishing: boolean;
}

export interface Tex7CompletenessResult {
  percentage: number;
  completedWeight: number;
  totalWeight: number;
  missingFields: string[];
  missingRequiredFields: string[];
  ruleResults: Tex7CompletenessRuleResult[];
  isPublishReady: boolean;
  publishBlockingReason?: string;
}

function hasCompletenessValue(value: unknown): boolean {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (value && typeof value === "object") {
    return Object.values(value).some(hasCompletenessValue);
  }

  return value !== null && value !== undefined;
}

export function calculateTex7TranslationCompleteness<TTranslation>(
  translation: TTranslation,
  config: Tex7CompletenessConfig<TTranslation>,
): Tex7CompletenessResult {
  const totalWeight = config.rules.reduce((sum, rule) => sum + rule.weight, 0);

  const ruleResults = config.rules.map((rule) => {
    const isComplete = hasCompletenessValue(rule.readValue(translation));

    return {
      key: rule.key,
      label: rule.label,
      category: rule.category,
      weight: rule.weight,
      isComplete,
      isRequiredForPublishing: rule.requiredForPublishing,
    } satisfies Tex7CompletenessRuleResult;
  });

  const completedWeight = ruleResults
    .filter((result) => result.isComplete)
    .reduce((sum, result) => sum + result.weight, 0);

  const percentage =
    totalWeight === 0 ? 100 : Math.round((completedWeight / totalWeight) * 100);

  const missingFields = ruleResults
    .filter((result) => !result.isComplete)
    .map((result) => result.key);

  const missingRequiredFields = ruleResults
    .filter((result) => !result.isComplete && result.isRequiredForPublishing)
    .map((result) => result.key);

  const reachesPublishThreshold =
    percentage >= config.publishThresholdPercentage;
  const hasRequiredFields = missingRequiredFields.length === 0;
  const isPublishReady = reachesPublishThreshold && hasRequiredFields;

  return {
    percentage,
    completedWeight,
    totalWeight,
    missingFields,
    missingRequiredFields,
    ruleResults,
    isPublishReady,
    publishBlockingReason: isPublishReady
      ? undefined
      : !hasRequiredFields
        ? "missing_required_fields"
        : "below_publish_threshold",
  };
}

export function canTex7TranslationEnterPublishedState(
  status: Tex7TranslationLifecycleStatus,
  completeness: Tex7CompletenessResult,
): boolean {
  return (
    status !== "missing" &&
    status !== "archived" &&
    completeness.isPublishReady
  );
}