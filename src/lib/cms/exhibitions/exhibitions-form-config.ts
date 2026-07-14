import type { FormModuleConfiguration, FormOption } from "@/lib/forms";
import { VisibilityStatus, type Exhibition } from "@/types";

export type ExhibitionsFormEntity = Exhibition & Record<string, unknown>;

export const exhibitionVisibilityOptions: readonly FormOption[] = [
  {
    label: "Public",
    value: VisibilityStatus.Public,
    description: "Visible on public-facing exhibition pages.",
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

const exhibitionIdentityFields = [
  {
    key: "title_en",
    label: "Title (English)",
    type: "text",
    required: true,
    placeholder: "Exhibition title in English",
  },
  {
    key: "title_ar",
    label: "Title (Arabic)",
    type: "text",
    required: true,
    placeholder: "Exhibition title in Arabic",
  },
  {
    key: "slug",
    label: "Slug",
    type: "text",
    required: true,
    placeholder: "exhibition-url-slug",
    description: "Stable URL identifier for the exhibition.",
  },
] as const;

const exhibitionContentFields = [
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

const exhibitionMediaFields = [
  {
    key: "cover_media_id",
    label: "Cover Image",
    type: "image",
    description: "Upload, replace, remove, or select the Media record used as this exhibition cover.",
  },
] as const;

const exhibitionScheduleFields = [
  {
    key: "start_date",
    label: "Start Date",
    type: "date",
    required: true,
    description: "Opening date for the exhibition.",
  },
  {
    key: "end_date",
    label: "End Date",
    type: "date",
    required: true,
    description: "Closing date for the exhibition.",
  },
] as const;

const exhibitionVenueFields = [
  {
    key: "venue_en",
    label: "Venue (English)",
    type: "text",
    required: true,
    placeholder: "Venue name in English",
  },
  {
    key: "venue_ar",
    label: "Venue (Arabic)",
    type: "text",
    required: true,
    placeholder: "Venue name in Arabic",
  },
] as const;

const exhibitionPublishingFields = [
  {
    key: "visibility_status",
    label: "Visibility",
    type: "visibility",
    required: true,
    options: exhibitionVisibilityOptions,
  },
] as const;

export const exhibitionsFormConfig: FormModuleConfiguration<ExhibitionsFormEntity> = {
  moduleKey: "exhibitions",
  entityLabel: "Exhibition",
  createForm: {
    formKey: "exhibitions-create",
    moduleKey: "exhibitions",
    title: "Create Exhibition",
    description: "Configuration for the future Exhibitions creation workflow.",
    mode: "create",
    submitLabel: "Create Exhibition",
    cancelLabel: "Cancel",
    fields: [
      ...exhibitionIdentityFields,
      ...exhibitionContentFields,
      ...exhibitionScheduleFields,
      ...exhibitionVenueFields,
      ...exhibitionMediaFields,
      ...exhibitionPublishingFields,
    ],
    initialValues: {
      visibility_status: VisibilityStatus.Private,
    },
    sections: [
      {
        key: "identity",
        title: "Identity",
        fields: exhibitionIdentityFields,
      },
      {
        key: "content",
        title: "Content",
        fields: exhibitionContentFields,
      },
      {
        key: "schedule",
        title: "Schedule",
        fields: exhibitionScheduleFields,
      },
      {
        key: "venue",
        title: "Venue",
        fields: exhibitionVenueFields,
      },
      {
        key: "media",
        title: "Media",
        fields: exhibitionMediaFields,
      },
      {
        key: "publishing",
        title: "Publishing",
        fields: exhibitionPublishingFields,
      },
    ],
  },
  editForm: {
    formKey: "exhibitions-edit",
    moduleKey: "exhibitions",
    title: "Edit Exhibition",
    description: "Configuration for the future Exhibitions editing workflow.",
    mode: "edit",
    submitLabel: "Save Exhibition",
    cancelLabel: "Cancel",
    fields: [
      ...exhibitionIdentityFields,
      ...exhibitionContentFields,
      ...exhibitionScheduleFields,
      ...exhibitionVenueFields,
      ...exhibitionMediaFields,
      ...exhibitionPublishingFields,
    ],
    sections: [
      {
        key: "identity",
        title: "Identity",
        fields: exhibitionIdentityFields,
      },
      {
        key: "content",
        title: "Content",
        fields: exhibitionContentFields,
      },
      {
        key: "schedule",
        title: "Schedule",
        fields: exhibitionScheduleFields,
      },
      {
        key: "venue",
        title: "Venue",
        fields: exhibitionVenueFields,
      },
      {
        key: "media",
        title: "Media",
        fields: exhibitionMediaFields,
      },
      {
        key: "publishing",
        title: "Publishing",
        fields: exhibitionPublishingFields,
      },
    ],
  },
};