export interface Tex7LocalizedHreflangReference {
  localeCode: string;
  href: string;
  hreflang: string;
  isDefault?: boolean;
}

export interface Tex7LocalizedOpenGraphMetadata {
  title?: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  localeCode?: string;
}

export interface Tex7LocalizedSocialPreviewMetadata {
  title?: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export interface Tex7LocalizedStructuredDataTextFields {
  headline?: string;
  name?: string;
  description?: string;
  abstract?: string;
  keywords?: string[];
  text?: string;
  [fieldName: string]: string | string[] | undefined;
}

export interface Tex7LocalizedSeoMetadata {
  localeCode: string;
  title?: string;
  metaDescription?: string;
  openGraph?: Tex7LocalizedOpenGraphMetadata;
  canonicalUrl?: string;
  hreflang: Tex7LocalizedHreflangReference[];
  structuredDataText?: Tex7LocalizedStructuredDataTextFields;
  socialPreview?: Tex7LocalizedSocialPreviewMetadata;
}

export interface Tex7LocalizedSeoCompletenessInput {
  title?: string;
  metaDescription?: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
  canonicalUrl?: string;
  hreflangCount?: number;
  structuredDataTextFieldCount?: number;
  socialPreviewTitle?: string;
  socialPreviewDescription?: string;
}

export interface Tex7LocalizedSeoPolicy {
  requireLocalizedTitle: boolean;
  requireLocalizedMetaDescription: boolean;
  requireLocalizedOpenGraphText: boolean;
  requireCanonicalUrl: boolean;
  requireHreflangAlternates: boolean;
  requireStructuredDataTextLocalization: boolean;
  requireSocialPreviewLocalization: boolean;
}

export const TEX7_DEFAULT_LOCALIZED_SEO_POLICY: Tex7LocalizedSeoPolicy = {
  requireLocalizedTitle: true,
  requireLocalizedMetaDescription: true,
  requireLocalizedOpenGraphText: true,
  requireCanonicalUrl: true,
  requireHreflangAlternates: true,
  requireStructuredDataTextLocalization: false,
  requireSocialPreviewLocalization: false,
};