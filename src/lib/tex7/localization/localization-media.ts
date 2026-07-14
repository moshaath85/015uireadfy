import type { Tex7TranslationIdentity } from "./localization-types";

export interface Tex7BaseMediaIdentity {
  mediaId: string;
  ownerEntityType: string;
  ownerEntityId: string;
}

export interface Tex7LocalizedMediaMetadataIdentity
  extends Tex7TranslationIdentity {
  mediaId: string;
}

export interface Tex7LocalizedMediaMetadata
  extends Tex7LocalizedMediaMetadataIdentity {
  caption?: string;
  altText?: string;
  description?: string;
  accessibilityText?: string;
  seoCaption?: string;
}

export interface Tex7LocalizedMediaMetadataInput {
  caption?: string;
  altText?: string;
  description?: string;
  accessibilityText?: string;
  seoCaption?: string;
}

export interface Tex7LocalizedMediaOwnershipPolicy {
  mediaFileBelongsToBaseEntity: true;
  localizedMetadataBelongsToTranslation: true;
  localizedMetadataDoesNotChangeBaseMediaOwnership: true;
}

export interface Tex7LocalizedMediaMetadataCompletenessRule {
  key:
    | "caption"
    | "alt_text"
    | "description"
    | "accessibility_text"
    | "seo_caption";
  requiredForPublishing: boolean;
  weight: number;
}

export interface Tex7LocalizedMediaMetadataProvider {
  listLocalizedMetadata(
    translation: Tex7TranslationIdentity,
  ): Promise<Tex7LocalizedMediaMetadata[]>;
  getLocalizedMetadata(
    identity: Tex7LocalizedMediaMetadataIdentity,
  ): Promise<Tex7LocalizedMediaMetadata | undefined>;
}

export const TEX7_LOCALIZED_MEDIA_OWNERSHIP_POLICY: Tex7LocalizedMediaOwnershipPolicy =
  {
    mediaFileBelongsToBaseEntity: true,
    localizedMetadataBelongsToTranslation: true,
    localizedMetadataDoesNotChangeBaseMediaOwnership: true,
  };

export function hasTex7LocalizedMediaAccessibilityText(
  metadata: Tex7LocalizedMediaMetadataInput,
): boolean {
  return Boolean(
    metadata.altText?.trim() || metadata.accessibilityText?.trim(),
  );
}