import type { Tex7CompletenessConfig, Tex7CompletenessResult } from "./localization-completeness";
import type {
  Tex7LocalizedEntityIdentity,
  Tex7LocaleIdentity,
  Tex7TranslationHealthReport,
  Tex7TranslationIdentity,
  Tex7TranslationRecord,
} from "./localization-types";

export interface Tex7TranslationReadQuery {
  entityType?: string;
  entityId?: string;
  localeCode?: string;
  slug?: string;
  includeArchived?: boolean;
}

export interface Tex7TranslationLookupResult<
  TTranslation extends Tex7TranslationRecord = Tex7TranslationRecord,
> {
  found: boolean;
  translation?: TTranslation;
  missingLocaleCode?: string;
  missingEntity?: Tex7LocalizedEntityIdentity;
}

export interface Tex7TranslationCompletenessService<
  TTranslation extends Tex7TranslationRecord = Tex7TranslationRecord,
> {
  calculate(
    translation: TTranslation,
    config: Tex7CompletenessConfig<TTranslation>,
  ): Tex7CompletenessResult;
}

export interface Tex7TranslationProvider<
  TTranslation extends Tex7TranslationRecord = Tex7TranslationRecord,
> {
  listLocales(): Promise<Tex7LocaleIdentity[]>;
  getTranslation(
    identity: Tex7TranslationIdentity,
  ): Promise<Tex7TranslationLookupResult<TTranslation>>;
  listTranslations(
    query: Tex7TranslationReadQuery,
  ): Promise<TTranslation[]>;
  getHealthReport(
    entity: Tex7LocalizedEntityIdentity,
  ): Promise<Tex7TranslationHealthReport>;
}

export interface Tex7TranslationOwnershipPolicy {
  allowDuplicateBaseEntitiesForLocales: false;
  requireSingleBaseEntityIdentity: true;
  requireLocaleScopedTranslationIdentity: true;
}

export const TEX7_TRANSLATION_OWNERSHIP_POLICY: Tex7TranslationOwnershipPolicy =
  {
    allowDuplicateBaseEntitiesForLocales: false,
    requireSingleBaseEntityIdentity: true,
    requireLocaleScopedTranslationIdentity: true,
  };