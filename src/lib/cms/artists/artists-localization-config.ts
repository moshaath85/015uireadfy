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

export type ArtistLocalizationSharedField =
  | "id"
  | "relations"
  | "media_ownership"
  | "governance"
  | "permissions"
  | "audit"
  | "certificates"
  | "featured_state"
  | "ordering";

export type ArtistLocalizationLocalizedField =
  | "name"
  | "biography"
  | "summary"
  | "localized_slug"
  | "seo_title"
  | "seo_description"
  | "image_alt_text"
  | "image_caption";

export interface ArtistLocalizedContent extends Tex7LocalizedContentBase {
  title: string;
  slug: string;
  summary?: string;
  content: string;
}

export type ArtistTranslationRecord =
  Tex7TranslationRecord<ArtistLocalizedContent>;

export interface ArtistLocalizationPilotConfig {
  readonly moduleKey: "artists";
  readonly entityType: "artist";
  readonly baseEntityPolicy: Tex7TranslationOwnershipPolicy;
  readonly sharedFields: readonly ArtistLocalizationSharedField[];
  readonly localizedFields: readonly ArtistLocalizationLocalizedField[];
  readonly completeness: Tex7CompletenessConfig<ArtistTranslationRecord>;
  readonly seoPolicy: Tex7LocalizedSeoPolicy;
  readonly mediaMetadataRules: readonly Tex7LocalizedMediaMetadataCompletenessRule[];
  readonly mediaFileOwnership: typeof TEX7_LOCALIZED_MEDIA_OWNERSHIP_POLICY;
}

export const artistLocalizationSharedFields: readonly ArtistLocalizationSharedField[] =
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
  ];

export const artistLocalizationLocalizedFields: readonly ArtistLocalizationLocalizedField[] =
  [
    "name",
    "biography",
    "summary",
    "localized_slug",
    "seo_title",
    "seo_description",
    "image_alt_text",
    "image_caption",
  ];

export const artistLocalizationCompletenessConfig: Tex7CompletenessConfig<ArtistTranslationRecord> =
  {
    publishThresholdPercentage: 100,
    rules: [
      {
        key: "name",
        label: "Artist name",
        category: "title",
        weight: 20,
        requiredForPublishing: true,
        readValue: (translation) => translation.content.title,
      },
      {
        key: "localized_slug",
        label: "Localized slug",
        category: "slug",
        weight: 15,
        requiredForPublishing: true,
        readValue: (translation) => translation.content.slug,
      },
      {
        key: "biography",
        label: "Artist biography",
        category: "content",
        weight: 25,
        requiredForPublishing: true,
        readValue: (translation) => translation.content.content,
      },
      {
        key: "summary",
        label: "Artist summary",
        category: "summary",
        weight: 10,
        requiredForPublishing: true,
        readValue: (translation) => translation.content.summary,
      },
      {
        key: "seo_title",
        label: "SEO title",
        category: "seo",
        weight: 10,
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
        weight: 10,
        requiredForPublishing: true,
        readValue: (translation) =>
          typeof translation.seo === "object" && translation.seo !== null
            ? (translation.seo as { metaDescription?: string }).metaDescription
            : undefined,
      },
      {
        key: "image_alt_text",
        label: "Image alt text",
        category: "alt_text",
        weight: 5,
        requiredForPublishing: true,
        readValue: (translation) =>
          translation.mediaMetadata?.find(
            (metadata) =>
              typeof metadata === "object" &&
              metadata !== null &&
              "altText" in metadata,
          ),
      },
      {
        key: "image_caption",
        label: "Image caption",
        category: "caption",
        weight: 5,
        requiredForPublishing: true,
        readValue: (translation) =>
          translation.mediaMetadata?.find(
            (metadata) =>
              typeof metadata === "object" &&
              metadata !== null &&
              "caption" in metadata,
          ),
      },
    ],
  };

export const artistLocalizationMediaMetadataRules: readonly Tex7LocalizedMediaMetadataCompletenessRule[] =
  [
    {
      key: "alt_text",
      requiredForPublishing: true,
      weight: 5,
    },
    {
      key: "caption",
      requiredForPublishing: true,
      weight: 5,
    },
  ];

export const artistLocalizationPilotConfig: ArtistLocalizationPilotConfig = {
  moduleKey: "artists",
  entityType: "artist",
  baseEntityPolicy: TEX7_TRANSLATION_OWNERSHIP_POLICY,
  sharedFields: artistLocalizationSharedFields,
  localizedFields: artistLocalizationLocalizedFields,
  completeness: artistLocalizationCompletenessConfig,
  seoPolicy: TEX7_DEFAULT_LOCALIZED_SEO_POLICY,
  mediaMetadataRules: artistLocalizationMediaMetadataRules,
  mediaFileOwnership: TEX7_LOCALIZED_MEDIA_OWNERSHIP_POLICY,
};