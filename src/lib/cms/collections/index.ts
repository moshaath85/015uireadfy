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

export { collectionsCrudConfig, type CollectionsCrudEntity } from "./collections-crud-config";
export {
  collectionVisibilityOptions,
  collectionsFormConfig,
  type CollectionsFormEntity,
} from "./collections-form-config";
export { collectionsTableConfig, type CollectionsTableEntity } from "./collections-table-config";
export {
  prepareCreateCollectionAction,
  prepareUpdateCollectionAction,
  type CollectionActionContext,
  type CollectionActionFailure,
  type CollectionActionMode,
  type CollectionActionResult,
  type CollectionActionStatus,
  type CollectionActionSuccess,
} from "./collections-actions";
export {
  createCollectionJsonRecord,
  updateCollectionJsonRecord,
  type CollectionJsonSaveOptions,
} from "./collections-json-adapter";
export {
  createCollectionMutationDisabledResult,
  createCollectionPreparedResult,
  createCollectionValidationErrorResult,
  type CollectionRuntimeContext,
  type CollectionRuntimeFailure,
  type CollectionRuntimeMode,
  type CollectionRuntimeResult,
  type CollectionRuntimeStatus,
  type CollectionRuntimeSuccess,
} from "./collections-runtime";
export {
  validateCollectionFormInput,
  type CollectionValidatedInput,
  type CollectionValidationFailure,
  type CollectionValidationIssue,
  type CollectionValidationResult,
  type CollectionValidationSource,
  type CollectionValidationSuccess,
} from "./collections-validation";

export type CollectionLocalizationSharedField =
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

export type CollectionLocalizationLocalizedField =
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

export interface CollectionLocalizedContent extends Tex7LocalizedContentBase {
  title: string;
  slug: string;
  subtitle?: string;
  summary?: string;
  content: string;
  editorialNotes?: string;
}

export type CollectionTranslationRecord =
  Tex7TranslationRecord<CollectionLocalizedContent>;

export interface CollectionLocalizationExpansionConfig {
  readonly moduleKey: "collections";
  readonly entityType: "collection";
  readonly baseEntityPolicy: Tex7TranslationOwnershipPolicy;
  readonly sharedFields: readonly CollectionLocalizationSharedField[];
  readonly localizedFields: readonly CollectionLocalizationLocalizedField[];
  readonly completeness: Tex7CompletenessConfig<CollectionTranslationRecord>;
  readonly seoPolicy: Tex7LocalizedSeoPolicy;
  readonly mediaMetadataRules: readonly Tex7LocalizedMediaMetadataCompletenessRule[];
  readonly mediaFileOwnership: typeof TEX7_LOCALIZED_MEDIA_OWNERSHIP_POLICY;
}

export const collectionLocalizationSharedFields: readonly CollectionLocalizationSharedField[] =
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

export const collectionLocalizationLocalizedFields: readonly CollectionLocalizationLocalizedField[] =
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

export const collectionLocalizationCompletenessConfig: Tex7CompletenessConfig<CollectionTranslationRecord> =
  {
    publishThresholdPercentage: 100,
    rules: [
      {
        key: "title",
        label: "Collection title",
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
        label: "Collection description",
        category: "content",
        weight: 20,
        requiredForPublishing: true,
        readValue: (translation) => translation.content.content,
      },
      {
        key: "summary",
        label: "Collection summary",
        category: "summary",
        weight: 12,
        requiredForPublishing: true,
        readValue: (translation) => translation.content.summary,
      },
      {
        key: "subtitle",
        label: "Collection subtitle",
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

export const collectionLocalizationMediaMetadataRules: readonly Tex7LocalizedMediaMetadataCompletenessRule[] =
  [
    { key: "caption", requiredForPublishing: true, weight: 3 },
    { key: "alt_text", requiredForPublishing: true, weight: 3 },
  ];

export const collectionLocalizationExpansionConfig: CollectionLocalizationExpansionConfig =
  {
    moduleKey: "collections",
    entityType: "collection",
    baseEntityPolicy: TEX7_TRANSLATION_OWNERSHIP_POLICY,
    sharedFields: collectionLocalizationSharedFields,
    localizedFields: collectionLocalizationLocalizedFields,
    completeness: collectionLocalizationCompletenessConfig,
    seoPolicy: TEX7_DEFAULT_LOCALIZED_SEO_POLICY,
    mediaMetadataRules: collectionLocalizationMediaMetadataRules,
    mediaFileOwnership: TEX7_LOCALIZED_MEDIA_OWNERSHIP_POLICY,
  };