import type { FormModuleConfiguration, FormOption } from "@/lib/forms";
import { VisibilityStatus, type Collection } from "@/types";

export type CollectionsFormEntity = Collection & Record<string, unknown>;

export const collectionVisibilityOptions: readonly FormOption[] = [
  {
    label: "Public",
    value: VisibilityStatus.Public,
    description: "Visible on public-facing collection pages.",
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

const collectionIdentityFields = [
  {
    key: "title_en",
    label: "Title (English)",
    type: "text",
    required: true,
    placeholder: "Collection title in English",
  },
  {
    key: "title_ar",
    label: "Title (Arabic)",
    type: "text",
    required: true,
    placeholder: "Collection title in Arabic",
  },
  {
    key: "slug",
    label: "Slug",
    type: "text",
    required: true,
    placeholder: "collection-url-slug",
    description: "Stable URL identifier for the collection.",
  },
] as const;

const collectionMediaFields = [
  {
    key: "cover_media_id",
    label: "Cover Image",
    type: "image",
    description: "Upload, replace, remove, or select the Media record used as this collection cover.",
  },
] as const;

const collectionContentFields = [
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

const collectionPublishingFields = [
  {
    key: "visibility_status",
    label: "Visibility",
    type: "visibility",
    required: true,
    options: collectionVisibilityOptions,
  },
] as const;

export const collectionsFormConfig: FormModuleConfiguration<CollectionsFormEntity> = {
  moduleKey: "collections",
  entityLabel: "Collection",
  createForm: {
    formKey: "collections-create",
    moduleKey: "collections",
    title: "Create Collection",
    description: "Configuration for the future Collections creation workflow.",
    mode: "create",
    submitLabel: "Create Collection",
    cancelLabel: "Cancel",
    fields: [
      ...collectionIdentityFields,
      ...collectionContentFields,
      ...collectionMediaFields,
      ...collectionPublishingFields,
    ],
    initialValues: {
      visibility_status: VisibilityStatus.Private,
    },
    sections: [
      {
        key: "identity",
        title: "Identity",
        fields: collectionIdentityFields,
      },
      {
        key: "content",
        title: "Content",
        fields: collectionContentFields,
      },
      {
        key: "media",
        title: "Media",
        fields: collectionMediaFields,
      },
      {
        key: "publishing",
        title: "Publishing",
        fields: collectionPublishingFields,
      },
    ],
  },
  editForm: {
    formKey: "collections-edit",
    moduleKey: "collections",
    title: "Edit Collection",
    description: "Configuration for the future Collections editing workflow.",
    mode: "edit",
    submitLabel: "Save Collection",
    cancelLabel: "Cancel",
    fields: [
      ...collectionIdentityFields,
      ...collectionContentFields,
      ...collectionMediaFields,
      ...collectionPublishingFields,
    ],
    sections: [
      {
        key: "identity",
        title: "Identity",
        fields: collectionIdentityFields,
      },
      {
        key: "content",
        title: "Content",
        fields: collectionContentFields,
      },
      {
        key: "media",
        title: "Media",
        fields: collectionMediaFields,
      },
      {
        key: "publishing",
        title: "Publishing",
        fields: collectionPublishingFields,
      },
    ],
  },
};