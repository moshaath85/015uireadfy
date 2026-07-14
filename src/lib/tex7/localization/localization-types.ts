import type { Tex7TranslationLifecycleStatus } from "./localization-status";

export type Tex7LocaleDirection = "ltr" | "rtl";

export type Tex7LocaleFallbackMode =
  | "none"
  | "default_locale"
  | "configured_locale";

export interface Tex7LocaleFallbackPolicy {
  mode: Tex7LocaleFallbackMode;
  fallbackLocaleCode?: string;
  allowPublicFallback: boolean;
}

export interface Tex7LocaleIdentity {
  code: string;
  language: string;
  direction: Tex7LocaleDirection;
  enabled: boolean;
  isDefault: boolean;
  fallbackPolicy: Tex7LocaleFallbackPolicy;
}

export interface Tex7LocalizedEntityIdentity {
  entityType: string;
  entityId: string;
}

export interface Tex7TranslationIdentity extends Tex7LocalizedEntityIdentity {
  localeCode: string;
  translationId?: string;
}

export interface Tex7TranslationLifecycleSnapshot {
  status: Tex7TranslationLifecycleStatus;
  statusChangedAt?: string;
  statusChangedBy?: string;
}

export interface Tex7TranslationOwnership {
  baseEntity: Tex7LocalizedEntityIdentity;
  translations: Tex7TranslationIdentity[];
}

export interface Tex7LocalizedContentBase {
  title?: string;
  slug?: string;
  summary?: string;
  content?: string;
}

export interface Tex7LocalizedStructuredTextFields {
  [fieldName: string]: string | undefined;
}

export interface Tex7TranslationRecord<
  TContent extends Tex7LocalizedContentBase = Tex7LocalizedContentBase,
> extends Tex7TranslationIdentity {
  content: TContent;
  lifecycle: Tex7TranslationLifecycleSnapshot;
  seo?: unknown;
  mediaMetadata?: unknown[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface Tex7TranslationHealthLocaleSnapshot {
  localeCode: string;
  status: Tex7TranslationLifecycleStatus;
  completenessPercentage: number;
  missingRequiredFields: string[];
  isPublishReady: boolean;
}

export interface Tex7TranslationHealthReport {
  entity: Tex7LocalizedEntityIdentity;
  completenessByLocale: Tex7TranslationHealthLocaleSnapshot[];
  missingTranslations: string[];
  awaitingReview: string[];
  readyToPublish: string[];
}