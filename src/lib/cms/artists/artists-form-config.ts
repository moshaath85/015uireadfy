import type { FormModuleConfiguration, FormOption } from "@/lib/forms";
import { VisibilityStatus, type Artist } from "@/types";

export type ArtistsFormEntity = Artist & Record<string, unknown>;

export const artistVisibilityOptions: readonly FormOption[] = [
  {
    label: "Public",
    value: VisibilityStatus.Public,
    description: "Visible on the public website.",
  },
  {
    label: "Private",
    value: VisibilityStatus.Private,
    description: "Only visible inside the CMS.",
  },
  {
    label: "VIP",
    value: VisibilityStatus.Vip,
    description: "Reserved for selected audiences.",
  },
  {
    label: "Hidden",
    value: VisibilityStatus.Hidden,
    description: "Hidden from public lists and pages.",
  },
];

export const artistRepresentationStatusOptions: readonly FormOption[] = [
  {
    label: "Represented",
    value: "represented",
    description: "Gallery 015 represents this artist.",
  },
  {
    label: "Collaborating",
    value: "collaborating",
    description: "This artist is connected through a collaboration or project.",
  },
  {
    label: "Archived",
    value: "archived",
    description: "Keep this artist as an archive record.",
  },
];

const artistSharedBasicFields = [
  {
    key: "profile_image_id",
    label: "Profile Image",
    type: "image",
    description: "Upload, replace, remove, or select the Media record used as this artist profile image.",
  },
  {
    key: "birth_year",
    label: "Birth Year",
    type: "number",
    description: "Optional year of birth shown on artist pages.",
  },
] as const;

const artistSharedContactFields = [
  {
    key: "website",
    label: "Website",
    type: "url",
    placeholder: "https://example.com",
    description: "Artist website, if available.",
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    placeholder: "artist@example.com",
    description: "Contact email for internal reference.",
  },
  {
    key: "instagram",
    label: "Instagram",
    type: "text",
    placeholder: "@artist",
    description: "Artist Instagram handle.",
  },
] as const;

const artistSharedPublishingFields = [
  {
    key: "representation_status",
    label: "Representation Status",
    type: "status",
    required: true,
    options: artistRepresentationStatusOptions,
    description: "How Gallery 015 works with this artist.",
  },
  {
    key: "visibility_status",
    label: "Visibility",
    type: "visibility",
    required: true,
    options: artistVisibilityOptions,
    description: "Where this artist can be seen.",
  },
  {
    key: "featured",
    label: "Featured",
    type: "boolean",
    defaultValue: false,
    description: "Highlight this artist in featured areas.",
  },
] as const;

const artistSharedAdvancedFields = [
  {
    key: "slug",
    label: "Page Slug",
    type: "text",
    required: true,
    placeholder: "artist-url-slug",
    description: "Generated from the artist name. Edit only when the public URL needs a specific value.",
  },
  {
    key: "display_order",
    label: "Display Order",
    type: "number",
    required: true,
    defaultValue: 0,
    description: "Optional ordering number for CMS lists.",
  },
] as const;

const artistArabicTranslationFields = [
  {
    key: "name_ar",
    label: "Name",
    type: "text",
    required: true,
    placeholder: "Artist name in Arabic",
  },
  {
    key: "bio_ar",
    label: "Biography",
    type: "textarea",
    required: true,
  },
  {
    key: "nationality_ar",
    label: "Nationality",
    type: "text",
    required: true,
  },
] as const;

const artistEnglishTranslationFields = [
  {
    key: "name_en",
    label: "Name",
    type: "text",
    required: true,
    placeholder: "Artist name in English",
  },
  {
    key: "bio_en",
    label: "Biography",
    type: "textarea",
    required: true,
  },
  {
    key: "nationality_en",
    label: "Nationality",
    type: "text",
    required: true,
  },
] as const;

const artistSharedFields = [
  ...artistSharedBasicFields,
  ...artistSharedContactFields,
  ...artistSharedPublishingFields,
  ...artistSharedAdvancedFields,
] as const;

export const artistsFormConfig: FormModuleConfiguration<ArtistsFormEntity> = {
  moduleKey: "artists",
  entityLabel: "Artist",
  createForm: {
    formKey: "artists-create",
    moduleKey: "artists",
    title: "Create Artist",
    description: "Add one artist record and manage Arabic and English content together.",
    mode: "create",
    submitLabel: "Create Artist",
    cancelLabel: "Cancel",
    fields: [
      ...artistSharedFields,
      ...artistArabicTranslationFields,
      ...artistEnglishTranslationFields,
    ],
    initialValues: {
      featured: false,
      display_order: 0,
      representation_status: "represented",
      visibility_status: VisibilityStatus.Private,
    },
    sections: [
      {
        key: "shared-information",
        title: "Shared",
        description: "Information used for the artist in every language.",
        fields: [...artistSharedBasicFields, ...artistSharedContactFields, ...artistSharedPublishingFields],
      },
      {
        key: "arabic-translation",
        title: "Arabic",
        description: "Arabic content for this artist.",
        fields: artistArabicTranslationFields,
      },
      {
        key: "english-translation",
        title: "English",
        description: "English content for this artist.",
        fields: artistEnglishTranslationFields,
      },
      {
        key: "advanced-settings",
        title: "Advanced",
        description: "URL and ordering settings. Most editors can leave these unchanged.",
        fields: artistSharedAdvancedFields,
      },
    ],
  },
  editForm: {
    formKey: "artists-edit",
    moduleKey: "artists",
    title: "Edit Artist",
    description: "Update one artist record and its Arabic and English content.",
    mode: "edit",
    submitLabel: "Save Artist",
    cancelLabel: "Cancel",
    fields: [
      ...artistSharedFields,
      ...artistArabicTranslationFields,
      ...artistEnglishTranslationFields,
    ],
    sections: [
      {
        key: "shared-information",
        title: "Shared",
        description: "Information used for the artist in every language.",
        fields: [...artistSharedBasicFields, ...artistSharedContactFields, ...artistSharedPublishingFields],
      },
      {
        key: "arabic-translation",
        title: "Arabic",
        description: "Arabic content for this artist.",
        fields: artistArabicTranslationFields,
      },
      {
        key: "english-translation",
        title: "English",
        description: "English content for this artist.",
        fields: artistEnglishTranslationFields,
      },
      {
        key: "advanced-settings",
        title: "Advanced",
        description: "URL and ordering settings. Most editors can leave these unchanged.",
        fields: artistSharedAdvancedFields,
      },
    ],
  },
};
