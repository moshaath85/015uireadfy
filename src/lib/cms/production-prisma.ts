import { randomUUID } from "crypto";
import { MediaType, MediaVisibility, type Prisma } from "@prisma/client";
import { getTex7PrismaClient } from "@/lib/tex7/database/providers/prisma-client";
import {
  AvailabilityStatus,
  CertificateStatus,
  PriceStatus,
  VisibilityStatus,
  type Artwork,
  type Certificate,
  type Collection,
  type Exhibition,
  type Media,
  type News,
  type Project,
  type Publication,
  type Service,
  type Settings,
} from "@/types";
import type { ArtworkValidatedInput } from "@/lib/cms/artworks/artworks-validation";
import type { CollectionValidatedInput } from "@/lib/cms/collections/collections-validation";
import type { ExhibitionValidatedInput } from "@/lib/cms/exhibitions/exhibitions-validation";
import type { ProjectValidatedInput } from "@/lib/cms/projects/projects-validation";
import type { ServiceValidatedInput } from "@/lib/cms/services/services-validation";
import type { NewsValidatedInput } from "@/lib/cms/news/news-validation";
import type { PublicationValidatedInput } from "@/lib/cms/publications/publications-validation";

export type ProductionModule =
  | "artworks"
  | "collections"
  | "exhibitions"
  | "projects"
  | "services"
  | "news"
  | "publications"
  | "certificates"
  | "media"
  | "settings";

export interface ProductionWriteSuccess<TRecord> {
  readonly ok: true;
  readonly record: TRecord;
  readonly message: string;
}

export interface ProductionWriteFailure {
  readonly ok: false;
  readonly message: string;
  readonly details?: readonly string[];
}

export type ProductionWriteResult<TRecord> = ProductionWriteSuccess<TRecord> | ProductionWriteFailure;

export interface ProductionWriteOptions {
  readonly organizationId: string;
  readonly now?: string;
}

const publicVisibility = VisibilityStatus.Public;

function prisma() {
  return getTex7PrismaClient();
}

function iso(value: Date | string | null | undefined): string {
  if (!value) {
    return new Date().toISOString();
  }

  return value instanceof Date ? value.toISOString() : value;
}

function dateOnly(value: Date | string | null | undefined): string {
  return iso(value).slice(0, 10);
}

function yearFromDate(value: string | Date | null | undefined): number {
  const year = Number(dateOnly(value).slice(0, 4));
  return Number.isFinite(year) && year > 0 ? year : new Date().getFullYear();
}

function organizationSlugFromId(organizationId: string): string {
  const normalized = organizationId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return normalized || "gallery-015";
}

export async function ensureProductionOrganization(organizationId: string): Promise<void> {
  await prisma().organization.upsert({
    where: { id: organizationId },
    create: {
      id: organizationId,
      name: "Gallery 015",
      slug: organizationSlugFromId(organizationId),
      status: "active",
    },
    update: {},
  });
}

