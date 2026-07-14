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

export { newsCrudConfig, type NewsCrudEntity } from "./news-crud-config";
export {
  newsCategoryOptions,
  newsFormConfig,
  newsVisibilityOptions,
  type NewsFormEntity,
} from "./news-form-config";
export { newsTableConfig, type NewsTableEntity } from "./news-table-config";

export type NewsLocalizationSharedField =
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

export type NewsLocalizationLocalizedField =
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

export interface NewsLocalizedContent extends Tex7LocalizedContentBase {
  title: string;
  slug: string;
  subtitle?: string;
  summary?: string;
  content: string;
  editorialNotes?: string;
}

export type NewsTranslationRecord =
  Tex7TranslationRecord<NewsLocalizedContent>;

export interface NewsLocalizationExpansionConfig {
  readonly moduleKey: "news";
  readonly entityType: "news";
  readonly baseEntityPolicy: Tex7TranslationOwnershipPolicy;
  readonly sharedFields: readonly NewsLocalizationSharedField[];
  readonly localizedFields: readonly NewsLocalizationLocalizedField[];
  readonly completeness: Tex7CompletenessConfig<NewsTranslationRecord>;
  readonly seoPolicy: Tex7LocalizedSeoPolicy;
  readonly mediaMetadataRules: readonly Tex7LocalizedMediaMetadataCompletenessRule[];
  readonly mediaFileOwnership: typeof TEX7_LOCALIZED_MEDIA_OWNERSHIP_POLICY;
}

export const newsLocalizationSharedFields: readonly NewsLocalizationSharedField[] =
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

export const newsLocalizationLocalizedFields: readonly NewsLocalizationLocalizedField[] =
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

export const newsLocalizationCompletenessConfig: Tex7CompletenessConfig<NewsTranslationRecord> =
  {
    publishThresholdPercentage: 100,
    rules: [
      {
        key: "title",
        label: "News title",
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
        key: "body_content",
        label: "News body content",
        category: "content",
        weight: 20,
        requiredForPublishing: true,
        readValue: (translation) => translation.content.content,
      },
      {
        key: "summary",
        label: "News summary",
        category: "summary",
        weight: 12,
        requiredForPublishing: true,
        readValue: (translation) => translation.content.summary,
      },
      {
        key: "subtitle",
        label: "News subtitle",
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

export const newsLocalizationMediaMetadataRules: readonly Tex7LocalizedMediaMetadataCompletenessRule[] =
  [
    { key: "caption", requiredForPublishing: true, weight: 3 },
    { key: "alt_text", requiredForPublishing: true, weight: 3 },
  ];

export const newsLocalizationExpansionConfig: NewsLocalizationExpansionConfig =
  {
    moduleKey: "news",
    entityType: "news",
    baseEntityPolicy: TEX7_TRANSLATION_OWNERSHIP_POLICY,
    sharedFields: newsLocalizationSharedFields,
    localizedFields: newsLocalizationLocalizedFields,
    completeness: newsLocalizationCompletenessConfig,
    seoPolicy: TEX7_DEFAULT_LOCALIZED_SEO_POLICY,
    mediaMetadataRules: newsLocalizationMediaMetadataRules,
    mediaFileOwnership: TEX7_LOCALIZED_MEDIA_OWNERSHIP_POLICY,
  };