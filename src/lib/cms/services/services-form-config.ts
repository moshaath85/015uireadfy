import type { FormModuleConfiguration, FormOption } from "@/lib/forms";
import { VisibilityStatus, type Service } from "@/types";

export type ServicesFormEntity = Service & Record<string, unknown>;

export const serviceVisibilityOptions: readonly FormOption[] = [
  {
    label: "Public",
    value: VisibilityStatus.Public,
    description: "Visible on public-facing service pages.",
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

const serviceIdentityFields = [
  {
    key: "title_en",
    label: "Title (English)",
    type: "text",
    required: true,
    placeholder: "Service title in English",
  },
  {
    key: "title_ar",
    label: "Title (Arabic)",
    type: "text",
    required: true,
    placeholder: "Service title in Arabic",
  },
  {
    key: "slug",
    label: "Slug",
    type: "text",
    required: true,
    placeholder: "service-url-slug",
    description: "Stable URL identifier for the service.",
  },
] as const;

const serviceContentFields = [
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

const serviceFeatureFields = [
  {
    key: "features_en",
    label: "Features (English)",
    type: "json",
    required: true,
    description: "Future form engines can render this as a repeatable English feature list.",
  },
  {
    key: "features_ar",
    label: "Features (Arabic)",
    type: "json",
    required: true,
    description: "Future form engines can render this as a repeatable Arabic feature list.",
  },
] as const;

const serviceMediaFields = [
  {
    key: "cover_media_id",
    label: "Service Image",
    type: "image",
    description: "Upload, replace, remove, or select the Media record used as this service image.",
  },
] as const;

const servicePriceFields = [
  {
    key: "price_info",
    label: "Price Info",
    type: "json",
    description: "Structured future pricing metadata for service inquiries and display logic.",
  },
] as const;

const servicePublishingFields = [
  {
    key: "visibility_status",
    label: "Visibility",
    type: "visibility",
    required: true,
    options: serviceVisibilityOptions,
  },
] as const;

export const servicesFormConfig: FormModuleConfiguration<ServicesFormEntity> = {
  moduleKey: "services",
  entityLabel: "Service",
  createForm: {
    formKey: "services-create",
    moduleKey: "services",
    title: "Create Service",
    description: "Configuration for the future Services creation workflow.",
    mode: "create",
    submitLabel: "Create Service",
    cancelLabel: "Cancel",
    fields: [
      ...serviceIdentityFields,
      ...serviceContentFields,
      ...serviceFeatureFields,
      ...servicePriceFields,
      ...serviceMediaFields,
      ...servicePublishingFields,
    ],
    initialValues: {
      features_en: [],
      features_ar: [],
      visibility_status: VisibilityStatus.Private,
    },
    sections: [
      {
        key: "identity",
        title: "Identity",
        fields: serviceIdentityFields,
      },
      {
        key: "content",
        title: "Content",
        fields: serviceContentFields,
      },
      {
        key: "features",
        title: "Features",
        fields: serviceFeatureFields,
      },
      {
        key: "pricing",
        title: "Price Info",
        fields: servicePriceFields,
      },
      {
        key: "media",
        title: "Media",
        fields: serviceMediaFields,
      },
      {
        key: "publishing",
        title: "Publishing",
        fields: servicePublishingFields,
      },
    ],
  },
  editForm: {
    formKey: "services-edit",
    moduleKey: "services",
    title: "Edit Service",
    description: "Configuration for the future Services editing workflow.",
    mode: "edit",
    submitLabel: "Save Service",
    cancelLabel: "Cancel",
    fields: [
      ...serviceIdentityFields,
      ...serviceContentFields,
      ...serviceFeatureFields,
      ...servicePriceFields,
      ...serviceMediaFields,
      ...servicePublishingFields,
    ],
    sections: [
      {
        key: "identity",
        title: "Identity",
        fields: serviceIdentityFields,
      },
      {
        key: "content",
        title: "Content",
        fields: serviceContentFields,
      },
      {
        key: "features",
        title: "Features",
        fields: serviceFeatureFields,
      },
      {
        key: "pricing",
        title: "Price Info",
        fields: servicePriceFields,
      },
      {
        key: "media",
        title: "Media",
        fields: serviceMediaFields,
      },
      {
        key: "publishing",
        title: "Publishing",
        fields: servicePublishingFields,
      },
    ],
  },
};