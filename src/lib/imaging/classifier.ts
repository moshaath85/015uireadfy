import type { AssetType } from "./types";

/**
 * Classify an asset based on context rather than image analysis.
 * The caller provides the context (which entity/model this image belongs to).
 */
export interface ClassifyInput {
  /** The Prisma model/entity type this media is attached to */
  contextModel: string;
  /** For Artwork — whether it's the primary image */
  isPrimary?: boolean;
  /** For Artist — whether it's a profile image */
  isProfile?: boolean;
  /** The media record's own mediaType field if set */
  mediaType?: string;
  /** For Exhibition/Project — relationship context */
  relationshipType?: string;
}

export function classifyAsset(input: ClassifyInput): AssetType {
  const { contextModel, isPrimary, isProfile, mediaType, relationshipType } = input;

  // Explicit media type takes precedence
  if (mediaType === "IMAGE") {
    if (contextModel === "Artwork") return isPrimary ? "ARTWORK" : "ARTWORK_DETAIL";
    if (contextModel === "Artist") return isProfile ? "ARTIST_PORTRAIT" : "ARTIST_WORK";
  }

  // Context-based classification
  switch (contextModel) {
    case "Artwork":
      return isPrimary ? "ARTWORK" : "ARTWORK_DETAIL";
    case "Artist":
      return isProfile ? "ARTIST_PORTRAIT" : "ARTIST_WORK";
    case "Exhibition":
      if (relationshipType === "cover") return "EXHIBITION_COVER";
      return "INSTALLATION";
    case "Project":
      if (relationshipType === "cover") return "PROJECT_COVER";
      return "INSTALLATION";
    case "Collection":
      return "COLLECTION";
    case "News":
      return "NEWS";
    case "Publication":
      return "PUBLICATION";
    case "Service":
      return "SERVICE";
    case "Hero":
      return "HERO";
    case "About":
      return "PAGE_MEDIA";
    case "Visit":
      return "PAGE_MEDIA";
    default:
      return "OTHER";
  }
}

/**
 * Simplified classification using only a string hint.
 * Useful for batch processing where full context isn't available.
 */
export function classifyFromHint(hint: string): AssetType {
  const h = hint.toLowerCase();
  if (h.includes("artist") || h.includes("portrait") || h.includes("profile")) return "ARTIST_PORTRAIT";
  if (h.includes("artwork") || h.includes("painting")) return "ARTWORK";
  if (h.includes("exhibition") || h.includes("install")) return "INSTALLATION";
  if (h.includes("publication") || h.includes("catalog")) return "PUBLICATION";
  if (h.includes("news") || h.includes("journal") || h.includes("article")) return "NEWS";
  if (h.includes("hero") || h.includes("banner")) return "HERO";
  if (h.includes("project")) return "PROJECT_COVER";
  if (h.includes("collection")) return "COLLECTION";
  if (h.includes("service")) return "SERVICE";
  if (h.includes("about") || h.includes("visit")) return "PAGE_MEDIA";
  return "OTHER";
}
