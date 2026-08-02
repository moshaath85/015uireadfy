import type { PublicArtworkExperienceQueryRecord } from "@/lib/cms/production-prisma";

export interface ArtworkExperienceMedia {
  readonly id: string;
  readonly url: string;
  readonly alt: string;
  readonly width: number | null;
  readonly height: number | null;
}

export interface ArtworkExperienceEntity {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly titleAr: string;
}

export interface ArtworkExperienceData {
  readonly artwork: {
    readonly id: string;
    readonly slug: string;
    readonly title: string;
    readonly titleAr: string;
    readonly description: string;
    readonly descriptionAr: string;
    readonly year: number;
    readonly medium: string;
    readonly dimensions: string;
    readonly availabilityStatus: string;
    readonly pricePolicy: string;
    readonly featured: boolean;
  };
  readonly artist: {
    readonly id: string;
    readonly slug: string;
    readonly name: string;
    readonly nameAr: string;
  };
  readonly collection: ArtworkExperienceEntity | null;
  readonly exhibitions: readonly (ArtworkExperienceEntity & {
    readonly venue: string;
    readonly startDate: string;
    readonly endDate: string;
    readonly displayOrder: number;
  })[];
  readonly projects: readonly (ArtworkExperienceEntity & {
    readonly type: string;
    readonly year: number;
    readonly displayOrder: number;
  })[];
  readonly relatedWorks: readonly {
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
    };
    readonly media: ArtworkExperienceMedia | null;
  }[];
  readonly media: ArtworkExperienceMedia | null;
}

type QueryMedia = NonNullable<PublicArtworkExperienceQueryRecord["primaryMedia"]>;
type QueryRelatedWork = PublicArtworkExperienceQueryRecord["relatedWorks"][number];

function toMedia(media: QueryMedia | null, fallbackAlt: string): ArtworkExperienceMedia | null {
  if (!media) return null;
  return {
    id: media.id,
    url: media.storagePath,
    alt: media.altText || fallbackAlt,
    width: media.width,
    height: media.height,
  };
}

function relatedWorkComparator(
  artwork: PublicArtworkExperienceQueryRecord["artwork"],
): (left: QueryRelatedWork, right: QueryRelatedWork) => number {
  return (left, right) => {
    const leftSameCollection = Boolean(artwork.collectionId && left.collectionId === artwork.collectionId);
    const rightSameCollection = Boolean(artwork.collectionId && right.collectionId === artwork.collectionId);
    if (leftSameCollection !== rightSameCollection) return leftSameCollection ? -1 : 1;

    const leftSameArtist = left.artistId === artwork.artistId;
    const rightSameArtist = right.artistId === artwork.artistId;
    if (leftSameArtist !== rightSameArtist) return leftSameArtist ? -1 : 1;

    if (left.featured !== right.featured) return left.featured ? -1 : 1;
    if (left.displayOrder !== right.displayOrder) return left.displayOrder - right.displayOrder;
    return right.updatedAt.localeCompare(left.updatedAt);
  };
}

export function createArtworkExperienceData(
  record: PublicArtworkExperienceQueryRecord,
): ArtworkExperienceData {
  const { artwork } = record;
  const relatedWorks = [...record.relatedWorks]
    .sort(relatedWorkComparator(artwork))
    .slice(0, 4)
    .map((related) => ({
      id: related.id,
      slug: related.slug,
      title: related.titleEn,
      titleAr: related.titleAr,
      year: related.yearCreated,
      medium: related.medium,
      artist: {
        id: related.artist.id,
        slug: related.artist.slug,
        name: related.artist.nameEn,
      },
      media: toMedia(related.primaryMedia, related.titleEn),
    }));

  return {
    artwork: {
      id: artwork.id,
      slug: artwork.slug,
      title: artwork.titleEn,
      titleAr: artwork.titleAr,
      description: artwork.descriptionEn,
      descriptionAr: artwork.descriptionAr,
      year: artwork.yearCreated,
      medium: artwork.medium,
      dimensions: artwork.dimensions,
      availabilityStatus: artwork.availabilityStatus,
      pricePolicy: artwork.priceVisibility,
      featured: artwork.featured,
    },
    artist: {
      id: record.artist.id,
      slug: record.artist.slug,
      name: record.artist.nameEn,
      nameAr: record.artist.nameAr,
    },
    collection: record.collection
      ? {
          id: record.collection.id,
          slug: record.collection.slug,
          title: record.collection.titleEn,
          titleAr: record.collection.titleAr,
        }
      : null,
    exhibitions: record.exhibitions.map(({ displayOrder, exhibition }) => ({
      id: exhibition.id,
      slug: exhibition.slug,
      title: exhibition.titleEn,
      titleAr: exhibition.titleAr,
      venue: exhibition.venueEn,
      startDate: exhibition.startDate,
      endDate: exhibition.endDate,
      displayOrder,
    })),
    projects: record.projects.map(({ displayOrder, project }) => ({
      id: project.id,
      slug: project.slug,
      title: project.titleEn,
      titleAr: project.titleAr,
      type: project.type,
      year: project.year,
      displayOrder,
    })),
    relatedWorks,
    media: toMedia(record.primaryMedia, artwork.titleEn),
  };
}
