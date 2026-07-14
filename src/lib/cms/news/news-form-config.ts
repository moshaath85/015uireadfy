import type { FormModuleConfiguration, FormOption } from "@/lib/forms";
import { VisibilityStatus, type News } from "@/types";

export type NewsFormEntity = News & Record<string, unknown>;

export const newsVisibilityOptions: readonly FormOption[] = [
  {
    label: "Public",
    value: VisibilityStatus.Public,
    description: "Visible on public-facing news pages.",
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

export const newsCategoryOptions: readonly FormOption[] = [
  {
    label: "Gallery News",
    value: "gallery_news",
    description: "General gallery announcement or update.",
  },
  {
    label: "Exhibition",
    value: "exhibition",
    description: "News connected to an exhibition.",
  },
  {
    label: "Artist",
    value: "artist",
    description: "Artist-focused announcement or feature.",
  },
  {
    label: "Collection",
    value: "collection",
    description: "Collection-related update.",
  },
  {
    label: "Press",
    value: "press",
    description: "Press release or media notice.",
  },
  {
    label: "Event",
    value: "event",
    description: "Event announcement or recap.",
  },
];

const newsIdentityFields = [
  {
    key: "title_en",
    label: "Title (English)",
    type: "text",
    required: true,
    placeholder: "News title in English",
  },
  {
    key: "title_ar",
    label: "Title (Arabic)",
    type: "text",
    required: true,
    placeholder: "News title in Arabic",
  },
  {
    key: "slug",
    label: "Slug",
    type: "text",
    required: true,
    placeholder: "news-url-slug",
    description: "Stable URL identifier for the news item.",
  },
] as const;

const newsSummaryFields = [
  {
    key: "excerpt_en",
    label: "Excerpt (English)",
    type: "textarea",
    required: true,
  },
  {
    key: "excerpt_ar",
    label: "Excerpt (Arabic)",
    type: "textarea",
    required: true,
  },
] as const;

const newsContentFields = [
  {
    key: "content_en",
    label: "Content (English)",
    type: "textarea",
    required: true,
  },
  {
    key: "content_ar",
    label: "Content (Arabic)",
    type: "textarea",
    required: true,
  },
] as const;

const newsPublishingFields = [
  {
    key: "category",
    label: "Category",
    type: "select",
    required: true,
    options: newsCategoryOptions,
  },
  {
    key: "publish_date",
    label: "Publish Date",
    type: "date",
    required: true,
    description: "Date used for future news sorting and publishing workflows.",
  },
  {
    key: "image_id",
    label: "Image",
    type: "image",
    description: "Upload, replace, remove, or select the Media record used as this news image.",
  },
  {
    key: "visibility_status",
    label: "Visibility",
    type: "visibility",
    required: true,
    options: newsVisibilityOptions,
  },
] as const;

export const newsFormConfig: FormModuleConfiguration<NewsFormEntity> = {
  moduleKey: "news",
  entityLabel: "News Item",
  createForm: {
    formKey: "news-create",
    moduleKey: "news",
    title: "Create News Item",
    description: "Configuration for the future News creation workflow.",
    mode: "create",
    submitLabel: "Create News Item",
    cancelLabel: "Cancel",
    fields: [
      ...newsIdentityFields,
      ...newsSummaryFields,
      ...newsContentFields,
      ...newsPublishingFields,
    ],
    initialValues: {
      category: "gallery_news",
      visibility_status: VisibilityStatus.Private,
    },
    sections: [
      {
        key: "identity",
        title: "Identity",
        fields: newsIdentityFields,
      },
      {
        key: "summary",
        title: "Summary",
        fields: newsSummaryFields,
      },
      {
        key: "content",
        title: "Content",
        fields: newsContentFields,
      },
      {
        key: "publishing",
        title: "Category, Publish Date, and Visibility",
        fields: newsPublishingFields,
      },
    ],
  },
  editForm: {
    formKey: "news-edit",
    moduleKey: "news",
    title: "Edit News Item",
    description: "Configuration for the future News editing workflow.",
    mode: "edit",
    submitLabel: "Save News Item",
    cancelLabel: "Cancel",
    fields: [
      ...newsIdentityFields,
      ...newsSummaryFields,
      ...newsContentFields,
      ...newsPublishingFields,
    ],
    sections: [
      {
        key: "identity",
        title: "Identity",
        fields: newsIdentityFields,
      },
      {
        key: "summary",
        title: "Summary",
        fields: newsSummaryFields,
      },
      {
        key: "content",
        title: "Content",
        fields: newsContentFields,
      },
      {
        key: "publishing",
        title: "Category, Publish Date, and Visibility",
        fields: newsPublishingFields,
      },
    ],
  },
};