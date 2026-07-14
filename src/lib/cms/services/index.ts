export { prepareCreateServiceAction, prepareUpdateServiceAction } from "./services-actions";
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

export { servicesCrudConfig, type ServicesCrudEntity } from "./services-crud-config";
export {
  serviceVisibilityOptions,
  servicesFormConfig,
  type ServicesFormEntity,
} from "./services-form-config";
export { servicesTableConfig, type ServicesTableEntity } from "./services-table-config";

export type ServiceLocalizationSharedField =
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

export type ServiceLocalizationLocalizedField =
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

export interface ServiceLocalizedContent extends Tex7LocalizedContentBase {
  title: string;
  slug: string;
  subtitle?: string;
  summary?: string;
  content: string;
  editorialNotes?: string;
}

export type ServiceTranslationRecord =
  Tex7TranslationRecord<ServiceLocalizedContent>;

export interface ServiceLocalizationExpansionConfig {
  readonly moduleKey: "services";
  readonly entityType: "service";
  readonly baseEntityPolicy: Tex7TranslationOwnershipPolicy;
  readonly sharedFields: readonly ServiceLocalizationSharedField[];
  readonly localizedFields: readonly ServiceLocalizationLocalizedField[];
  readonly completeness: Tex7CompletenessConfig<ServiceTranslationRecord>;
  readonly seoPolicy: Tex7LocalizedSeoPolicy;
  readonly mediaMetadataRules: readonly Tex7LocalizedMediaMetadataCompletenessRule[];
  readonly mediaFileOwnership: typeof TEX7_LOCALIZED_MEDIA_OWNERSHIP_POLICY;
}

export const serviceLocalizationSharedFields: readonly ServiceLocalizationSharedField[] =
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

export const serviceLocalizationLocalizedFields: readonly ServiceLocalizationLocalizedField[] =
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

export const serviceLocalizationCompletenessConfig: Tex7CompletenessConfig<ServiceTranslationRecord> =
  {
    publishThresholdPercentage: 100,
    rules: [
      {
        key: "title",
        label: "Service title",
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
        label: "Service body content",
        category: "content",
        weight: 20,
        requiredForPublishing: true,
        readValue: (translation) => translation.content.content,
      },
      {
        key: "summary",
        label: "Service summary",
        category: "summary",
        weight: 12,
        requiredForPublishing: true,
        readValue: (translation) => translation.content.summary,
      },
      {
        key: "subtitle",
        label: "Service subtitle",
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

export const serviceLocalizationMediaMetadataRules: readonly Tex7LocalizedMediaMetadataCompletenessRule[] =
  [
    { key: "caption", requiredForPublishing: true, weight: 3 },
    { key: "alt_text", requiredForPublishing: true, weight: 3 },
  ];

export const serviceLocalizationExpansionConfig: ServiceLocalizationExpansionConfig =
  {
    moduleKey: "services",
    entityType: "service",
    baseEntityPolicy: TEX7_TRANSLATION_OWNERSHIP_POLICY,
    sharedFields: serviceLocalizationSharedFields,
    localizedFields: serviceLocalizationLocalizedFields,
    completeness: serviceLocalizationCompletenessConfig,
    seoPolicy: TEX7_DEFAULT_LOCALIZED_SEO_POLICY,
    mediaMetadataRules: serviceLocalizationMediaMetadataRules,
    mediaFileOwnership: TEX7_LOCALIZED_MEDIA_OWNERSHIP_POLICY,
  };