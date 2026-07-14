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
  prepareCreateProjectAction,
  prepareUpdateProjectAction,
  type ProjectActionContext,
  type ProjectActionFailure,
  type ProjectActionMode,
  type ProjectActionResult,
  type ProjectActionStatus,
  type ProjectActionSuccess,
} from "./projects-actions";
export { projectsCrudConfig, type ProjectsCrudEntity } from "./projects-crud-config";
export {
  projectStatusOptions,
  projectTypeOptions,
  projectVisibilityOptions,
  projectsFormConfig,
  type ProjectsFormEntity,
} from "./projects-form-config";
export {
  createProjectJsonRecord,
  updateProjectJsonRecord,
  type ProjectJsonRecord,
  type ProjectJsonSaveOptions,
} from "./projects-json-adapter";
export {
  createProjectMutationDisabledResult,
  createProjectPreparedResult,
  createProjectValidationErrorResult,
  type ProjectRuntimeContext,
  type ProjectRuntimeFailure,
  type ProjectRuntimeMode,
  type ProjectRuntimeResult,
  type ProjectRuntimeStatus,
  type ProjectRuntimeSuccess,
} from "./projects-runtime";
export { projectsTableConfig, type ProjectsTableEntity } from "./projects-table-config";
export {
  validateProjectFormInput,
  type ProjectValidatedInput,
  type ProjectValidationFailure,
  type ProjectValidationIssue,
  type ProjectValidationResult,
  type ProjectValidationSource,
  type ProjectValidationSuccess,
} from "./projects-validation";

export type ProjectLocalizationSharedField =
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

export type ProjectLocalizationLocalizedField =
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

export interface ProjectLocalizedContent extends Tex7LocalizedContentBase {
  title: string;
  slug: string;
  subtitle?: string;
  summary?: string;
  content: string;
  editorialNotes?: string;
}

export type ProjectTranslationRecord =
  Tex7TranslationRecord<ProjectLocalizedContent>;

export interface ProjectLocalizationExpansionConfig {
  readonly moduleKey: "projects";
  readonly entityType: "project";
  readonly baseEntityPolicy: Tex7TranslationOwnershipPolicy;
  readonly sharedFields: readonly ProjectLocalizationSharedField[];
  readonly localizedFields: readonly ProjectLocalizationLocalizedField[];
  readonly completeness: Tex7CompletenessConfig<ProjectTranslationRecord>;
  readonly seoPolicy: Tex7LocalizedSeoPolicy;
  readonly mediaMetadataRules: readonly Tex7LocalizedMediaMetadataCompletenessRule[];
  readonly mediaFileOwnership: typeof TEX7_LOCALIZED_MEDIA_OWNERSHIP_POLICY;
}

export const projectLocalizationSharedFields: readonly ProjectLocalizationSharedField[] =
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

export const projectLocalizationLocalizedFields: readonly ProjectLocalizationLocalizedField[] =
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

export const projectLocalizationCompletenessConfig: Tex7CompletenessConfig<ProjectTranslationRecord> =
  {
    publishThresholdPercentage: 100,
    rules: [
      {
        key: "title",
        label: "Project title",
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
        label: "Project description",
        category: "content",
        weight: 20,
        requiredForPublishing: true,
        readValue: (translation) => translation.content.content,
      },
      {
        key: "summary",
        label: "Project summary",
        category: "summary",
        weight: 12,
        requiredForPublishing: true,
        readValue: (translation) => translation.content.summary,
      },
      {
        key: "subtitle",
        label: "Project subtitle",
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

export const projectLocalizationMediaMetadataRules: readonly Tex7LocalizedMediaMetadataCompletenessRule[] =
  [
    { key: "caption", requiredForPublishing: true, weight: 3 },
    { key: "alt_text", requiredForPublishing: true, weight: 3 },
  ];

export const projectLocalizationExpansionConfig: ProjectLocalizationExpansionConfig =
  {
    moduleKey: "projects",
    entityType: "project",
    baseEntityPolicy: TEX7_TRANSLATION_OWNERSHIP_POLICY,
    sharedFields: projectLocalizationSharedFields,
    localizedFields: projectLocalizationLocalizedFields,
    completeness: projectLocalizationCompletenessConfig,
    seoPolicy: TEX7_DEFAULT_LOCALIZED_SEO_POLICY,
    mediaMetadataRules: projectLocalizationMediaMetadataRules,
    mediaFileOwnership: TEX7_LOCALIZED_MEDIA_OWNERSHIP_POLICY,
  };