export async function getProductionOrganizationId(): Promise<string | null> {
  const configuredOrganizationId = process.env.GALLERY015_ADMIN_ORGANIZATION_ID?.trim();

  if (configuredOrganizationId) {
    return configuredOrganizationId;
  }

  try {
    const organization = await prisma().organization.findFirst({
      where: {
        status: "active",
        archivedAt: null,
        suspendedAt: null,
      },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    return organization?.id ?? null;
  } catch {
    return null;
  }
}

function failure(error: unknown, fallback: string): ProductionWriteFailure {
  const message = error instanceof Error ? error.message : fallback;
  return { ok: false, message };
}

function publicWhere(organizationId: string) {
  return {
    organizationId,
    archivedAt: null,
    visibilityStatus: publicVisibility,
  };
}

function adminWhere(organizationId: string) {
  return {
    organizationId,
    archivedAt: null,
  };
}

function toMedia(record: {
  readonly id: string;
  readonly filename: string;
  readonly originalFilename: string;
  readonly mimeType: string;
  readonly mediaType: string;
  readonly storagePath: string;
  readonly altText: string | null;
  readonly width: number | null;
  readonly height: number | null;
  readonly fileSize: number;
  readonly checksum: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}): Media {
  return {
    id: record.id,
    url: record.storagePath,
    alt_en: record.altText ?? record.originalFilename,
    alt_ar: record.altText ?? record.originalFilename,
    type: record.mediaType.toLowerCase(),
    mime_type: record.mimeType,
    width: record.width ?? undefined,
    height: record.height ?? undefined,
    file_size: record.fileSize,
    checksum: record.checksum ?? "",
    copyright: "Gallery 015",
    license: "Managed",
    storage_provider: "object_storage",
    storage_path: record.storagePath,
    created_at: iso(record.createdAt),
    updated_at: iso(record.updatedAt),
  };
}

function toCollection(record: {
  readonly id: string;
  readonly slug: string;
  readonly titleEn: string;
  readonly titleAr: string;
  readonly descriptionEn: string;
  readonly descriptionAr: string;
  readonly coverMediaId: string | null;
  readonly visibilityStatus: string;
  readonly featured?: boolean;
  readonly displayOrder?: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}): Collection {
  return {
    id: record.id,
    slug: record.slug,
    title_en: record.titleEn,
    title_ar: record.titleAr,
    description_en: record.descriptionEn,
    description_ar: record.descriptionAr,
    cover_media_id: record.coverMediaId,
    visibility_status: record.visibilityStatus as VisibilityStatus,
    created_at: iso(record.createdAt),
    updated_at: iso(record.updatedAt),
  };
}

function toExhibition(record: {
  readonly id: string;
  readonly slug: string;
  readonly titleEn: string;
  readonly titleAr: string;
  readonly descriptionEn: string;
  readonly descriptionAr: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly venueEn: string;
  readonly venueAr: string;
  readonly coverMediaId: string | null;
  readonly visibilityStatus: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}): Exhibition {
  return {
    id: record.id,
    slug: record.slug,
    title_en: record.titleEn,
    title_ar: record.titleAr,
    description_en: record.descriptionEn,
    description_ar: record.descriptionAr,
    start_date: dateOnly(record.startDate),
    end_date: dateOnly(record.endDate),
    venue_en: record.venueEn,
    venue_ar: record.venueAr,
    cover_media_id: record.coverMediaId,
    visibility_status: record.visibilityStatus as VisibilityStatus,
    created_at: iso(record.createdAt),
    updated_at: iso(record.updatedAt),
  };
}

function toProject(record: {
  readonly id: string;
  readonly slug: string;
  readonly titleEn: string;
  readonly titleAr: string;
  readonly descriptionEn: string;
  readonly descriptionAr: string;
  readonly clientEn: string | null;
  readonly clientAr: string | null;
  readonly type: string;
  readonly year: number;
  readonly status: string;
  readonly coverMediaId: string | null;
  readonly visibilityStatus: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}): Project {
  return {
    id: record.id,
    slug: record.slug,
    title_en: record.titleEn,
    title_ar: record.titleAr,
    description_en: record.descriptionEn,
    description_ar: record.descriptionAr,
    client_en: record.clientEn ?? undefined,
    client_ar: record.clientAr ?? undefined,
    type: record.type,
    year: record.year,
    status: record.status,
    cover_media_id: record.coverMediaId,
    visibility_status: record.visibilityStatus as VisibilityStatus,
    created_at: iso(record.createdAt),
    updated_at: iso(record.updatedAt),
  };
}

function toService(record: {
  readonly id: string;
  readonly slug: string;
  readonly titleEn: string;
  readonly titleAr: string;
  readonly descriptionEn: string;
  readonly descriptionAr: string;
  readonly featuresEn: unknown;
  readonly featuresAr: unknown;
  readonly priceInfo: unknown;
  readonly coverMediaId: string | null;
  readonly visibilityStatus: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}): Service {
  return {
    id: record.id,
    slug: record.slug,
    title_en: record.titleEn,
    title_ar: record.titleAr,
    description_en: record.descriptionEn,
    description_ar: record.descriptionAr,
    features_en: Array.isArray(record.featuresEn) ? record.featuresEn.map(String) : [],
    features_ar: Array.isArray(record.featuresAr) ? record.featuresAr.map(String) : [],
    price_info:
      typeof record.priceInfo === "object" && record.priceInfo !== null && !Array.isArray(record.priceInfo)
        ? (record.priceInfo as Record<string, unknown>)
        : undefined,
    cover_media_id: record.coverMediaId,
    visibility_status: record.visibilityStatus as VisibilityStatus,
    created_at: iso(record.createdAt),
    updated_at: iso(record.updatedAt),
  };
}

function toNews(record: {
  readonly id: string;
  readonly slug: string;
  readonly titleEn: string;
  readonly titleAr: string;
  readonly contentEn: string;
  readonly contentAr: string;
  readonly excerptEn: string;
  readonly excerptAr: string;
  readonly category: string;
  readonly publishDate: Date;
  readonly imageId: string | null;
  readonly visibilityStatus: string;
}): News {
  return {
    id: record.id,
    slug: record.slug,
    title_en: record.titleEn,
    title_ar: record.titleAr,
    content_en: record.contentEn,
    content_ar: record.contentAr,
    excerpt_en: record.excerptEn,
    excerpt_ar: record.excerptAr,
    category: record.category,
    publish_date: dateOnly(record.publishDate),
    image_id: record.imageId,
    visibility_status: record.visibilityStatus as VisibilityStatus,
  };
}

function toPublication(record: {
  readonly id: string;
  readonly slug: string;
  readonly titleEn: string;
  readonly titleAr: string;
  readonly descriptionEn: string;
  readonly descriptionAr: string;
  readonly type: string;
  readonly fileUrl: string;
  readonly coverImageId: string | null;
  readonly publishDate: Date;
  readonly visibilityStatus: string;
}): Publication {
  return {
    id: record.id,
    slug: record.slug,
    title_en: record.titleEn,
    title_ar: record.titleAr,
    description_en: record.descriptionEn,
    description_ar: record.descriptionAr,
    type: record.type,
    file_url: record.fileUrl,
    cover_image_id: record.coverImageId,
    publish_date: dateOnly(record.publishDate),
    visibility_status: record.visibilityStatus as VisibilityStatus,
  };
}

function toArtwork(record: {
  readonly id: string;
  readonly slug: string;
  readonly titleEn: string;
  readonly titleAr: string;
  readonly artistId: string;
  readonly collectionId: string | null;
  readonly yearCreated: number;
  readonly medium: string;
  readonly dimensions: string;
  readonly descriptionEn: string;
  readonly descriptionAr: string;
  readonly priceVisibility: string;
  readonly availabilityStatus: string;
  readonly visibilityStatus: string;
  readonly primaryMediaId: string;
  readonly featured: boolean;
  readonly displayOrder: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}): Artwork {
  return {
    id: record.id,
    slug: record.slug,
    title_en: record.titleEn,
    title_ar: record.titleAr,
    artist_id: record.artistId,
    collection_id: record.collectionId,
    year: record.yearCreated,
    medium_en: record.medium,
    medium_ar: record.medium,
    dimensions: record.dimensions,
    description_en: record.descriptionEn,
    description_ar: record.descriptionAr,
    currency: "SAR",
    price_status: record.priceVisibility as PriceStatus,
    availability_status: record.availabilityStatus as AvailabilityStatus,
    visibility_status: record.visibilityStatus as VisibilityStatus,
    primary_image_id: record.primaryMediaId,
    featured: record.featured,
    display_order: record.displayOrder,
    is_featured_homepage: record.featured,
    created_at: iso(record.createdAt),
    updated_at: iso(record.updatedAt),
  };
}

function toCertificate(record: {
  readonly id: string;
  readonly certificateNumber: string;
  readonly artworkId: string;
  readonly issuedDate: Date;
  readonly templateId: string | null;
  readonly qrCode: string | null;
  readonly verificationUrl: string;
  readonly status: string;
  readonly issuedBy: string;
  readonly approvedBy: string;
  readonly issuedVersion: number;
  readonly issuedAt: Date;
  readonly lastUpdated: Date;
}): Certificate {
  return {
    id: record.id,
    certificate_number: record.certificateNumber,
    artwork_id: record.artworkId,
    issued_date: dateOnly(record.issuedDate),
    template_id: record.templateId ?? "gallery-015-default-certificate",
    qr_code: record.qrCode ?? record.verificationUrl,
    verification_url: record.verificationUrl,
    status: record.status as CertificateStatus,
    issued_by: record.issuedBy,
    approved_by: record.approvedBy,
    issued_version: record.issuedVersion,
    issued_at: iso(record.issuedAt),
    last_updated: iso(record.lastUpdated),
  };
}


export interface MediaPersistenceInput {
  readonly filename: string;
  readonly originalFilename: string;
  readonly mimeType: string;
  readonly mediaType: keyof typeof MediaType;
  readonly storagePath: string;
  readonly altText?: string;
  readonly width?: number;
  readonly height?: number;
  readonly fileSize: number;
  readonly visibility: keyof typeof MediaVisibility;
  readonly checksum?: string;
}

export async function saveMediaRecord(
  input: MediaPersistenceInput,
  options: ProductionWriteOptions,
): Promise<ProductionWriteResult<Media>> {
  try {
    await ensureProductionOrganization(options.organizationId);
    const record = await prisma().media.create({
      data: {
        organizationId: options.organizationId,
        filename: input.filename,
        originalFilename: input.originalFilename,
        mimeType: input.mimeType,
        mediaType: MediaType[input.mediaType],
        storagePath: input.storagePath,
        altText: input.altText,
        width: input.width,
        height: input.height,
        fileSize: input.fileSize,
        visibility: MediaVisibility[input.visibility],
        checksum: input.checksum,
      },
    });
    return { ok: true, record: toMedia(record), message: "Media was saved to PostgreSQL." };
  } catch (error) {
    return failure(error, "Media PostgreSQL save did not complete.");
  }
}

export async function listMediaRecords(organizationId?: string): Promise<readonly Media[]> {
  const resolvedOrganizationId = organizationId ?? (await getProductionOrganizationId());
  if (!resolvedOrganizationId) return [];

  try {
    const records = await prisma().media.findMany({
      where: adminWhere(resolvedOrganizationId),
      orderBy: [{ updatedAt: "desc" }],
    });
    return records.map(toMedia);
  } catch {
    return [];
  }
}

export async function listPublicMediaRecords(organizationId?: string): Promise<readonly Media[]> {
  const resolvedOrganizationId = organizationId ?? (await getProductionOrganizationId());
  if (!resolvedOrganizationId) return [];

  try {
    const records = await prisma().media.findMany({
      where: {
        organizationId: resolvedOrganizationId,
        archivedAt: null,
        visibility: MediaVisibility.PUBLIC,
      },
      orderBy: [{ updatedAt: "desc" }],
    });
    return records.map(toMedia);
  } catch {
    return [];
  }
}

export async function findMediaRecord(mediaId: string | null | undefined, organizationId?: string): Promise<Media | null> {
  if (!mediaId) return null;
  const resolvedOrganizationId = organizationId ?? (await getProductionOrganizationId());
  if (!resolvedOrganizationId) return null;

  try {
    const record = await prisma().media.findFirst({
      where: { organizationId: resolvedOrganizationId, id: mediaId, archivedAt: null },
    });
    return record ? toMedia(record) : null;
  } catch {
    return null;
  }
}

export async function findPublicMediaRecord(
  mediaId: string | null | undefined,
  organizationId?: string,
): Promise<Media | null> {
  if (!mediaId) return null;
  const resolvedOrganizationId = organizationId ?? (await getProductionOrganizationId());
  if (!resolvedOrganizationId) return null;

  try {
    const record = await prisma().media.findFirst({
      where: {
        organizationId: resolvedOrganizationId,
        id: mediaId,
        archivedAt: null,
        visibility: MediaVisibility.PUBLIC,
      },
    });
    return record ? toMedia(record) : null;
  } catch {
    return null;
  }
}

export async function listCollectionRecords(organizationId: string): Promise<readonly Collection[]> {
  try {
    const records = await prisma().collection.findMany({
      where: adminWhere(organizationId),
      orderBy: [{ displayOrder: "asc" }, { updatedAt: "desc" }],
    });
    return records.map(toCollection);
  } catch {
    return [];
  }
}

export async function listPublicCollectionRecords(): Promise<readonly Collection[]> {
  const organizationId = await getProductionOrganizationId();
  return organizationId
    ? (await prisma().collection.findMany({
        where: publicWhere(organizationId),
        orderBy: [{ displayOrder: "asc" }, { updatedAt: "desc" }],
      })).map(toCollection)
    : [];
}

export interface PublicCollectionExperienceQueryRecord {
  readonly collection: {
    readonly id: string;
    readonly slug: string;
    readonly titleEn: string;
    readonly titleAr: string;
    readonly descriptionEn: string;
    readonly descriptionAr: string;
    readonly coverMediaId: string | null;
  };
  readonly artworks: readonly {
    readonly id: string;
    readonly slug: string;
    readonly titleEn: string;
    readonly titleAr: string;
    readonly yearCreated: number;
    readonly medium: string;
    readonly featured: boolean;
    readonly displayOrder: number;
    readonly updatedAt: string;
    readonly primaryMediaId: string;
    readonly artist: {
      readonly id: string;
      readonly slug: string;
      readonly nameEn: string;
      readonly nameAr: string;
      readonly featured: boolean;
      readonly displayOrder: number;
      readonly profileImageId: string | null;
    };
  }[];
  readonly exhibitions: readonly {
    readonly id: string;
    readonly slug: string;
    readonly titleEn: string;
    readonly titleAr: string;
    readonly venueEn: string;
    readonly startDate: string;
    readonly endDate: string;
    readonly displayOrder: number;
    readonly coverMediaId: string | null;
  }[];
  readonly media: readonly {
    readonly id: string;
    readonly storagePath: string;
    readonly altText: string | null;
    readonly width: number | null;
    readonly height: number | null;
  }[];
}

export async function findPublicCollectionExperienceQueryRecord(
  slug: string,
): Promise<PublicCollectionExperienceQueryRecord | null> {
  const organizationId = await getProductionOrganizationId();
  if (!organizationId) return null;

  const collection = await prisma().collection.findFirst({
    where: { ...publicWhere(organizationId), slug },
    select: {
      id: true,
      slug: true,
      titleEn: true,
      titleAr: true,
      descriptionEn: true,
      descriptionAr: true,
      coverMediaId: true,
    },
  });

  if (!collection) return null;

  const [artworks, exhibitionRelations] = await Promise.all([
    prisma().artwork.findMany({
      where: {
        ...publicWhere(organizationId),
        collectionId: collection.id,
        artist: {
          organizationId,
          archivedAt: null,
          visibilityStatus: publicVisibility,
        },
      },
      select: {
        id: true,
        slug: true,
        titleEn: true,
        titleAr: true,
        yearCreated: true,
        medium: true,
        featured: true,
        displayOrder: true,
        updatedAt: true,
        primaryMediaId: true,
        artist: {
          select: {
            id: true,
            slug: true,
            nameEn: true,
            nameAr: true,
            featured: true,
            displayOrder: true,
            profileImageId: true,
          },
        },
      },
    }),
    prisma().exhibitionArtwork.findMany({
      where: {
        organizationId,
        archivedAt: null,
        artwork: {
          organizationId,
          collectionId: collection.id,
          archivedAt: null,
          visibilityStatus: publicVisibility,
          artist: {
            organizationId,
            archivedAt: null,
            visibilityStatus: publicVisibility,
          },
        },
        exhibition: {
          organizationId,
          archivedAt: null,
          visibilityStatus: publicVisibility,
        },
      },
      select: {
        exhibition: {
          select: {
            id: true,
            slug: true,
            titleEn: true,
            titleAr: true,
            venueEn: true,
            startDate: true,
            endDate: true,
            displayOrder: true,
            coverMediaId: true,
          },
        },
      },
    }),
  ]);

  const exhibitionRecords = exhibitionRelations.map(({ exhibition }) => exhibition);
  const mediaIds = new Set<string>();
  if (collection.coverMediaId) mediaIds.add(collection.coverMediaId);
  artworks.forEach((artwork) => {
    mediaIds.add(artwork.primaryMediaId);
    if (artwork.artist.profileImageId) mediaIds.add(artwork.artist.profileImageId);
  });
  exhibitionRecords.forEach((exhibition) => {
    if (exhibition.coverMediaId) mediaIds.add(exhibition.coverMediaId);
  });

  const media = mediaIds.size
    ? await prisma().media.findMany({
        where: {
          organizationId,
          id: { in: Array.from(mediaIds) },
          archivedAt: null,
          visibility: MediaVisibility.PUBLIC,
        },
        select: {
          id: true,
          storagePath: true,
          altText: true,
          width: true,
          height: true,
        },
      })
    : [];

  return {
    collection,
    artworks: artworks.map((artwork) => ({
      ...artwork,
      updatedAt: iso(artwork.updatedAt),
    })),
    exhibitions: exhibitionRecords.map((exhibition) => ({
      ...exhibition,
      startDate: dateOnly(exhibition.startDate),
      endDate: dateOnly(exhibition.endDate),
    })),
    media,
  };
}

export async function findCollectionRecord(id: string, organizationId: string): Promise<Collection | null> {
  const record = await prisma().collection.findFirst({ where: { organizationId, id, archivedAt: null } });
  return record ? toCollection(record) : null;
}

export async function saveCollectionRecord(input: CollectionValidatedInput, options: ProductionWriteOptions & { id?: string }): Promise<ProductionWriteResult<Collection>> {
  try {
    await ensureProductionOrganization(options.organizationId);
    const now = options.now ? new Date(options.now) : new Date();
    const data = {
      slug: input.slug,
      titleEn: input.title_en,
      titleAr: input.title_ar,
      descriptionEn: input.description_en,
      descriptionAr: input.description_ar,
      coverMediaId: input.cover_media_id,
      visibilityStatus: input.visibility_status,
      updatedAt: now,
    };
    const record = options.id
      ? await prisma().collection.update({
          where: { organizationId_id: { organizationId: options.organizationId, id: options.id } },
          data,
        })
      : await prisma().collection.create({
          data: {
            id: `col-${randomUUID()}`,
            organizationId: options.organizationId,
            ...data,
            createdAt: now,
          },
        });
    return { ok: true, record: toCollection(record), message: options.id ? "Collection was updated in PostgreSQL." : "Collection was saved to PostgreSQL." };
  } catch (error) {
    return failure(error, "Collection PostgreSQL save did not complete.");
  }
}

export async function archiveCollectionRecord(id: string, options: ProductionWriteOptions): Promise<ProductionWriteResult<Collection>> {
  try {
    const now = options.now ? new Date(options.now) : new Date();
    const record = await prisma().collection.update({
      where: { organizationId_id: { organizationId: options.organizationId, id } },
      data: { visibilityStatus: VisibilityStatus.Hidden, archivedAt: now, updatedAt: now },
    });
    return { ok: true, record: toCollection(record), message: "Collection was archived in PostgreSQL." };
  } catch (error) {
    return failure(error, "Collection archive did not complete.");
  }
}

export async function listExhibitionRecords(organizationId: string): Promise<readonly Exhibition[]> {
  try {
    const records = await prisma().exhibition.findMany({
      where: adminWhere(organizationId),
      orderBy: [{ displayOrder: "asc" }, { startDate: "desc" }],
    });
    return records.map(toExhibition);
  } catch {
    return [];
  }
}

export async function listPublicExhibitionRecords(): Promise<readonly Exhibition[]> {
  const organizationId = await getProductionOrganizationId();
  return organizationId
    ? (await prisma().exhibition.findMany({
        where: publicWhere(organizationId),
        orderBy: [{ displayOrder: "asc" }, { startDate: "desc" }],
      })).map(toExhibition)
    : [];
}

export interface PublicExhibitionExperienceQueryRecord {
  readonly exhibition: {
    readonly id: string;
    readonly slug: string;
    readonly titleEn: string;
    readonly titleAr: string;
    readonly descriptionEn: string;
    readonly descriptionAr: string;
    readonly startDate: string;
    readonly endDate: string;
    readonly venueEn: string;
    readonly venueAr: string;
    readonly status: string;
    readonly coverMediaId: string | null;
  };
  readonly artists: readonly {
    readonly displayOrder: number;
    readonly role: string;
    readonly artist: {
      readonly id: string;
      readonly slug: string;
      readonly nameEn: string;
      readonly nameAr: string;
      readonly displayOrder: number;
      readonly profileImageId: string | null;
    };
  }[];
  readonly artworks: readonly {
    readonly displayOrder: number;
    readonly artwork: {
      readonly id: string;
      readonly slug: string;
      readonly titleEn: string;
      readonly titleAr: string;
      readonly yearCreated: number;
      readonly medium: string;
      readonly displayOrder: number;
      readonly updatedAt: string;
      readonly primaryMediaId: string;
      readonly collectionId: string | null;
      readonly artist: {
        readonly id: string;
        readonly slug: string;
        readonly nameEn: string;
        readonly nameAr: string;
      };
    };
  }[];
  readonly collections: readonly {
    readonly id: string;
    readonly slug: string;
    readonly titleEn: string;
    readonly titleAr: string;
    readonly coverMediaId: string | null;
  }[];
  readonly media: readonly {
    readonly id: string;
    readonly storagePath: string;
    readonly altText: string | null;
    readonly width: number | null;
    readonly height: number | null;
  }[];
}

export async function findPublicExhibitionExperienceQueryRecord(
  slug: string,
): Promise<PublicExhibitionExperienceQueryRecord | null> {
  const organizationId = await getProductionOrganizationId();
  if (!organizationId) return null;

  const exhibition = await prisma().exhibition.findFirst({
    where: { ...publicWhere(organizationId), slug },
    select: {
      id: true,
      slug: true,
      titleEn: true,
      titleAr: true,
      descriptionEn: true,
      descriptionAr: true,
      startDate: true,
      endDate: true,
      venueEn: true,
      venueAr: true,
      status: true,
      coverMediaId: true,
    },
  });

  if (!exhibition) return null;

  const [artistRelations, artworkRelations] = await Promise.all([
    prisma().exhibitionArtist.findMany({
      where: {
        organizationId,
        exhibitionId: exhibition.id,
        archivedAt: null,
        artist: {
          organizationId,
          archivedAt: null,
          visibilityStatus: publicVisibility,
        },
      },
      select: {
        displayOrder: true,
        role: true,
        artist: {
          select: {
            id: true,
            slug: true,
            nameEn: true,
            nameAr: true,
            displayOrder: true,
            profileImageId: true,
          },
        },
      },
    }),
    prisma().exhibitionArtwork.findMany({
      where: {
        organizationId,
        exhibitionId: exhibition.id,
        archivedAt: null,
        artwork: {
          organizationId,
          archivedAt: null,
          visibilityStatus: publicVisibility,
          artist: {
            organizationId,
            archivedAt: null,
            visibilityStatus: publicVisibility,
          },
        },
      },
      select: {
        displayOrder: true,
        artwork: {
          select: {
            id: true,
            slug: true,
            titleEn: true,
            titleAr: true,
            yearCreated: true,
            medium: true,
            displayOrder: true,
            updatedAt: true,
            primaryMediaId: true,
            collectionId: true,
            artist: {
              select: {
                id: true,
                slug: true,
                nameEn: true,
                nameAr: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const collectionIds = new Set<string>();
  artworkRelations.forEach(({ artwork }) => {
    if (artwork.collectionId) collectionIds.add(artwork.collectionId);
  });

  const collections = collectionIds.size
    ? await prisma().collection.findMany({
        where: {
          ...publicWhere(organizationId),
          id: { in: Array.from(collectionIds) },
        },
        select: {
          id: true,
          slug: true,
          titleEn: true,
          titleAr: true,
          coverMediaId: true,
        },
      })
    : [];

  const mediaIds = new Set<string>();
  if (exhibition.coverMediaId) mediaIds.add(exhibition.coverMediaId);
  artistRelations.forEach(({ artist }) => {
    if (artist.profileImageId) mediaIds.add(artist.profileImageId);
  });
  artworkRelations.forEach(({ artwork }) => mediaIds.add(artwork.primaryMediaId));
  collections.forEach((collection) => {
    if (collection.coverMediaId) mediaIds.add(collection.coverMediaId);
  });

  const media = mediaIds.size
    ? await prisma().media.findMany({
        where: {
          organizationId,
          id: { in: Array.from(mediaIds) },
          archivedAt: null,
          visibility: MediaVisibility.PUBLIC,
        },
        select: {
          id: true,
          storagePath: true,
          altText: true,
          width: true,
          height: true,
        },
      })
    : [];

  return {
    exhibition: {
      ...exhibition,
      startDate: dateOnly(exhibition.startDate),
      endDate: dateOnly(exhibition.endDate),
    },
    artists: artistRelations,
    artworks: artworkRelations.map((relation) => ({
      displayOrder: relation.displayOrder,
      artwork: {
        ...relation.artwork,
        updatedAt: iso(relation.artwork.updatedAt),
      },
    })),
    collections,
    media,
  };
}

export async function findExhibitionRecord(id: string, organizationId: string): Promise<Exhibition | null> {
  const record = await prisma().exhibition.findFirst({ where: { organizationId, id, archivedAt: null } });
  return record ? toExhibition(record) : null;
}

export interface ExhibitionRelationshipSelection {
  readonly artistIds: readonly string[];
  readonly artworkIds: readonly string[];
}

export async function getExhibitionRelationshipSelection(
  exhibitionId: string,
  organizationId: string,
): Promise<ExhibitionRelationshipSelection> {
  try {
    const [artistRelations, artworkRelations] = await Promise.all([
      prisma().exhibitionArtist.findMany({
        where: {
          organizationId,
          exhibitionId,
          archivedAt: null,
          artist: {
            organizationId,
            archivedAt: null,
            visibilityStatus: VisibilityStatus.Public,
          },
        },
        orderBy: [{ displayOrder: "asc" }, { addedAt: "asc" }],
        select: { artistId: true },
      }),
      prisma().exhibitionArtwork.findMany({
        where: {
          organizationId,
          exhibitionId,
          archivedAt: null,
          artwork: {
            organizationId,
            archivedAt: null,
            visibilityStatus: VisibilityStatus.Public,
            artist: {
              organizationId,
              archivedAt: null,
              visibilityStatus: VisibilityStatus.Public,
            },
          },
        },
        orderBy: [{ displayOrder: "asc" }, { addedAt: "asc" }],
        select: { artworkId: true },
      }),
    ]);

    return {
      artistIds: artistRelations.map((relation) => relation.artistId),
      artworkIds: artworkRelations.map((relation) => relation.artworkId),
    };
  } catch {
    return {
      artistIds: [],
      artworkIds: [],
    };
  }
}

export interface ExhibitionRelationshipSaveInput {
  readonly artistIds?: readonly string[];
  readonly artworkIds?: readonly string[];
}

function uniqueIds(ids: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];

  ids.forEach((id) => {
    if (!seen.has(id)) {
      seen.add(id);
      ordered.push(id);
    }
  });

  return ordered;
}

async function syncExhibitionArtistRelations(
  exhibitionId: string,
  organizationId: string,
  artistIds: readonly string[],
): Promise<ProductionWriteFailure | null> {
  const nextArtistIds = uniqueIds(artistIds);

  if (nextArtistIds.length > 0) {
    const validArtists = await prisma().artist.findMany({
      where: {
        organizationId,
        id: { in: [...nextArtistIds] },
        archivedAt: null,
        visibilityStatus: VisibilityStatus.Public,
      },
      select: { id: true },
    });

    const validArtistIdSet = new Set(validArtists.map((artist) => artist.id));
    const invalidArtistIds = nextArtistIds.filter((artistId) => !validArtistIdSet.has(artistId));

    if (invalidArtistIds.length > 0) {
      return {
        ok: false,
        message: "Exhibition relationship save failed. One or more selected artists are invalid, archived, private, or belong to another organization.",
        details: invalidArtistIds,
      };
    }
  }

  const now = new Date();

  await Promise.all(
    nextArtistIds.map((artistId, index) =>
      prisma().exhibitionArtist.upsert({
        where: {
          organizationId_exhibitionId_artistId: {
            organizationId,
            exhibitionId,
            artistId,
          },
        },
        update: {
          archivedAt: null,
          displayOrder: index,
          role: "artist",
          updatedAt: now,
        },
        create: {
          organizationId,
          exhibitionId,
          artistId,
          role: "artist",
          displayOrder: index,
        },
      }),
    ),
  );

  await prisma().exhibitionArtist.updateMany({
    where: {
      organizationId,
      exhibitionId,
      archivedAt: null,
      ...(nextArtistIds.length > 0 ? { artistId: { notIn: [...nextArtistIds] } } : {}),
    },
    data: {
      archivedAt: now,
      updatedAt: now,
    },
  });

  return null;
}

async function syncExhibitionArtworkRelations(
  exhibitionId: string,
  organizationId: string,
  artworkIds: readonly string[],
): Promise<ProductionWriteFailure | null> {
  const nextArtworkIds = uniqueIds(artworkIds);

  if (nextArtworkIds.length > 0) {
    const validArtworks = await prisma().artwork.findMany({
      where: {
        organizationId,
        id: { in: [...nextArtworkIds] },
        archivedAt: null,
        visibilityStatus: VisibilityStatus.Public,
        artist: {
          organizationId,
          archivedAt: null,
          visibilityStatus: VisibilityStatus.Public,
        },
      },
      select: { id: true },
    });

    const validArtworkIdSet = new Set(validArtworks.map((artwork) => artwork.id));
    const invalidArtworkIds = nextArtworkIds.filter((artworkId) => !validArtworkIdSet.has(artworkId));

    if (invalidArtworkIds.length > 0) {
      return {
        ok: false,
        message: "Exhibition relationship save failed. One or more selected artworks are invalid, archived, private, or belong to another organization.",
        details: invalidArtworkIds,
      };
    }
  }

  const now = new Date();

  await Promise.all(
    nextArtworkIds.map((artworkId, index) =>
      prisma().exhibitionArtwork.upsert({
        where: {
          organizationId_exhibitionId_artworkId: {
            organizationId,
            exhibitionId,
            artworkId,
          },
        },
        update: {
          archivedAt: null,
          displayOrder: index,
          updatedAt: now,
        },
        create: {
          organizationId,
          exhibitionId,
          artworkId,
          displayOrder: index,
        },
      }),
    ),
  );

  await prisma().exhibitionArtwork.updateMany({
    where: {
      organizationId,
      exhibitionId,
      archivedAt: null,
      ...(nextArtworkIds.length > 0 ? { artworkId: { notIn: [...nextArtworkIds] } } : {}),
    },
    data: {
      archivedAt: now,
      updatedAt: now,
    },
  });

  return null;
}

export async function saveExhibitionRecord(
  input: ExhibitionValidatedInput,
  options: ProductionWriteOptions & { id?: string; relationships?: ExhibitionRelationshipSaveInput },
): Promise<ProductionWriteResult<Exhibition>> {
  try {
    await ensureProductionOrganization(options.organizationId);
    const now = options.now ? new Date(options.now) : new Date();
    const data = {
      slug: input.slug,
      titleEn: input.title_en,
      titleAr: input.title_ar,
      descriptionEn: input.description_en,
      descriptionAr: input.description_ar,
      startDate: new Date(input.start_date),
      endDate: new Date(input.end_date),
      venueEn: input.venue_en,
      venueAr: input.venue_ar,
      coverMediaId: input.cover_media_id,
      status: "planned",
      visibilityStatus: input.visibility_status,
      updatedAt: now,
    };
    const record = options.id
      ? await prisma().exhibition.update({
          where: { organizationId_id: { organizationId: options.organizationId, id: options.id } },
          data,
        })
      : await prisma().exhibition.create({
          data: {
            id: `exh-${randomUUID()}`,
            organizationId: options.organizationId,
            ...data,
            createdAt: now,
          },
        });

    if (options.relationships?.artistIds) {
      const artistSyncFailure = await syncExhibitionArtistRelations(
        record.id,
        options.organizationId,
        options.relationships.artistIds,
      );

      if (artistSyncFailure) {
        return artistSyncFailure;
      }
    }

    if (options.relationships?.artworkIds) {
      const artworkSyncFailure = await syncExhibitionArtworkRelations(
        record.id,
        options.organizationId,
        options.relationships.artworkIds,
      );

      if (artworkSyncFailure) {
        return artworkSyncFailure;
      }
    }

    return { ok: true, record: toExhibition(record), message: options.id ? "Exhibition was updated in PostgreSQL." : "Exhibition was saved to PostgreSQL." };
  } catch (error) {
    return failure(error, "Exhibition PostgreSQL save did not complete.");
  }
}

export async function archiveExhibitionRecord(id: string, options: ProductionWriteOptions): Promise<ProductionWriteResult<Exhibition>> {
  try {
    const now = options.now ? new Date(options.now) : new Date();
    const record = await prisma().exhibition.update({
      where: { organizationId_id: { organizationId: options.organizationId, id } },
      data: { visibilityStatus: VisibilityStatus.Hidden, archivedAt: now, updatedAt: now },
    });
    return { ok: true, record: toExhibition(record), message: "Exhibition was archived in PostgreSQL." };
  } catch (error) {
    return failure(error, "Exhibition archive did not complete.");
  }
}

export async function listProjectRecords(organizationId: string): Promise<readonly Project[]> {
  try {
    const records = await prisma().project.findMany({
      where: adminWhere(organizationId),
      orderBy: [{ displayOrder: "asc" }, { year: "desc" }],
    });
    return records.map(toProject);
  } catch {
    return [];
  }
}

export async function listPublicProjectRecords(): Promise<readonly Project[]> {
  const organizationId = await getProductionOrganizationId();
  return organizationId
    ? (await prisma().project.findMany({
        where: publicWhere(organizationId),
        orderBy: [{ displayOrder: "asc" }, { year: "desc" }],
      })).map(toProject)
    : [];
}

export interface PublicProjectExperienceQueryRecord {
  readonly project: {
    readonly id: string;
    readonly slug: string;
    readonly titleEn: string;
    readonly titleAr: string;
    readonly descriptionEn: string;
    readonly descriptionAr: string;
    readonly clientEn: string | null;
    readonly clientAr: string | null;
    readonly type: string;
    readonly year: number;
    readonly status: string;
    readonly coverMediaId: string | null;
  };
  readonly media: readonly {
    readonly displayOrder: number;
    readonly createdAt: string;
    readonly role: string;
    readonly media: {
      readonly id: string;
      readonly storagePath: string;
      readonly altText: string | null;
      readonly width: number | null;
      readonly height: number | null;
    };
  }[];
  readonly artists: readonly {
    readonly displayOrder: number;
    readonly role: string;
    readonly artist: {
      readonly id: string;
      readonly slug: string;
      readonly nameEn: string;
      readonly nameAr: string;
      readonly displayOrder: number;
      readonly profileImageId: string | null;
    };
  }[];
  readonly artworks: readonly {
    readonly displayOrder: number;
    readonly inclusionNote: string | null;
    readonly artwork: {
      readonly id: string;
      readonly slug: string;
      readonly titleEn: string;
      readonly titleAr: string;
      readonly yearCreated: number;
      readonly medium: string;
      readonly displayOrder: number;
      readonly updatedAt: string;
      readonly primaryMediaId: string;
      readonly collectionId: string | null;
      readonly artist: {
        readonly id: string;
        readonly slug: string;
        readonly nameEn: string;
        readonly nameAr: string;
      };
    };
  }[];
  readonly collections: readonly {
    readonly id: string;
    readonly slug: string;
    readonly titleEn: string;
    readonly titleAr: string;
    readonly coverMediaId: string | null;
  }[];
  readonly assets: readonly {
    readonly id: string;
    readonly storagePath: string;
    readonly altText: string | null;
    readonly width: number | null;
    readonly height: number | null;
  }[];
}

export async function findPublicProjectExperienceQueryRecord(
  slug: string,
): Promise<PublicProjectExperienceQueryRecord | null> {
  const organizationId = await getProductionOrganizationId();
  if (!organizationId) return null;

  const project = await prisma().project.findFirst({
    where: { ...publicWhere(organizationId), slug },
    select: {
      id: true,
      slug: true,
      titleEn: true,
      titleAr: true,
      descriptionEn: true,
      descriptionAr: true,
      clientEn: true,
      clientAr: true,
      type: true,
      year: true,
      status: true,
      coverMediaId: true,
    },
  });

  if (!project) return null;

  const [projectMedia, artistRelations, artworkRelations] = await Promise.all([
    prisma().projectMedia.findMany({
      where: {
        organizationId,
        projectId: project.id,
        archivedAt: null,
        media: { organizationId, archivedAt: null, visibility: MediaVisibility.PUBLIC },
      },
      select: {
        displayOrder: true,
        createdAt: true,
        role: true,
        media: { select: { id: true, storagePath: true, altText: true, width: true, height: true } },
      },
    }),
    prisma().projectArtist.findMany({
      where: {
        organizationId,
        projectId: project.id,
        archivedAt: null,
        artist: { organizationId, archivedAt: null, visibilityStatus: publicVisibility },
      },
      select: {
        displayOrder: true,
        role: true,
        artist: {
          select: {
            id: true,
            slug: true,
            nameEn: true,
            nameAr: true,
            displayOrder: true,
            profileImageId: true,
          },
        },
      },
    }),
    prisma().projectArtwork.findMany({
      where: {
        organizationId,
        projectId: project.id,
        archivedAt: null,
        artwork: {
          organizationId,
          archivedAt: null,
          visibilityStatus: publicVisibility,
          artist: { organizationId, archivedAt: null, visibilityStatus: publicVisibility },
        },
      },
      select: {
        displayOrder: true,
        inclusionNote: true,
        artwork: {
          select: {
            id: true,
            slug: true,
            titleEn: true,
            titleAr: true,
            yearCreated: true,
            medium: true,
            displayOrder: true,
            updatedAt: true,
            primaryMediaId: true,
            collectionId: true,
            artist: { select: { id: true, slug: true, nameEn: true, nameAr: true } },
          },
        },
      },
    }),
  ]);

  const collectionIds = new Set<string>();
  artworkRelations.forEach(({ artwork }) => {
    if (artwork.collectionId) collectionIds.add(artwork.collectionId);
  });

  const collections = collectionIds.size
    ? await prisma().collection.findMany({
        where: { ...publicWhere(organizationId), id: { in: Array.from(collectionIds) } },
        select: { id: true, slug: true, titleEn: true, titleAr: true, coverMediaId: true },
      })
    : [];

  const mediaIds = new Set<string>();
  if (project.coverMediaId) mediaIds.add(project.coverMediaId);
  artistRelations.forEach(({ artist }) => {
    if (artist.profileImageId) mediaIds.add(artist.profileImageId);
  });
  artworkRelations.forEach(({ artwork }) => mediaIds.add(artwork.primaryMediaId));
  collections.forEach((collection) => {
    if (collection.coverMediaId) mediaIds.add(collection.coverMediaId);
  });

  const assets = mediaIds.size
    ? await prisma().media.findMany({
        where: {
          organizationId,
          id: { in: Array.from(mediaIds) },
          archivedAt: null,
          visibility: MediaVisibility.PUBLIC,
        },
        select: { id: true, storagePath: true, altText: true, width: true, height: true },
      })
    : [];

  return {
    project,
    media: projectMedia.map((relation) => ({
      ...relation,
      createdAt: iso(relation.createdAt),
    })),
    artists: artistRelations,
    artworks: artworkRelations.map((relation) => ({
      displayOrder: relation.displayOrder,
      inclusionNote: relation.inclusionNote,
      artwork: { ...relation.artwork, updatedAt: iso(relation.artwork.updatedAt) },
    })),
    collections,
    assets,
  };
}

export async function findProjectRecord(id: string, organizationId: string): Promise<Project | null> {
  const record = await prisma().project.findFirst({ where: { organizationId, id, archivedAt: null } });
  return record ? toProject(record) : null;
}

export async function saveProjectRecord(input: ProjectValidatedInput, options: ProductionWriteOptions & { id?: string }): Promise<ProductionWriteResult<Project>> {
  try {
    await ensureProductionOrganization(options.organizationId);
    const now = options.now ? new Date(options.now) : new Date();
    const data = {
      slug: input.slug,
      titleEn: input.title_en,
      titleAr: input.title_ar,
      descriptionEn: input.description_en,
      descriptionAr: input.description_ar,
      clientEn: input.client || null,
      clientAr: input.location || null,
      type: input.location || "gallery-project",
      year: yearFromDate(input.completion_date),
      status: input.status,
      coverMediaId: input.cover_media_id,
      visibilityStatus: input.visibility_status,
      updatedAt: now,
    };
    const record = options.id
      ? await prisma().project.update({
          where: { organizationId_id: { organizationId: options.organizationId, id: options.id } },
          data,
        })
      : await prisma().project.create({
          data: {
            id: `prj-${randomUUID()}`,
            organizationId: options.organizationId,
            ...data,
            createdAt: now,
          },
        });
    return { ok: true, record: toProject(record), message: options.id ? "Project was updated in PostgreSQL." : "Project was saved to PostgreSQL." };
  } catch (error) {
    return failure(error, "Project PostgreSQL save did not complete.");
  }
}

export async function archiveProjectRecord(id: string, options: ProductionWriteOptions): Promise<ProductionWriteResult<Project>> {
  try {
    const now = options.now ? new Date(options.now) : new Date();
    const record = await prisma().project.update({
      where: { organizationId_id: { organizationId: options.organizationId, id } },
      data: { visibilityStatus: VisibilityStatus.Hidden, archivedAt: now, updatedAt: now },
    });
    return { ok: true, record: toProject(record), message: "Project was archived in PostgreSQL." };
  } catch (error) {
    return failure(error, "Project archive did not complete.");
  }
}

export async function listServiceRecords(organizationId: string): Promise<readonly Service[]> {
  try {
    const records = await prisma().service.findMany({
      where: adminWhere(organizationId),
      orderBy: [{ displayOrder: "asc" }, { updatedAt: "desc" }],
    });
    return records.map(toService);
  } catch {
    return [];
  }
}

export async function listPublicServiceRecords(): Promise<readonly Service[]> {
  const organizationId = await getProductionOrganizationId();
  return organizationId
    ? (await prisma().service.findMany({
        where: publicWhere(organizationId),
        orderBy: [{ displayOrder: "asc" }, { updatedAt: "desc" }],
      })).map(toService)
    : [];
}

export async function findServiceRecord(id: string, organizationId: string): Promise<Service | null> {
  const record = await prisma().service.findFirst({ where: { organizationId, id, archivedAt: null } });
  return record ? toService(record) : null;
}

export async function saveServiceRecord(input: ServiceValidatedInput, options: ProductionWriteOptions & { id?: string }): Promise<ProductionWriteResult<Service>> {
  try {
    await ensureProductionOrganization(options.organizationId);
    const now = options.now ? new Date(options.now) : new Date();
    const data = {
      slug: input.slug,
      titleEn: input.title_en,
      titleAr: input.title_ar,
      descriptionEn: input.description_en,
      descriptionAr: input.description_ar,
      featuresEn: [...input.features_en],
      featuresAr: [...input.features_ar],
      priceInfo: input.price_info as Prisma.InputJsonValue,
      coverMediaId: input.cover_media_id,
      visibilityStatus: input.visibility_status,
      updatedAt: now,
    };
    const record = options.id
      ? await prisma().service.update({
          where: { organizationId_id: { organizationId: options.organizationId, id: options.id } },
          data,
        })
      : await prisma().service.create({
          data: {
            id: `svc-${randomUUID()}`,
            organizationId: options.organizationId,
            ...data,
            createdAt: now,
          },
        });
    return { ok: true, record: toService(record), message: options.id ? "Service was updated in PostgreSQL." : "Service was saved to PostgreSQL." };
  } catch (error) {
    return failure(error, "Service PostgreSQL save did not complete.");
  }
}

export async function archiveServiceRecord(id: string, options: ProductionWriteOptions): Promise<ProductionWriteResult<Service>> {
  try {
    const now = options.now ? new Date(options.now) : new Date();
    const record = await prisma().service.update({
      where: { organizationId_id: { organizationId: options.organizationId, id } },
      data: { visibilityStatus: VisibilityStatus.Hidden, archivedAt: now, updatedAt: now },
    });
    return { ok: true, record: toService(record), message: "Service was archived in PostgreSQL." };
  } catch (error) {
    return failure(error, "Service archive did not complete.");
  }
}

export async function listNewsRecords(organizationId: string): Promise<readonly News[]> {
  try {
    const records = await prisma().news.findMany({
      where: adminWhere(organizationId),
      orderBy: [{ displayOrder: "asc" }, { publishDate: "desc" }],
    });
    return records.map(toNews);
  } catch {
    return [];
  }
}

export async function listPublicNewsRecords(): Promise<readonly News[]> {
  const organizationId = await getProductionOrganizationId();
  return organizationId
    ? (await prisma().news.findMany({
        where: publicWhere(organizationId),
        orderBy: [{ displayOrder: "asc" }, { publishDate: "desc" }],
      })).map(toNews)
    : [];
}

export async function findNewsRecord(id: string, organizationId: string): Promise<News | null> {
  const record = await prisma().news.findFirst({ where: { organizationId, id, archivedAt: null } });
  return record ? toNews(record) : null;
}

export async function saveNewsRecord(input: NewsValidatedInput, options: ProductionWriteOptions & { id?: string }): Promise<ProductionWriteResult<News>> {
  try {
    await ensureProductionOrganization(options.organizationId);
    const now = options.now ? new Date(options.now) : new Date();
    const data = {
      slug: input.slug,
      titleEn: input.title_en,
      titleAr: input.title_ar,
      contentEn: input.content_en,
      contentAr: input.content_ar,
      excerptEn: input.excerpt_en,
      excerptAr: input.excerpt_ar,
      category: input.category,
      publishDate: new Date(input.publish_date),
      imageId: input.image_id,
      visibilityStatus: input.visibility_status,
      updatedAt: now,
    };
    const record = options.id
      ? await prisma().news.update({
          where: { organizationId_id: { organizationId: options.organizationId, id: options.id } },
          data,
        })
      : await prisma().news.create({
          data: {
            id: `news-${randomUUID()}`,
            organizationId: options.organizationId,
            ...data,
            createdAt: now,
          },
        });
    return { ok: true, record: toNews(record), message: options.id ? "News item was updated in PostgreSQL." : "News item was saved to PostgreSQL." };
  } catch (error) {
    return failure(error, "News PostgreSQL save did not complete.");
  }
}

export async function archiveNewsRecord(id: string, options: ProductionWriteOptions): Promise<ProductionWriteResult<News>> {
  try {
    const now = options.now ? new Date(options.now) : new Date();
    const record = await prisma().news.update({
      where: { organizationId_id: { organizationId: options.organizationId, id } },
      data: { visibilityStatus: VisibilityStatus.Hidden, archivedAt: now, updatedAt: now },
    });
    return { ok: true, record: toNews(record), message: "News item was archived in PostgreSQL." };
  } catch (error) {
    return failure(error, "News archive did not complete.");
  }
}

export async function listPublicationRecords(organizationId: string): Promise<readonly Publication[]> {
  try {
    const records = await prisma().publication.findMany({
      where: adminWhere(organizationId),
      orderBy: [{ displayOrder: "asc" }, { publishDate: "desc" }],
    });
    return records.map(toPublication);
  } catch {
    return [];
  }
}

export async function listPublicPublicationRecords(): Promise<readonly Publication[]> {
  const organizationId = await getProductionOrganizationId();
  return organizationId
    ? (await prisma().publication.findMany({
        where: publicWhere(organizationId),
        orderBy: [{ displayOrder: "asc" }, { publishDate: "desc" }],
      })).map(toPublication)
    : [];
}

export async function findPublicationRecord(id: string, organizationId: string): Promise<Publication | null> {
  const record = await prisma().publication.findFirst({ where: { organizationId, id, archivedAt: null } });
  return record ? toPublication(record) : null;
}

export async function savePublicationRecord(input: PublicationValidatedInput, options: ProductionWriteOptions & { id?: string }): Promise<ProductionWriteResult<Publication>> {
  try {
    await ensureProductionOrganization(options.organizationId);
    const now = options.now ? new Date(options.now) : new Date();
    const data = {
      slug: input.slug,
      titleEn: input.title_en,
      titleAr: input.title_ar,
      descriptionEn: input.description_en,
      descriptionAr: input.description_ar,
      type: input.type,
      fileUrl: input.file_url,
      coverImageId: input.cover_image_id,
      publishDate: new Date(input.publish_date),
      visibilityStatus: input.visibility_status,
      updatedAt: now,
    };
    const record = options.id
      ? await prisma().publication.update({
          where: { organizationId_id: { organizationId: options.organizationId, id: options.id } },
          data,
        })
      : await prisma().publication.create({
          data: {
            id: `pub-${randomUUID()}`,
            organizationId: options.organizationId,
            ...data,
            createdAt: now,
          },
        });
    return { ok: true, record: toPublication(record), message: options.id ? "Publication was updated in PostgreSQL." : "Publication was saved to PostgreSQL." };
  } catch (error) {
    return failure(error, "Publication PostgreSQL save did not complete.");
  }
}

export async function archivePublicationRecord(id: string, options: ProductionWriteOptions): Promise<ProductionWriteResult<Publication>> {
  try {
    const now = options.now ? new Date(options.now) : new Date();
    const record = await prisma().publication.update({
      where: { organizationId_id: { organizationId: options.organizationId, id } },
      data: { visibilityStatus: VisibilityStatus.Hidden, archivedAt: now, updatedAt: now },
    });
    return { ok: true, record: toPublication(record), message: "Publication was archived in PostgreSQL." };
  } catch (error) {
    return failure(error, "Publication archive did not complete.");
  }
}

export async function listArtworkRecords(organizationId: string): Promise<readonly Artwork[]> {
  try {
    const records = await prisma().artwork.findMany({
      where: adminWhere(organizationId),
      orderBy: [{ displayOrder: "asc" }, { updatedAt: "desc" }],
    });
    return records.map(toArtwork);
  } catch {
    return [];
  }
}

export async function listPublicArtworkRecords(options: { readonly featuredOnly?: boolean } = {}): Promise<readonly Artwork[]> {
  const organizationId = await getProductionOrganizationId();
  return organizationId
    ? (await prisma().artwork.findMany({
        where: {
          ...publicWhere(organizationId),
          ...(options.featuredOnly ? { featured: true } : {}),
        },
        orderBy: [{ displayOrder: "asc" }, { updatedAt: "desc" }],
      })).map(toArtwork)
    : [];
}

export async function findArtworkRecord(id: string, organizationId: string): Promise<Artwork | null> {
  const record = await prisma().artwork.findFirst({ where: { organizationId, id, archivedAt: null } });
  return record ? toArtwork(record) : null;
}

export async function findPublicArtworkRecordBySlug(slug: string): Promise<Artwork | null> {
  const organizationId = await getProductionOrganizationId();
  if (!organizationId) return null;
  const record = await prisma().artwork.findFirst({ where: { ...publicWhere(organizationId), slug } });
  return record ? toArtwork(record) : null;
}

export interface PublicArtworkExperienceQueryRecord {
  readonly artwork: {
    readonly id: string;
    readonly slug: string;
    readonly titleEn: string;
    readonly titleAr: string;
    readonly descriptionEn: string;
    readonly descriptionAr: string;
    readonly yearCreated: number;
    readonly medium: string;
    readonly dimensions: string;
    readonly availabilityStatus: string;
    readonly priceVisibility: string;
    readonly featured: boolean;
    readonly artistId: string;
    readonly collectionId: string | null;
  };
  readonly artist: {
    readonly id: string;
    readonly slug: string;
    readonly nameEn: string;
    readonly nameAr: string;
  };
  readonly collection: {
    readonly id: string;
    readonly slug: string;
    readonly titleEn: string;
    readonly titleAr: string;
  } | null;
  readonly exhibitions: readonly {
    readonly displayOrder: number;
    readonly exhibition: {
      readonly id: string;
      readonly slug: string;
      readonly titleEn: string;
      readonly titleAr: string;
      readonly venueEn: string;
      readonly startDate: string;
      readonly endDate: string;
    };
  }[];
  readonly projects: readonly {
    readonly displayOrder: number;
    readonly project: {
      readonly id: string;
      readonly slug: string;
      readonly titleEn: string;
      readonly titleAr: string;
      readonly type: string;
      readonly year: number;
    };
  }[];
  readonly relatedWorks: readonly {
    readonly id: string;
    readonly slug: string;
    readonly titleEn: string;
    readonly titleAr: string;
    readonly yearCreated: number;
    readonly medium: string;
    readonly artistId: string;
    readonly collectionId: string | null;
    readonly featured: boolean;
    readonly displayOrder: number;
    readonly updatedAt: string;
    readonly artist: {
      readonly id: string;
      readonly slug: string;
      readonly nameEn: string;
    };
    readonly primaryMedia: {
      readonly id: string;
      readonly storagePath: string;
      readonly altText: string | null;
      readonly width: number | null;
      readonly height: number | null;
    };
  }[];
  readonly primaryMedia: {
    readonly id: string;
    readonly storagePath: string;
    readonly altText: string | null;
    readonly width: number | null;
    readonly height: number | null;
  } | null;
}

export async function findPublicArtworkExperienceQueryRecord(
  slug: string,
): Promise<PublicArtworkExperienceQueryRecord | null> {
  const organizationId = await getProductionOrganizationId();
  if (!organizationId) return null;

  const artwork = await prisma().artwork.findFirst({
    where: {
      ...publicWhere(organizationId),
      slug,
      artist: {
        organizationId,
        archivedAt: null,
        visibilityStatus: publicVisibility,
      },
    },
    select: {
      id: true,
      slug: true,
      titleEn: true,
      titleAr: true,
      descriptionEn: true,
      descriptionAr: true,
      yearCreated: true,
      medium: true,
      dimensions: true,
      availabilityStatus: true,
      priceVisibility: true,
      featured: true,
      collectionId: true,
      primaryMediaId: true,
      artistId: true,
      artist: {
        select: {
          id: true,
          slug: true,
          nameEn: true,
          nameAr: true,
        },
      },
    },
  });

  if (!artwork) return null;

  const relatedScopes: Prisma.ArtworkWhereInput[] = [
    { artistId: artwork.artistId },
    { featured: true },
  ];
  if (artwork.collectionId) relatedScopes.unshift({ collectionId: artwork.collectionId });

  const [collection, exhibitionRelations, projectRelations, relatedWorks, primaryMedia] = await Promise.all([
    artwork.collectionId
      ? prisma().collection.findFirst({
          where: { ...publicWhere(organizationId), id: artwork.collectionId },
          select: { id: true, slug: true, titleEn: true, titleAr: true },
        })
      : Promise.resolve(null),
    prisma().exhibitionArtwork.findMany({
      where: {
        organizationId,
        artworkId: artwork.id,
        archivedAt: null,
        exhibition: {
          organizationId,
          archivedAt: null,
          visibilityStatus: publicVisibility,
        },
      },
      orderBy: [{ displayOrder: "asc" }, { exhibition: { startDate: "desc" } }],
      select: {
        displayOrder: true,
        exhibition: {
          select: {
            id: true,
            slug: true,
            titleEn: true,
            titleAr: true,
            venueEn: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    }),
    prisma().projectArtwork.findMany({
      where: {
        organizationId,
        artworkId: artwork.id,
        archivedAt: null,
        project: {
          organizationId,
          archivedAt: null,
          visibilityStatus: publicVisibility,
        },
      },
      orderBy: [{ displayOrder: "asc" }, { project: { year: "desc" } }],
      select: {
        displayOrder: true,
        project: {
          select: {
            id: true,
            slug: true,
            titleEn: true,
            titleAr: true,
            type: true,
            year: true,
          },
        },
      },
    }),
    prisma().artwork.findMany({
      where: {
        ...publicWhere(organizationId),
        id: { not: artwork.id },
        OR: relatedScopes,
        artist: {
          organizationId,
          archivedAt: null,
          visibilityStatus: publicVisibility,
        },
        primaryMedia: {
          organizationId,
          archivedAt: null,
          visibility: MediaVisibility.PUBLIC,
        },
      },
      select: {
        id: true,
        slug: true,
        titleEn: true,
        titleAr: true,
        yearCreated: true,
        medium: true,
        artistId: true,
        collectionId: true,
        featured: true,
        displayOrder: true,
        updatedAt: true,
        artist: { select: { id: true, slug: true, nameEn: true } },
        primaryMedia: {
          select: {
            id: true,
            storagePath: true,
            altText: true,
            width: true,
            height: true,
          },
        },
      },
    }),
    prisma().media.findFirst({
      where: {
        organizationId,
        id: artwork.primaryMediaId,
        archivedAt: null,
        visibility: MediaVisibility.PUBLIC,
      },
      select: {
        id: true,
        storagePath: true,
        altText: true,
        width: true,
        height: true,
      },
    }),
  ]);

  return {
    artwork: {
      id: artwork.id,
      slug: artwork.slug,
      titleEn: artwork.titleEn,
      titleAr: artwork.titleAr,
      descriptionEn: artwork.descriptionEn,
      descriptionAr: artwork.descriptionAr,
      yearCreated: artwork.yearCreated,
      medium: artwork.medium,
      dimensions: artwork.dimensions,
      availabilityStatus: artwork.availabilityStatus,
      priceVisibility: artwork.priceVisibility,
      featured: artwork.featured,
      artistId: artwork.artistId,
      collectionId: artwork.collectionId,
    },
    artist: artwork.artist,
    collection,
    exhibitions: exhibitionRelations.map((relation) => ({
      displayOrder: relation.displayOrder,
      exhibition: {
        ...relation.exhibition,
        startDate: dateOnly(relation.exhibition.startDate),
        endDate: dateOnly(relation.exhibition.endDate),
      },
    })),
    projects: projectRelations,
    relatedWorks: relatedWorks.map((related) => ({
      ...related,
      updatedAt: iso(related.updatedAt),
    })),
    primaryMedia,
  };
}

export async function saveArtworkRecord(input: ArtworkValidatedInput, options: ProductionWriteOptions & { id?: string }): Promise<ProductionWriteResult<Artwork>> {
  try {
    await ensureProductionOrganization(options.organizationId);
    if (!input.primary_image_id) {
      return { ok: false, message: "Primary image media is required before artwork can be saved to PostgreSQL." };
    }
    const now = options.now ? new Date(options.now) : new Date();
    const data = {
      slug: input.slug,
      titleEn: input.title_en,
      titleAr: input.title_ar,
      artistId: input.artist_id,
      collectionId: input.collection_id || null,
      yearCreated: input.year,
      medium: input.medium_en || input.medium_ar,
      dimensions: input.dimensions,
      descriptionEn: input.description_en,
      descriptionAr: input.description_ar,
      priceVisibility: input.price_status,
      availabilityStatus: input.availability_status,
      visibilityStatus: input.visibility_status,
      primaryMediaId: input.primary_image_id,
      featured: input.featured || input.is_featured_homepage,
      displayOrder: input.display_order,
      updatedAt: now,
    };
    const record = options.id
      ? await prisma().artwork.update({
          where: { organizationId_id: { organizationId: options.organizationId, id: options.id } },
          data,
        })
      : await prisma().artwork.create({
          data: {
            id: `artwork-${randomUUID()}`,
            organizationId: options.organizationId,
            ...data,
            createdAt: now,
          },
        });
    return { ok: true, record: toArtwork(record), message: options.id ? "Artwork was updated in PostgreSQL." : "Artwork was saved to PostgreSQL." };
  } catch (error) {
    return failure(error, "Artwork PostgreSQL save did not complete.");
  }
}

export async function archiveArtworkRecord(id: string, options: ProductionWriteOptions): Promise<ProductionWriteResult<Artwork>> {
  try {
    const now = options.now ? new Date(options.now) : new Date();
    const record = await prisma().artwork.update({
      where: { organizationId_id: { organizationId: options.organizationId, id } },
      data: { visibilityStatus: VisibilityStatus.Hidden, archivedAt: now, updatedAt: now },
    });
    return { ok: true, record: toArtwork(record), message: "Artwork was archived in PostgreSQL." };
  } catch (error) {
    return failure(error, "Artwork archive did not complete.");
  }
}

export async function listCertificateRecords(organizationId: string): Promise<readonly Certificate[]> {
  try {
    const records = await prisma().certificate.findMany({
      where: adminWhere(organizationId),
      orderBy: [{ issuedDate: "desc" }, { updatedAt: "desc" }],
    });
    return records.map(toCertificate);
  } catch {
    return [];
  }
}

export async function findCertificateRecord(id: string, organizationId: string): Promise<Certificate | null> {
  const record = await prisma().certificate.findFirst({ where: { organizationId, id, archivedAt: null } });
  return record ? toCertificate(record) : null;
}

export async function findCertificateByVerificationValue(value: string): Promise<Certificate | null> {
  const organizationId = await getProductionOrganizationId();
  if (!organizationId) return null;

  const normalized = value.trim();
  const token = normalized.split("/").filter(Boolean).pop() ?? normalized;

  try {
    const record = await prisma().certificate.findFirst({
      where: {
        organizationId,
        archivedAt: null,
        OR: [
          { id: token },
          { certificateNumber: token },
          { verificationUrl: normalized },
          { verificationUrl: { endsWith: token } },
          { qrCode: normalized },
          { qrCode: token },
        ],
      },
    });

    return record ? toCertificate(record) : null;
  } catch {
    return null;
  }
}

export interface CertificateEditorInput {
  readonly artwork_id: string;
  readonly status: CertificateStatus;
  readonly issued_date: string;
  readonly approved_by: string;
  readonly note?: string;
  readonly issued_by?: string;
}

function certificateNumber(now: Date): string {
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  return `G015-${date}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function verificationUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://gallery015.com";
  return `${base}/verify/${token}`;
}

export async function saveCertificateRecord(input: CertificateEditorInput, options: ProductionWriteOptions & { id?: string }): Promise<ProductionWriteResult<Certificate>> {
  try {
    await ensureProductionOrganization(options.organizationId);
    const now = options.now ? new Date(options.now) : new Date();
    const existing = options.id
      ? await prisma().certificate.findFirst({ where: { organizationId: options.organizationId, id: options.id } })
      : null;
    const token = existing?.verificationUrl?.split("/").filter(Boolean).pop() || randomUUID();
    const data = {
      artworkId: input.artwork_id,
      issuedDate: new Date(input.issued_date),
      templateId: existing?.templateId ?? "gallery-015-default-certificate",
      qrCode: existing?.qrCode ?? verificationUrl(token),
      verificationUrl: existing?.verificationUrl ?? verificationUrl(token),
      status: input.status,
      issuedBy: input.issued_by || existing?.issuedBy || "Gallery 015",
      approvedBy: input.approved_by,
      issuedVersion: existing ? existing.issuedVersion + 1 : 1,
      issuedAt: existing?.issuedAt ?? now,
      updatedAt: now,
    };
    const record = options.id
      ? await prisma().certificate.update({
          where: { organizationId_id: { organizationId: options.organizationId, id: options.id } },
          data,
        })
      : await prisma().certificate.create({
          data: {
            id: `cert-${randomUUID()}`,
            organizationId: options.organizationId,
            certificateNumber: certificateNumber(now),
            ...data,
            createdAt: now,
          },
        });

    return { ok: true, record: toCertificate(record), message: options.id ? "Certificate was updated in PostgreSQL." : "Certificate was saved to PostgreSQL." };
  } catch (error) {
    return failure(error, "Certificate PostgreSQL save did not complete.");
  }
}

export async function archiveCertificateRecord(id: string, options: ProductionWriteOptions): Promise<ProductionWriteResult<Certificate>> {
  try {
    const now = options.now ? new Date(options.now) : new Date();
    const record = await prisma().certificate.update({
      where: { organizationId_id: { organizationId: options.organizationId, id } },
      data: { status: CertificateStatus.Revoked, archivedAt: now, updatedAt: now },
    });
    return { ok: true, record: toCertificate(record), message: "Certificate was archived in PostgreSQL." };
  } catch (error) {
    return failure(error, "Certificate archive did not complete.");
  }
}

const defaultSettings: Settings = {
  site_name_en: "Gallery 015",
  site_name_ar: "جاليري 015",
  description_en: "Contemporary art gallery.",
  description_ar: "معرض فني معاصر.",
  contact_email: "",
  contact_phone: "",
  address_en: "",
  address_ar: "",
  social_media: {},
};

function settingsFromValue(value: unknown): Settings {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return defaultSettings;
  }

  const data = value as Record<string, unknown>;
  const social = typeof data.social_media === "object" && data.social_media !== null && !Array.isArray(data.social_media)
    ? (data.social_media as Settings["social_media"])
    : {};

  return {
    site_name_en: String(data.site_name_en ?? defaultSettings.site_name_en),
    site_name_ar: String(data.site_name_ar ?? defaultSettings.site_name_ar),
    description_en: String(data.description_en ?? defaultSettings.description_en),
    description_ar: String(data.description_ar ?? defaultSettings.description_ar),
    contact_email: String(data.contact_email ?? ""),
    contact_phone: String(data.contact_phone ?? ""),
    address_en: String(data.address_en ?? ""),
    address_ar: String(data.address_ar ?? ""),
    social_media: social,
  };
}

export async function getSettingsRecord(organizationId?: string): Promise<Settings> {
  const resolvedOrganizationId = organizationId ?? (await getProductionOrganizationId());
  if (!resolvedOrganizationId) return defaultSettings;

  try {
    const record = await prisma().systemConfiguration.findFirst({
      where: {
        organizationId: resolvedOrganizationId,
        key: "gallery.general_settings",
        isActive: true,
        archivedAt: null,
      },
      orderBy: { updatedAt: "desc" },
    });
    return settingsFromValue(record?.value);
  } catch {
    return defaultSettings;
  }
}

export async function saveSettingsRecord(input: Settings, options: ProductionWriteOptions): Promise<ProductionWriteResult<Settings>> {
  try {
    await ensureProductionOrganization(options.organizationId);
    const now = options.now ? new Date(options.now) : new Date();
    await prisma().systemConfiguration.create({
      data: {
        key: "gallery.general_settings",
        scope: "ORGANIZATION",
        organizationId: options.organizationId,
        valueType: "JSON",
        value: input as unknown as Prisma.InputJsonValue,
        description: "Gallery information, contact details, social links, SEO defaults, visibility, and homepage configuration.",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    });
    return { ok: true, record: input, message: "General Settings were saved to PostgreSQL." };
  } catch (error) {
    return failure(error, "General Settings PostgreSQL save did not complete.");
  }
}
