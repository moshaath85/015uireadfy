import type { PublicProjectExperienceQueryRecord } from '@/lib/cms/production-prisma';

export interface ProjectExperienceMedia {
  readonly id: string;
  readonly url: string;
  readonly alt: string;
  readonly width: number | null;
  readonly height: number | null;
}

export interface ProjectExperienceData {
  readonly project: {
    readonly id: string;
    readonly slug: string;
    readonly title: string;
    readonly titleAr: string;
    readonly description: string;
    readonly descriptionAr: string;
    readonly client: string | null;
    readonly clientAr: string | null;
    readonly type: string;
    readonly year: number;
    readonly status: string;
  };
  readonly coverMedia: ProjectExperienceMedia | null;
  readonly media: readonly (ProjectExperienceMedia & {
    readonly role: string;
  })[];
  readonly artists: readonly {
    readonly id: string;
    readonly slug: string;
    readonly name: string;
    readonly nameAr: string;
    readonly role: string;
    readonly profileMedia: ProjectExperienceMedia | null;
  }[];
  readonly artworks: readonly {
    readonly id: string;
    readonly slug: string;
    readonly title: string;
    readonly titleAr: string;
    readonly year: number;
    readonly medium: string;
    readonly inclusionNote: string | null;
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
      readonly coverMedia: ProjectExperienceMedia | null;
    } | null;
    readonly media: ProjectExperienceMedia | null;
  }[];
}

type QueryProjectMedia = PublicProjectExperienceQueryRecord['media'][number];
type QueryArtistRelation = PublicProjectExperienceQueryRecord['artists'][number];
type QueryArtworkRelation = PublicProjectExperienceQueryRecord['artworks'][number];
type QueryAsset = PublicProjectExperienceQueryRecord['assets'][number];

function mediaComparator(left: QueryProjectMedia, right: QueryProjectMedia): number {
  if (left.displayOrder !== right.displayOrder) return left.displayOrder - right.displayOrder;
  return left.createdAt.localeCompare(right.createdAt);
}

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

function toMedia(asset: QueryAsset | undefined, fallbackAlt: string): ProjectExperienceMedia | null {
  if (!asset) return null;
  return {
    id: asset.id,
    url: asset.storagePath,
    alt: asset.altText || fallbackAlt,
    width: asset.width,
    height: asset.height,
  };
}

function projectMediaToExperienceMedia(
  relation: QueryProjectMedia,
  fallbackAlt: string,
): ProjectExperienceMedia & { readonly role: string } {
  return {
    id: relation.media.id,
    url: relation.media.storagePath,
    alt: relation.media.altText || fallbackAlt,
    width: relation.media.width,
    height: relation.media.height,
    role: relation.role,
  };
}

export function createProjectExperienceData(
  record: PublicProjectExperienceQueryRecord,
): ProjectExperienceData {
  const assetsById = new Map(record.assets.map((asset) => [asset.id, asset]));
  const collectionsById = new Map(record.collections.map((collection) => [collection.id, collection]));

  return {
    project: {
      id: record.project.id,
      slug: record.project.slug,
      title: record.project.titleEn,
      titleAr: record.project.titleAr,
      description: record.project.descriptionEn,
      descriptionAr: record.project.descriptionAr,
      client: record.project.clientEn,
      clientAr: record.project.clientAr,
      type: record.project.type,
      year: record.project.year,
      status: record.project.status,
    },
    coverMedia: toMedia(
      record.project.coverMediaId ? assetsById.get(record.project.coverMediaId) : undefined,
      record.project.titleEn,
    ),
    media: [...record.media]
      .sort(mediaComparator)
      .map((relation) => projectMediaToExperienceMedia(relation, record.project.titleEn)),
    artists: [...record.artists].sort(artistComparator).map(({ artist, role }) => ({
      id: artist.id,
      slug: artist.slug,
      name: artist.nameEn,
      nameAr: artist.nameAr,
      role,
      profileMedia: toMedia(
        artist.profileImageId ? assetsById.get(artist.profileImageId) : undefined,
        artist.nameEn,
      ),
    })),
    artworks: [...record.artworks].sort(artworkComparator).map(({ artwork, inclusionNote }) => {
      const collection = artwork.collectionId ? collectionsById.get(artwork.collectionId) : undefined;
      return {
        id: artwork.id,
        slug: artwork.slug,
        title: artwork.titleEn,
        titleAr: artwork.titleAr,
        year: artwork.yearCreated,
        medium: artwork.medium,
        inclusionNote,
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
                collection.coverMediaId ? assetsById.get(collection.coverMediaId) : undefined,
                collection.titleEn,
              ),
            }
          : null,
        media: toMedia(assetsById.get(artwork.primaryMediaId), artwork.titleEn),
      };
    }),
  };
}
