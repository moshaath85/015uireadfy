import {
  TEX7_DEFAULT_LOCALIZED_SEO_POLICY,
  TEX7_LOCALIZED_MEDIA_OWNERSHIP_POLICY,
  TEX7_TRANSLATION_OWNERSHIP_POLICY,
  type Tex7CompletenessConfig,
  type Tex7LocalizedContentBase,
  type Tex7LocalizedMediaMetadataCompletenessRule,
  type Tex7LocalizedSeoPolicy,
  type Tex7TranslationOwnershipPolicy,
  type Tex7TranslationRecord,
} from "@/lib/tex7/localization";

export {
  prepareCreateExhibitionAction,
  prepareUpdateExhibitionAction,
  type ExhibitionActionContext,
  type ExhibitionActionFailure,
  type ExhibitionActionMode,
  type ExhibitionActionResult,
  type ExhibitionActionStatus,
  type ExhibitionActionSuccess,
} from "./exhibitions-actions";
export { exhibitionsCrudConfig, type ExhibitionsCrudEntity } from "./exhibitions-crud-config";
export {
  exhibitionVisibilityOptions,
  exhibitionsFormConfig,
  type ExhibitionsFormEntity,
} from "./exhibitions-form-config";
export {
  createExhibitionJsonRecord,
  updateExhibitionJsonRecord,
  type ExhibitionJsonSaveOptions,
} from "./exhibitions-json-adapter";
export {
  createExhibitionMutationDisabledResult,
  createExhibitionPreparedResult,
  createExhibitionValidationErrorResult,
  type ExhibitionRuntimeContext,
  type ExhibitionRuntimeFailure,
  type ExhibitionRuntimeMode,
  type ExhibitionRuntimeResult,
  type ExhibitionRuntimeStatus,
  type ExhibitionRuntimeSuccess,
} from "./exhibitions-runtime";
export { exhibitionsTableConfig, type ExhibitionsTableEntity } from "./exhibitions-table-config";
export {
  validateExhibitionFormInput,
  type ExhibitionValidatedInput,
  type ExhibitionValidationFailure,
  type ExhibitionValidationIssue,
  type ExhibitionValidationResult,
  type ExhibitionValidationSource,
  type ExhibitionValidationSuccess,
} from "./exhibitions-validation";

export type ExhibitionLocalizationSharedField =
  | "id"
  | "relations"
  | "media_ownership"
  | "governance"
  | "permissions"
  | "audit"
  | "certificates"
  | "featured_state"
  | "ordering"
  | "publication_status"
  | "availability"
  | "structural_metadata";

export type ExhibitionLocalizationLocalizedField =
  | "title"
  | "subtitle"
  | "summary"
  | "description"
  | "body_content"
  | "editorial_notes"
  | "localized_slug"
  | "seo_title"
  | "seo_description"
  | "image_caption"
  | "image_alt_text";

export interface ExhibitionLocalizedContent extends Tex7LocalizedContentBase {
  title: string;
  slug: string;
  subtitle?: string;
  summary?: string;
  content: string;
  editorialNotes?: string;
}

export type ExhibitionTranslationRecord =
  Tex7TranslationRecord<ExhibitionLocalizedContent>;

export interface ExhibitionLocalizationExpansionConfig {
  readonly moduleKey: "exhibitions";
  readonly entityType: "exhibition";
  readonly baseEntityPolicy: Tex7TranslationOwnershipPolicy;
  readonly sharedFields: readonly ExhibitionLocalizationSharedField[];
  readonly localizedFields: readonly ExhibitionLocalizationLocalizedField[];
  readonly completeness: Tex7CompletenessConfig<ExhibitionTranslationRecord>;
  readonly seoPolicy: Tex7LocalizedSeoPolicy;
  readonly mediaMetadataRules: readonly Tex7LocalizedMediaMetadataCompletenessRule[];
  readonly mediaFileOwnership: typeof TEX7_LOCALIZED_MEDIA_OWNERSHIP_POLICY;
}

export const exhibitionLocalizationSharedFields: readonly ExhibitionLocalizationSharedField[] =
  [
    "id",
    "relations",
    "media_ownership",
    "governance",
    "permissions",
    "audit",
    "certificates",
    "featured_state",
    "ordering",
    "publication_status",
    "availability",
    "structural_metadata",
  ];

