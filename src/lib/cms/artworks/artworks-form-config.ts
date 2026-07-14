import type { FormModuleConfiguration, FormOption } from "@/lib/forms";
import {
  AvailabilityStatus,
  PriceStatus,
  VisibilityStatus,
  type Artwork,
} from "@/types";

export type ArtworksFormEntity = Artwork & Record<string, unknown>;

export const artworkAvailabilityStatusOptions: readonly FormOption[] = [
  {
    label: "Available",
    value: AvailabilityStatus.Available,
    description: "Artwork is available for acquisition or inquiry.",
  },
  {
    label: "Reserved",
    value: AvailabilityStatus.Reserved,
    description: "Artwork is temporarily reserved.",
  },
  {
    label: "Sold",
    value: AvailabilityStatus.Sold,
    description: "Artwork has been sold.",
  },
  {
    label: "On Loan",
    value: AvailabilityStatus.OnLoan,
    description: "Artwork is currently on loan.",
  },
  {
    label: "Not For Sale",
    value: AvailabilityStatus.NotForSale,
    description: "Artwork is retained for display or archive only.",
  },
];

export const artworkPriceStatusOptions: readonly FormOption[] = [
  {
    label: "Price Visible",
    value: PriceStatus.PriceVisible,
    description: "Configured price may be shown when future publishing supports it.",
  },
  {
    label: "Price Upon Request",
    value: PriceStatus.PriceUponRequest,
    description: "Visitors must inquire for pricing.",
  },
  {
    label: "Private Quote",
    value: PriceStatus.PrivateQuote,
    description: "Pricing is retained for internal workflows only.",
  },
];

export const artworkVisibilityOptions: readonly FormOption[] = [
  {
    label: "Public",
    value: VisibilityStatus.Public,
    description: "Visible on public-facing artwork pages.",
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

const artworkIdentityFields = [
  {
    key: "title_en",
    label: "Title (English)",
    type: "text",
    required: true,
    placeholder: "Artwork title in English",
  },
  {
    key: "title_ar",
    label: "Title (Arabic)",
    type: "text",
    required: true,
    placeholder: "Artwork title in Arabic",
  },
  {
    key: "slug",
    label: "Slug",
    type: "text",
    required: true,
    placeholder: "artwork-url-slug",
    description: "Stable URL identifier for the artwork.",
  },
  {
    key: "artist_id",
    label: "Artist",
    type: "text",
    required: true,
    description: "References a future Artists CMS record.",
  },
  {
    key: "collection_id",
    label: "Collection",
    type: "text",
    description: "References a future Collections CMS record.",
  },
] as const;

const artworkDetailsFields = [
  {
    key: "year",
    label: "Year",
    type: "number",
    required: true,
  },
  {
    key: "medium_en",
    label: "Medium (English)",
    type: "text",
    required: true,
  },
  {
    key: "medium_ar",
    label: "Medium (Arabic)",
    type: "text",
    required: true,
  },
  {
    key: "dimensions",
    label: "Dimensions",
    type: "text",
    required: true,
    placeholder: "100 × 80 cm",
  },
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

const artworkCommerceFields = [
  {
    key: "price",
    label: "Price",
    type: "number",
  },
  {
    key: "currency",
    label: "Currency",
    type: "text",
    required: true,
    defaultValue: "USD",
  },
  {
    key: "price_status",
    label: "Price Status",
    type: "status",
    required: true,
    options: artworkPriceStatusOptions,
  },
  {
    key: "availability_status",
    label: "Availability",
    type: "status",
    required: true,
    options: artworkAvailabilityStatusOptions,
  },
] as const;

const artworkMediaFields = [
  {
    key: "primary_image_id",
    label: "Primary Image",
    type: "image",
    description: "Upload, replace, remove, or select the Media record used as this artwork primary image.",
  },
] as const;

const artworkPublishingFields = [
  {
    key: "visibility_status",
    label: "Visibility",
    type: "visibility",
    required: true,
    options: artworkVisibilityOptions,
  },
  {
    key: "featured",
    label: "Featured",
    type: "boolean",
    defaultValue: false,
  },
  {
    key: "is_featured_homepage",
    label: "Homepage Feature",
    type: "boolean",
    defaultValue: false,
  },
  {
    key: "display_order",
    label: "Display Order",
    type: "number",
    required: true,
    defaultValue: 0,
  },
] as const;

export const artworksFormConfig: FormModuleConfiguration<ArtworksFormEntity> = {
  moduleKey: "artworks",
  entityLabel: "Artwork",
  createForm: {
    formKey: "artworks-create",
    moduleKey: "artworks",
    title: "Create Artwork",
    description: "Configuration for the future Artworks creation workflow.",
    mode: "create",
    submitLabel: "Create Artwork",
    cancelLabel: "Cancel",
    fields: [
      ...artworkIdentityFields,
      ...artworkDetailsFields,
      ...artworkCommerceFields,
      ...artworkMediaFields,
      ...artworkPublishingFields,
    ],
    initialValues: {
      currency: "USD",
      price_status: PriceStatus.PriceUponRequest,
      availability_status: AvailabilityStatus.Available,
      visibility_status: VisibilityStatus.Private,
      featured: false,
      is_featured_homepage: false,
      display_order: 0,
    },
    sections: [
      {
        key: "identity",
        title: "Identity",
        fields: artworkIdentityFields,
      },
      {
        key: "details",
        title: "Artwork Details",
        fields: artworkDetailsFields,
      },
      {
        key: "commerce",
        title: "Availability and Pricing",
        fields: artworkCommerceFields,
      },
      {
        key: "media",
        title: "Media",
        fields: artworkMediaFields,
      },
      {
        key: "publishing",
        title: "Publishing",
        fields: artworkPublishingFields,
      },
    ],
  },
  editForm: {
    formKey: "artworks-edit",
    moduleKey: "artworks",
    title: "Edit Artwork",
    description: "Configuration for the future Artworks editing workflow.",
    mode: "edit",
    submitLabel: "Save Artwork",
    cancelLabel: "Cancel",
    fields: [
      ...artworkIdentityFields,
      ...artworkDetailsFields,
      ...artworkCommerceFields,
      ...artworkMediaFields,
      ...artworkPublishingFields,
    ],
    sections: [
      {
        key: "identity",
        title: "Identity",
        fields: artworkIdentityFields,
      },
      {
        key: "details",
        title: "Artwork Details",
        fields: artworkDetailsFields,
      },
      {
        key: "commerce",
        title: "Availability and Pricing",
        fields: artworkCommerceFields,
      },
      {
        key: "media",
        title: "Media",
        fields: artworkMediaFields,
      },
      {
        key: "publishing",
        title: "Publishing",
        fields: artworkPublishingFields,
      },
    ],
  },
};