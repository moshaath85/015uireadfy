import {
  findMediaRecord,
  findPublicMediaRecord,
  listMediaRecords,
  listPublicMediaRecords,
} from "@/lib/cms/production-prisma";
import type { Artist, Artwork, Media } from "@/types";

const heroMediaIdPrefix = "gallery-015-hero-";
const heroMediaPathPrefix = "/images/hero/";

function isImageMedia(media: Media): boolean {
  return media.type.toLowerCase() === "image" && Boolean(media.url);
}

function isHeroMedia(media: Media): boolean {
  return (
    media.id.startsWith(heroMediaIdPrefix) ||
    media.storage_path.startsWith(heroMediaPathPrefix) ||
    media.url.startsWith(heroMediaPathPrefix)
  );
}

function uniqueMedia(records: readonly Media[]): readonly Media[] {
  const seen = new Set<string>();

  return records.filter((record) => {
    const key = record.id || record.url;

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

async function listDatabaseMediaRecords(): Promise<readonly Media[]> {
  const records = await listMediaRecords();
  return records.filter(isImageMedia);
}

async function findDatabaseMediaRecord(mediaId: string | null | undefined): Promise<Media | null> {
  return findMediaRecord(mediaId);
}

async function findPublicDatabaseMediaRecord(mediaId: string | null | undefined): Promise<Media | null> {
  return findPublicMediaRecord(mediaId);
}

export const mediaRepository = {
  getAll: () => listDatabaseMediaRecords(),
  getPublicAll: () => listPublicMediaRecords(),
  getById: (mediaId: string) => findDatabaseMediaRecord(mediaId),
  getArtistProfileMedia: (artist: Artist) => findDatabaseMediaRecord(artist.profile_image_id),
  getArtworkPrimaryMedia: (artwork: Artwork) => findDatabaseMediaRecord(artwork.primary_image_id),
  getPublicById: (mediaId: string) => findPublicDatabaseMediaRecord(mediaId),
  getPublicArtistProfileMedia: (artist: Artist) => findPublicDatabaseMediaRecord(artist.profile_image_id),
  getPublicArtworkPrimaryMedia: (artwork: Artwork) => findPublicDatabaseMediaRecord(artwork.primary_image_id),
  getPublicHeroMedia: async () => uniqueMedia((await listPublicMediaRecords()).filter(isImageMedia).filter(isHeroMedia)),
};
