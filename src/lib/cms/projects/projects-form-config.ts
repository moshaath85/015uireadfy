import type { FormModuleConfiguration, FormOption } from "@/lib/forms";
import { VisibilityStatus, type Project } from "@/types";

export type ProjectsFormEntity = Project & Record<string, unknown>;

export const projectVisibilityOptions: readonly FormOption[] = [
  {
    label: "Public",
    value: VisibilityStatus.Public,
    description: "Visible on public-facing project pages.",
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

export const projectTypeOptions: readonly FormOption[] = [
  {
    label: "Advisory",
    value: "advisory",
    description: "Curatorial, acquisition, or collection advisory project.",
  },
  {
    label: "Corporate",
    value: "corporate",
    description: "Corporate art or institutional partnership project.",
  },
  {
    label: "Public Art",
    value: "public_art",
    description: "Public-facing commission, installation, or placemaking project.",
  },
  {
    label: "Private Collection",
    value: "private_collection",
    description: "Private collection development or collection management project.",
  },
  {
    label: "Exhibition",
    value: "exhibition",
    description: "Project connected to exhibition development or production.",
  },
];

export const projectStatusOptions: readonly FormOption[] = [
  {
    label: "Planned",
    value: "planned",
    description: "Project is planned for future execution.",
  },
  {
    label: "In Progress",
    value: "in_progress",
    description: "Project is actively underway.",
  },
  {
    label: "Completed",
    value: "completed",
    description: "Project has been completed.",
  },
  {
    label: "Archived",
    value: "archived",
    description: "Project is retained for archive purposes.",
  },
];

const projectIdentityFields = [
  {
    key: "title_en",
    label: "Title (English)",
    type: "text",
    required: true,
    placeholder: "Project title in English",
  },
  {
    key: "title_ar",
    label: "Title (Arabic)",
    type: "text",
    required: true,
    placeholder: "Project title in Arabic",
  },
  {
    key: "slug",
    label: "Slug",
    type: "text",
    required: true,
    placeholder: "project-url-slug",
    description: "Stable URL identifier for the project.",
  },
] as const;

const projectContentFields = [
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

const projectClientFields = [
  {
    key: "client_en",
    label: "Client (English)",
    type: "text",
    placeholder: "Client name in English",
  },
  {
    key: "client_ar",
    label: "Client (Arabic)",
    type: "text",
    placeholder: "Client name in Arabic",
  },
] as const;

const projectClassificationFields = [
  {
    key: "type",
    label: "Type",
    type: "status",
    required: true,
    options: projectTypeOptions,
  },
  {
    key: "year",
    label: "Year",
    type: "number",
    required: true,
  },
  {
    key: "status",
    label: "Status",
    type: "status",
    required: true,
    options: projectStatusOptions,
  },
] as const;

const projectMediaFields = [
  {
    key: "cover_media_id",
    label: "Project Image",
    type: "image",
    description: "Upload, replace, remove, or select the Media record used as this project image.",
  },
] as const;

const projectPublishingFields = [
  {
    key: "visibility_status",
    label: "Visibility",
    type: "visibility",
    required: true,
    options: projectVisibilityOptions,
  },
] as const;

export const projectsFormConfig: FormModuleConfiguration<ProjectsFormEntity> = {
  moduleKey: "projects",
  entityLabel: "Project",
  createForm: {
    formKey: "projects-create",
    moduleKey: "projects",
    title: "Create Project",
    description: "Configuration for the future Projects creation workflow.",
    mode: "create",
    submitLabel: "Create Project",
    cancelLabel: "Cancel",
    fields: [
      ...projectIdentityFields,
      ...projectContentFields,
      ...projectClientFields,
      ...projectClassificationFields,
      ...projectMediaFields,
      ...projectPublishingFields,
    ],
    initialValues: {
      type: "advisory",
      status: "planned",
      visibility_status: VisibilityStatus.Private,
    },
    sections: [
      {
        key: "identity",
        title: "Identity",
        fields: projectIdentityFields,
      },
      {
        key: "content",
        title: "Content",
        fields: projectContentFields,
      },
      {
        key: "client",
        title: "Client",
        fields: projectClientFields,
      },
      {
        key: "classification",
        title: "Type, Year, and Status",
        fields: projectClassificationFields,
      },
      {
        key: "media",
        title: "Media",
        fields: projectMediaFields,
      },
      {
        key: "publishing",
        title: "Publishing",
        fields: projectPublishingFields,
      },
    ],
  },
  editForm: {
    formKey: "projects-edit",
    moduleKey: "projects",
    title: "Edit Project",
    description: "Configuration for the future Projects editing workflow.",
    mode: "edit",
    submitLabel: "Save Project",
    cancelLabel: "Cancel",
    fields: [
      ...projectIdentityFields,
      ...projectContentFields,
      ...projectClientFields,
      ...projectClassificationFields,
      ...projectMediaFields,
      ...projectPublishingFields,
    ],
    sections: [
      {
        key: "identity",
        title: "Identity",
        fields: projectIdentityFields,
      },
      {
        key: "content",
        title: "Content",
        fields: projectContentFields,
      },
      {
        key: "client",
        title: "Client",
        fields: projectClientFields,
      },
      {
        key: "classification",
        title: "Type, Year, and Status",
        fields: projectClassificationFields,
      },
      {
        key: "media",
        title: "Media",
        fields: projectMediaFields,
      },
      {
        key: "publishing",
        title: "Publishing",
        fields: projectPublishingFields,
      },
    ],
  },
};