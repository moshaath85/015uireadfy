import type { EntityBase, EntityId } from "./entity";
import type { BilingualAltText } from "./content";

export type MediaType = "image" | "document" | "video" | "audio" | "other";
export type StorageProvider = "local" | "s3" | "supabase" | "external";

export interface MediaReference {
  readonly media_id: EntityId;
}

export interface OptionalMediaReference {
  readonly media_id?: EntityId | null;
}

export interface ImageReference {
  readonly image_id?: EntityId | null;
}

export interface PrimaryImageReference {
  readonly primary_image_id?: EntityId | null;
}

export interface MediaAsset extends EntityBase, BilingualAltText {
  readonly url: string;
  readonly type: MediaType | string;
  readonly mime_type: string;
  readonly width?: number;
  readonly height?: number;
  readonly file_size?: number;
  readonly checksum?: string;
  readonly dominant_color?: string;
  readonly copyright?: string;
  readonly photographer?: string;
  readonly license?: string;
  readonly storage_provider?: StorageProvider | string;
  readonly storage_path?: string;
}

export interface SortableMediaLink extends MediaReference {
  readonly sort_order?: number;
  readonly is_primary?: boolean;
}