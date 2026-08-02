import type { PublicCollectionExperienceQueryRecord } from '@/lib/cms/production-prisma';

export interface CollectionExperienceMedia {
  readonly id: string;
  readonly url: string;
  readonly alt: string;
  readonly width: number | null;
  readonly height: number | null;
}

export interface CollectionExperienceData {
  readonly collection: {
    readonly id: string;
    readonly slug: string;
    readonly title: string;
    readonly titleAr: string;
    readonly description: string;
    readonly descriptionAr: string;
  };
  readonly coverMedia: CollectionExperienceMedia | null;
  readonly artworks: readonly {
    readonly id: string;
    readonly slug: string;
    readonly title: string;
    readonly titleAr: string;
    readonly year: number;
    readonly medium: string;
    readonly artist: {
      readonly id: string;
      readonly slug: string;
      readonly name: string;
      readonly nameAr: string;
    };
    readonly media: CollectionExperienceMedia | null;
  }[];
  readonly artists: readonly {
    readonly id: string;
    readonly slug: string;
    readonly name: string;
    readonly nameAr: string;
    readonly profileMedia: CollectionExperienceMedia | null;
  }[];
  readonly exhibitions: readonly {
    readonly id: string;
    readonly slug: string;
    readonly title: string;
    readonly titleAr: string;
    readonly venue: string;
    readonly startDate: string;
    readonly endDate: string;
    readonly coverMedia: CollectionExperienceMedia | null;
  }[];
}

type QueryArtwork = PublicCollectionExperienceQueryRecord['artworks'][number];
type QueryArtist = QueryArtwork['artist'];
type QueryExhibition = PublicCollectionExperienceQueryRecord['exhibitions'][number];
type QueryMedia = PublicCollectionExperienceQueryRecord['media'][number];

function artworkComparator(left: QueryArtwork, right: QueryArtwork): number {
  if (left.featured !== right.featured) return left.featured ? -1 : 1;
  if (left.displayOrder !== right.displayOrder) return left.displayOrder - right.displayOrder;
  const updatedComparison = right.updatedAt.localeCompare(left.updatedAt);
  return updatedComparison || left.titleEn.localeCompare(right.titleEn);
}

function artistComparator(left: QueryArtist, right: QueryArtist): number {
  if (left.featured !== right.featured) return left.featured ? -1 : 1;
  if (left.displayOrder !== right.displayOrder) return left.displayOrder - right.displayOrder;
  return left.nameEn.localeCompare(right.nameEn);
}

function exhibitionComparator(left: QueryExhibition, right: QueryExhibition): number {
  const dateComparison = right.startDate.localeCompare(left.startDate);
  if (dateComparison) return dateComparison;
  if (left.displayOrder !== right.displayOrder) return left.displayOrder - right.displayOrder;
  return left.titleEn.localeCompare(right.titleEn);
}

function toMedia(media: QueryMedia | undefined, fallbackAlt: string): CollectionExperienceMedia | null {
  if (!media) return null;
  return {
    id: media.id,
    url: media.storagePath,
    alt: media.altText || fallbackAlt,
    width: media.width,
    height: media.height,
  };
}

export function createCollectionExperienceData(
  record: PublicCollectionExperienceQueryRecord,
): CollectionExperienceData {
  const mediaById = new Map(record.media.map((media) => [media.id, media]));
  const sortedArtworks = [...record.artworks].sort(artworkComparator);

  const artistsById = new Map<string, QueryArtist>();
  sortedArtworks.forEach((artwork) => artistsById.set(artwork.artist.id, artwork.artist));

  const exhibitionsById = new Map<string, QueryExhibition>();
  record.exhibitions.forEach((exhibition) => exhibitionsById.set(exhibition.id, exhibition));

  return {
    collection: {
      id: record.collection.id,
      slug: record.collection.slug,
      title: record.collection.titleEn,
      titleAr: record.collection.titleAr,
      description: record.collection.descriptionEn,
      descriptionAr: record.collection.descriptionAr,
    },
    coverMedia: toMedia(
      record.collection.coverMediaId ? mediaById.get(record.collection.coverMediaId) : undefined,
      record.collection.titleEn,
    ),
    artworks: sortedArtworks.map((artwork) => ({
      id: artwork.id,
      slug: artwork.slug,
      title: artwork.titleEn,
      titleAr: artwork.titleAr,
      year: artwork.yearCreated,
      medium: artwork.medium,
      artist: {
        id: artwork.artist.id,
        slug: artwork.artist.slug,
        name: artwork.artist.nameEn,
        nameAr: artwork.artist.nameAr,
      },
      media: toMedia(mediaById.get(artwork.primaryMediaId), artwork.titleEn),
    })),
    artists: Array.from(artistsById.values()).sort(artistComparator).map((artist) => ({
      id: artist.id,
      slug: artist.slug,
      name: artist.nameEn,
      nameAr: artist.nameAr,
      profileMedia: toMedia(
        artist.profileImageId ? mediaById.get(artist.profileImageId) : undefined,
        artist.nameEn,
      ),
    })),
    exhibitions: Array.from(exhibitionsById.values()).sort(exhibitionComparator).map((exhibition) => ({
      id: exhibition.id,
      slug: exhibition.slug,
      title: exhibition.titleEn,
      titleAr: exhibition.titleAr,
      venue: exhibition.venueEn,
      startDate: exhibition.startDate,
      endDate: exhibition.endDate,
      coverMedia: toMedia(
        exhibition.coverMediaId ? mediaById.get(exhibition.coverMediaId) : undefined,
        exhibition.titleEn,
      ),
    })),
  };
}
