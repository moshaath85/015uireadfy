import type { PublicExhibitionExperienceQueryRecord } from '@/lib/cms/production-prisma';

export interface ExhibitionExperienceMedia {
  readonly id: string;
  readonly url: string;
  readonly alt: string;
  readonly width: number | null;
  readonly height: number | null;
}

export interface ExhibitionExperienceData {
  readonly exhibition: {
    readonly id: string;
    readonly slug: string;
    readonly title: string;
    readonly titleAr: string;
    readonly statement: string;
    readonly statementAr: string;
    readonly venue: string;
    readonly venueAr: string;
    readonly startDate: string;
    readonly endDate: string;
    readonly status: string;
  };
  readonly coverMedia: ExhibitionExperienceMedia | null;
  readonly artists: readonly {
    readonly id: string;
    readonly slug: string;
    readonly name: string;
    readonly nameAr: string;
    readonly role: string;
    readonly profileMedia: ExhibitionExperienceMedia | null;
  }[];
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
    readonly collection: {
      readonly id: string;
      readonly slug: string;
      readonly title: string;
      readonly titleAr: string;
      readonly coverMedia: ExhibitionExperienceMedia | null;
    } | null;
    readonly media: ExhibitionExperienceMedia | null;
  }[];
}

type QueryArtistRelation = PublicExhibitionExperienceQueryRecord['artists'][number];
type QueryArtworkRelation = PublicExhibitionExperienceQueryRecord['artworks'][number];
type QueryMedia = PublicExhibitionExperienceQueryRecord['media'][number];

function artistComparator(left: QueryArtistRelation, right: QueryArtistRelation): number {
  if (left.displayOrder !== right.displayOrder) return left.displayOrder - right.displayOrder;
  if (left.artist.displayOrder !== right.artist.displayOrder) {
    return left.artist.displayOrder - right.artist.displayOrder;
  }
  return left.artist.nameEn.localeCompare(right.artist.nameEn);
}

function artworkComparator(left: QueryArtworkRelation, right: QueryArtworkRelation): number {
  if (left.displayOrder !== right.displayOrder) return left.displayOrder - right.displayOrder;
  if (left.artwork.displayOrder !== right.artwork.displayOrder) {
    return left.artwork.displayOrder - right.artwork.displayOrder;
  }
  const updatedComparison = right.artwork.updatedAt.localeCompare(left.artwork.updatedAt);
  return updatedComparison || left.artwork.titleEn.localeCompare(right.artwork.titleEn);
}

function toMedia(media: QueryMedia | undefined, fallbackAlt: string): ExhibitionExperienceMedia | null {
  if (!media) return null;
  return {
    id: media.id,
    url: media.storagePath,
    alt: media.altText || fallbackAlt,
    width: media.width,
    height: media.height,
  };
}

export function createExhibitionExperienceData(
  record: PublicExhibitionExperienceQueryRecord,
): ExhibitionExperienceData {
  const mediaById = new Map(record.media.map((media) => [media.id, media]));
  const collectionsById = new Map(record.collections.map((collection) => [collection.id, collection]));

  return {
    exhibition: {
      id: record.exhibition.id,
      slug: record.exhibition.slug,
      title: record.exhibition.titleEn,
      titleAr: record.exhibition.titleAr,
      statement: record.exhibition.descriptionEn,
      statementAr: record.exhibition.descriptionAr,
      venue: record.exhibition.venueEn,
      venueAr: record.exhibition.venueAr,
      startDate: record.exhibition.startDate,
      endDate: record.exhibition.endDate,
      status: record.exhibition.status,
    },
    coverMedia: toMedia(
      record.exhibition.coverMediaId ? mediaById.get(record.exhibition.coverMediaId) : undefined,
      record.exhibition.titleEn,
    ),
    artists: [...record.artists].sort(artistComparator).map(({ artist, role }) => ({
      id: artist.id,
      slug: artist.slug,
      name: artist.nameEn,
      nameAr: artist.nameAr,
      role,
      profileMedia: toMedia(
        artist.profileImageId ? mediaById.get(artist.profileImageId) : undefined,
        artist.nameEn,
      ),
    })),
    artworks: [...record.artworks].sort(artworkComparator).map(({ artwork }) => {
      const collection = artwork.collectionId ? collectionsById.get(artwork.collectionId) : undefined;
      return {
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
        collection: collection
          ? {
              id: collection.id,
              slug: collection.slug,
              title: collection.titleEn,
              titleAr: collection.titleAr,
              coverMedia: toMedia(
                collection.coverMediaId ? mediaById.get(collection.coverMediaId) : undefined,
                collection.titleEn,
              ),
            }
          : null,
        media: toMedia(mediaById.get(artwork.primaryMediaId), artwork.titleEn),
      };
    }),
  };
}
