import type { FormModuleConfiguration, FormOption } from "@/lib/forms";
import { VisibilityStatus, type Publication } from "@/types";

export type PublicationsFormEntity = Publication & Record<string, unknown>;

export const publicationVisibilityOptions: readonly FormOption[] = [
  {
    label: "Public",
    value: VisibilityStatus.Public,
    description: "Visible on public-facing publication pages.",
  },
  {
    label: "Private",
    value: VisibilityStatus.Private,
    description: "Available only to internal administration workflows.",
  },
  {
    label: "VIP",
    value: VisibilityStatus.Vip,
    description: "Reserved for future restricted audience visibility.",
  },
  {
    label: "Hidden",
    value: VisibilityStatus.Hidden,
    description: "Hidden from public listing and detail pages.",
  },
];

export const publicationTypeOptions: readonly FormOption[] = [
  {
    label: "Catalogue",
    value: "catalogue",
    description: "Exhibition or collection catalogue.",
  },
  {
    label: "Essay",
    value: "essay",
    description: "Editorial essay or long-form publication.",
  },
  {
    label: "Press Release",
    value: "press_release",
    description: "Press release or media publication.",
  },
  {
    label: "Report",
    value: "report",
    description: "Institutional, project, or research report.",
  },
  {
    label: "Guide",
    value: "guide",
    description: "Visitor, collection, or educational guide.",
  },
];

const publicationIdentityFields = [
  {
    key: "title_en",
    label: "Title (English)",
    type: "text",
    required: true,
    placeholder: "Publication title in English",
  },
  {
    key: "title_ar",
    label: "Title (Arabic)",
    type: "text",
    required: true,
    placeholder: "Publication title in Arabic",
  },
  {
    key: "slug",
    label: "Slug",
    type: "text",
    required: true,
    placeholder: "publication-url-slug",
    description: "Stable URL identifier for the publication.",
  },
] as const;

const publicationContentFields = [
  {
    key: "description_en",
    label: "Description (English)",
    type: "textarea",
    required: true,
  },
  {
    key: "description_ar",
    label: "Description (Arabic)",
    type: "textarea",
    required: true,
  },
] as const;

const publicationFileFields = [
  {
    key: "type",
    label: "Type",
    type: "select",
    required: true,
    options: publicationTypeOptions,
  },
  {
    key: "file_url",
    label: "File URL",
    type: "url",
    required: true,
    placeholder: "https://example.com/publication.pdf",
    description: "Future file reference for downloadable or viewable publication assets.",
  },
  {
    key: "cover_image_id",
    label: "Cover Image",
    type: "image",
    description: "Upload, replace, remove, or select the Media record used as this publication cover.",
  },
] as const;

const publicationPublishingFields = [
  {
    key: "publish_date",
    label: "Publish Date",
    type: "date",
    required: true,
    description: "Date used for future publication sorting and publishing workflows.",
  },
  {
    key: "visibility_status",
    label: "Visibility",
    type: "visibility",
    required: true,
    options: publicationVisibilityOptions,
  },
] as const;

export const publicationsFormConfig: FormModuleConfiguration<PublicationsFormEntity> = {
  moduleKey: "publications",
  entityLabel: "Publication",
  createForm: {
    formKey: "publications-create",
    moduleKey: "publications",
    title: "Create Publication",
    description: "Configuration for the future Publications creation workflow.",
    mode: "create",
    submitLabel: "Create Publication",
    cancelLabel: "Cancel",
    fields: [
      ...publicationIdentityFields,
      ...publicationContentFields,
      ...publicationFileFields,
      ...publicationPublishingFields,
    ],
    initialValues: {
      type: "catalogue",
      visibility_status: VisibilityStatus.Private,
    },
    sections: [
      {
        key: "identity",
        title: "Identity",
        fields: publicationIdentityFields,
      },
      {
        key: "content",
        title: "Content",
        fields: publicationContentFields,
      },
      {
        key: "file",
        title: "Type, File URL, and Cover",
        fields: publicationFileFields,
      },
      {
        key: "publishing",
        title: "Publish Date and Visibility",
        fields: publicationPublishingFields,
      },
    ],
  },
  editForm: {
    formKey: "publications-edit",
    moduleKey: "publications",
    title: "Edit Publication",
    description: "Configuration for the future Publications editing workflow.",
    mode: "edit",
    submitLabel: "Save Publication",
    cancelLabel: "Cancel",
    fields: [
      ...publicationIdentityFields,
      ...publicationContentFields,
      ...publicationFileFields,
      ...publicationPublishingFields,
    ],
    sections: [
      {
        key: "identity",
        title: "Identity",
        fields: publicationIdentityFields,
      },
      {
        key: "content",
        title: "Content",
        fields: publicationContentFields,
      },
      {
        key: "file",
        title: "Type, File URL, and Cover",
        fields: publicationFileFields,
      },
      {
        key: "publishing",
        title: "Publish Date and Visibility",
        fields: publicationPublishingFields,
      },
    ],
  },
};