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

export { artworksCrudConfig, type ArtworksCrudEntity } from "./artworks-crud-config";
export {
  artworksRuntime,
  listArtworksRuntime,
  readArtworkRuntime,
  validateCreateArtworkRuntime,
  validateUpdateArtworkRuntime,
  type ArtworkFormSource,
  type ArtworkMutationInput,
  type ArtworkRuntimeListResult,
  type ArtworkRuntimeReadResult,
  type ArtworkRuntimeUpdateInput,
  type ArtworkRuntimeValidationResult,
  type ArtworkValidationIssue,
} from "./artworks-runtime";
export {
  artworkAvailabilityStatusOptions,
  artworkPriceStatusOptions,
  artworkVisibilityOptions,
  artworksFormConfig,
  type ArtworksFormEntity,
} from "./artworks-form-config";
export { artworksTableConfig, type ArtworksTableEntity } from "./artworks-table-config";
export {
  prepareCreateArtworkAction,
  prepareUpdateArtworkAction,
  type ArtworkActionContext,
  type ArtworkActionFailure,
  type ArtworkActionMode,
  type ArtworkActionResult,
  type ArtworkActionStatus,
  type ArtworkActionSuccess,
} from "./artworks-actions";
export {
  validateArtworkFormInput,
  type ArtworkFormValidationFailure,
  type ArtworkFormValidationIssue,
  type ArtworkFormValidationResult,
  type ArtworkFormValidationSuccess,
  type ArtworkValidatedInput,
  type ArtworkValidationSource,
} from "./artworks-validation";
export {
  createArtworkJsonRecord,
  updateArtworkJsonRecord,
  type ArtworkJsonSaveOptions,
} from "./artworks-json-adapter";

export type ArtworkLocalizationSharedField =
  | "id"
  | "artist_relationship"
  | "collection_relationship"
  | "media_ownership"
  | "dimensions"
  | "medium"
  | "year"
  | "certificates"
  | "permissions"
  | "governance"
  | "audit"
  | "ordering"
  | "featured"
  | "availability"
  | "publication_status";

export type ArtworkLocalizationLocalizedField =
  | "title"
  | "subtitle"
  | "summary"
  | "description"
  | "curatorial_text"
  | "provenance_text"
  | "localized_slug"
  | "seo_title"
  | "seo_description"
  | "image_caption"
  | "image_alt_text";

export interface ArtworkLocalizedContent extends Tex7LocalizedContentBase {
  title: string;
  slug: string;
  subtitle?: string;
  summary?: string;
  content: string;
  curatorialText?: string;
  provenanceText?: string;
}

export type ArtworkTranslationRecord =
  Tex7TranslationRecord<ArtworkLocalizedContent>;

export interface ArtworkLocalizationPilotConfig {
  readonly moduleKey: "artworks";
  readonly entityType: "artwork";
  readonly baseEntityPolicy: Tex7TranslationOwnershipPolicy;
  readonly sharedFields: readonly ArtworkLocalizationSharedField[];
  readonly localizedFields: readonly ArtworkLocalizationLocalizedField[];
  readonly completeness: Tex7CompletenessConfig<ArtworkTranslationRecord>;
  readonly seoPolicy: Tex7LocalizedSeoPolicy;
  readonly mediaMetadataRules: readonly Tex7LocalizedMediaMetadataCompletenessRule[];
  readonly mediaFileOwnership: typeof TEX7_LOCALIZED_MEDIA_OWNERSHIP_POLICY;
}

export const artworkLocalizationSharedFields: readonly ArtworkLocalizationSharedField[] =
  [
    "id",
    "artist_relationship",
    "collection_relationship",
    "media_ownership",
    "dimensions",
    "medium",
    "year",
    "certificates",
    "permissions",
    "governance",
    "audit",
    "ordering",
    "featured",
    "availability",
    "publication_status",
  ];

export const artworkLocalizationLocalizedFields: readonly ArtworkLocalizationLocalizedField[] =
  [
    "title",
    "subtitle",
    "summary",
    "description",
    "curatorial_text",
    "provenance_text",
    "localized_slug",
    "seo_title",
    "seo_description",
    "image_caption",
    "image_alt_text",
  ];

export const artworkLocalizationCompletenessConfig: Tex7CompletenessConfig<ArtworkTranslationRecord> =
  {
    publishThresholdPercentage: 100,
    rules: [
      {
        key: "title",
        label: "Artwork title",
        category: "title",
        weight: 16,
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
        label: "Artwork description",
        category: "content",
        weight: 18,
        requiredForPublishing: true,
        readValue: (translation) => translation.content.content,
      },
      {
        key: "summary",
        label: "Artwork summary",
        category: "summary",
        weight: 10,
        requiredForPublishing: true,
        readValue: (translation) => translation.content.summary,
      },
      {
        key: "subtitle",
        label: "Artwork subtitle",
        category: "summary",
        weight: 8,
        requiredForPublishing: false,
        readValue: (translation) => translation.content.subtitle,
      },
      {
        key: "curatorial_text",
        label: "Curatorial text",
        category: "content",
        weight: 10,
        requiredForPublishing: false,
        readValue: (translation) => translation.content.curatorialText,
      },
      {
        key: "provenance_text",
        label: "Provenance text",
        category: "content",
        weight: 8,
        requiredForPublishing: false,
        readValue: (translation) => translation.content.provenanceText,
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
        weight: 6,
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
        weight: 2,
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
        weight: 2,
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

export const artworkLocalizationMediaMetadataRules: readonly Tex7LocalizedMediaMetadataCompletenessRule[] =
  [
    {
      key: "caption",
      requiredForPublishing: true,
      weight: 2,
    },
    {
      key: "alt_text",
      requiredForPublishing: true,
      weight: 2,
    },
  ];

export const artworkLocalizationPilotConfig: ArtworkLocalizationPilotConfig = {
  moduleKey: "artworks",
  entityType: "artwork",
  baseEntityPolicy: TEX7_TRANSLATION_OWNERSHIP_POLICY,
  sharedFields: artworkLocalizationSharedFields,
  localizedFields: artworkLocalizationLocalizedFields,
  completeness: artworkLocalizationCompletenessConfig,
  seoPolicy: TEX7_DEFAULT_LOCALIZED_SEO_POLICY,
  mediaMetadataRules: artworkLocalizationMediaMetadataRules,
  mediaFileOwnership: TEX7_LOCALIZED_MEDIA_OWNERSHIP_POLICY,
};