export const exhibitionLocalizationLocalizedFields: readonly ExhibitionLocalizationLocalizedField[] =
  [
    "title",
    "subtitle",
    "summary",
    "description",
    "body_content",
    "editorial_notes",
    "localized_slug",
    "seo_title",
    "seo_description",
    "image_caption",
    "image_alt_text",
  ];

export const exhibitionLocalizationCompletenessConfig: Tex7CompletenessConfig<ExhibitionTranslationRecord> =
  {
    publishThresholdPercentage: 100,
    rules: [
      {
        key: "title",
        label: "Exhibition title",
        category: "title",
        weight: 18,
        requiredForPublishing: true,
        readValue: (translation) => translation.content.title,
      },
      {
        key: "localized_slug",
        label: "Localized slug",
        category: "slug",
        weight: 12,
        requiredForPublishing: true,
        readValue: (translation) => translation.content.slug,
      },
      {
        key: "description",
        label: "Exhibition description",
        category: "content",
        weight: 20,
        requiredForPublishing: true,
        readValue: (translation) => translation.content.content,
      },
      {
        key: "summary",
        label: "Exhibition summary",
        category: "summary",
        weight: 12,
        requiredForPublishing: true,
        readValue: (translation) => translation.content.summary,
      },
      {
        key: "subtitle",
        label: "Exhibition subtitle",
        category: "summary",
        weight: 8,
        requiredForPublishing: false,
        readValue: (translation) => translation.content.subtitle,
      },
      {
        key: "editorial_notes",
        label: "Editorial notes",
        category: "content",
        weight: 8,
        requiredForPublishing: false,
        readValue: (translation) => translation.content.editorialNotes,
      },
      {
        key: "seo_title",
        label: "SEO title",
        category: "seo",
        weight: 8,
        requiredForPublishing: true,
        readValue: (translation) =>
          typeof translation.seo === "object" && translation.seo !== null
            ? (translation.seo as { title?: string }).title
            : undefined,
      },
      {
        key: "seo_description",
        label: "SEO description",
        category: "seo",
        weight: 8,
        requiredForPublishing: true,
        readValue: (translation) =>
          typeof translation.seo === "object" && translation.seo !== null
            ? (translation.seo as { metaDescription?: string }).metaDescription
            : undefined,
      },
      {
        key: "image_caption",
        label: "Image caption",
        category: "caption",
        weight: 3,
        requiredForPublishing: true,
        readValue: (translation) =>
          translation.mediaMetadata?.find(
            (metadata) =>
              typeof metadata === "object" &&
              metadata !== null &&
              "caption" in metadata,
          ),
      },
      {
        key: "image_alt_text",
        label: "Image alt text",
        category: "alt_text",
        weight: 3,
        requiredForPublishing: true,
        readValue: (translation) =>
          translation.mediaMetadata?.find(
            (metadata) =>
              typeof metadata === "object" &&
              metadata !== null &&
              "altText" in metadata,
          ),
      },
    ],
  };

export const exhibitionLocalizationMediaMetadataRules: readonly Tex7LocalizedMediaMetadataCompletenessRule[] =
  [
    { key: "caption", requiredForPublishing: true, weight: 3 },
    { key: "alt_text", requiredForPublishing: true, weight: 3 },
  ];

export const exhibitionLocalizationExpansionConfig: ExhibitionLocalizationExpansionConfig =
  {
    moduleKey: "exhibitions",
    entityType: "exhibition",
    baseEntityPolicy: TEX7_TRANSLATION_OWNERSHIP_POLICY,
    sharedFields: exhibitionLocalizationSharedFields,
    localizedFields: exhibitionLocalizationLocalizedFields,
    completeness: exhibitionLocalizationCompletenessConfig,
    seoPolicy: TEX7_DEFAULT_LOCALIZED_SEO_POLICY,
    mediaMetadataRules: exhibitionLocalizationMediaMetadataRules,
    mediaFileOwnership: TEX7_LOCALIZED_MEDIA_OWNERSHIP_POLICY,
  };