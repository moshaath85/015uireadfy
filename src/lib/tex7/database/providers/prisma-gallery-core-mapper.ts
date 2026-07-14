import type { Artist as PrismaArtist, Artwork as PrismaArtwork, Certificate as PrismaCertificate, Collection as PrismaCollection, Exhibition as PrismaExhibition, News as PrismaNews, Project as PrismaProject, Publication as PrismaPublication, Service as PrismaService } from "@prisma/client";
import type {
  Artist,
  Artwork,
  AvailabilityStatus,
  Certificate,
  CertificateStatus,
  Collection,
  Exhibition,
  News,
  PriceStatus,
  Project,
  Publication,
  Service,
  VisibilityStatus,
} from "@/types";

export type Tex7PrismaArtistEntity = Artist &
  Record<string, unknown> & {
    readonly organization_id: string;
    readonly archived_at?: string;
  };

export type Tex7PrismaCollectionEntity = Collection &
  Record<string, unknown> & {
    readonly organization_id: string;
    readonly cover_media_id?: string | null;
    readonly featured: boolean;
    readonly display_order: number;
    readonly archived_at?: string;
  };

export type Tex7PrismaArtworkEntity = Artwork &
  Record<string, unknown> & {
    readonly organization_id: string;
    readonly primary_media_id: string;
    readonly archived_at?: string;
  };

export type Tex7PrismaExhibitionEntity = Exhibition &
  Record<string, unknown> & {
    readonly organization_id: string;
    readonly cover_media_id?: string | null;
    readonly status: string;
    readonly featured: boolean;
    readonly display_order: number;
    readonly archived_at?: string;
  };

export type Tex7PrismaProjectEntity = Project &
  Record<string, unknown> & {
    readonly organization_id: string;
    readonly featured: boolean;
    readonly display_order: number;
    readonly archived_at?: string;
  };

export type Tex7PrismaNewsEntity = News &
  Record<string, unknown> & {
    readonly organization_id: string;
    readonly display_order: number;
    readonly archived_at?: string;
    readonly created_at: string;
    readonly updated_at: string;
  };

export type Tex7PrismaPublicationEntity = Publication &
  Record<string, unknown> & {
    readonly organization_id: string;
    readonly display_order: number;
    readonly archived_at?: string;
    readonly created_at: string;
    readonly updated_at: string;
  };

export type Tex7PrismaServiceEntity = Service &
  Record<string, unknown> & {
    readonly organization_id: string;
    readonly display_order: number;
    readonly archived_at?: string;
  };

export type Tex7PrismaCertificateEntity = Certificate &
  Record<string, unknown> & {
    readonly organization_id: string;
    readonly archived_at?: string;
    readonly created_at: string;
    readonly updated_at: string;
  };

function toIsoString(value: Date | null | undefined): string {
  return value ? value.toISOString() : "";
}

function toOptionalIsoString(value: Date | null | undefined): string | undefined {
  return value ? value.toISOString() : undefined;
}

function toVisibilityStatus(value: string): VisibilityStatus {
  return value as VisibilityStatus;
}

function toAvailabilityStatus(value: string): AvailabilityStatus {
  return value as AvailabilityStatus;
}

function toPriceStatus(value: string): PriceStatus {
  return value as PriceStatus;
}

function toCertificateStatus(value: string): CertificateStatus {
  return value as CertificateStatus;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : [];
}

function toRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" ? (Array.isArray(value) ? undefined : (value as Record<string, unknown>)) : undefined;
}

function toDateText(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function mapPrismaArtistToDomain(record: PrismaArtist): Tex7PrismaArtistEntity {
  return {
    id: record.id,
    organization_id: record.organizationId,
    slug: record.slug,
    name_en: record.nameEn,
    name_ar: record.nameAr,
    bio_en: record.bioEn,
    bio_ar: record.bioAr,
    birth_year: record.birthYear,
    nationality_en: record.nationalityEn,
    nationality_ar: record.nationalityAr,
    website: record.website ?? undefined,
    email: record.email ?? undefined,
    instagram: record.instagram ?? undefined,
    profile_image_id: record.profileImageId ?? undefined,
    featured: record.featured,
    display_order: record.displayOrder,
    representation_status: record.representationStatus,
    visibility_status: toVisibilityStatus(record.visibilityStatus),
    created_at: toIsoString(record.createdAt),
    updated_at: toIsoString(record.updatedAt),
    archived_at: toOptionalIsoString(record.archivedAt),
  };
}

export function mapPrismaCollectionToDomain(record: PrismaCollection): Tex7PrismaCollectionEntity {
  return {
    id: record.id,
    organization_id: record.organizationId,
    slug: record.slug,
    title_en: record.titleEn,
    title_ar: record.titleAr,
    description_en: record.descriptionEn,
    description_ar: record.descriptionAr,
    cover_media_id: record.coverMediaId,
    featured: record.featured,
    visibility_status: toVisibilityStatus(record.visibilityStatus),
    display_order: record.displayOrder,
    created_at: toIsoString(record.createdAt),
    updated_at: toIsoString(record.updatedAt),
    archived_at: toOptionalIsoString(record.archivedAt),
  };
}

export function mapPrismaArtworkToDomain(record: PrismaArtwork): Tex7PrismaArtworkEntity {
  return {
    id: record.id,
    organization_id: record.organizationId,
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
    price: null,
    currency: "",
    price_status: toPriceStatus(record.priceVisibility),
    availability_status: toAvailabilityStatus(record.availabilityStatus),
    visibility_status: toVisibilityStatus(record.visibilityStatus),
    primary_image_id: record.primaryMediaId,
    primary_media_id: record.primaryMediaId,
    featured: record.featured,
    display_order: record.displayOrder,
    is_featured_homepage: record.featured,
    created_at: toIsoString(record.createdAt),
    updated_at: toIsoString(record.updatedAt),
    archived_at: toOptionalIsoString(record.archivedAt),
  };
}

export function mapPrismaExhibitionToDomain(record: PrismaExhibition): Tex7PrismaExhibitionEntity {
  return {
    id: record.id,
    organization_id: record.organizationId,
    slug: record.slug,
    title_en: record.titleEn,
    title_ar: record.titleAr,
    description_en: record.descriptionEn,
    description_ar: record.descriptionAr,
    start_date: toIsoString(record.startDate),
    end_date: toIsoString(record.endDate),
    venue_en: record.venueEn,
    venue_ar: record.venueAr,
    cover_media_id: record.coverMediaId,
    status: record.status,
    featured: record.featured,
    visibility_status: toVisibilityStatus(record.visibilityStatus),
    display_order: record.displayOrder,
    created_at: toIsoString(record.createdAt),
    updated_at: toIsoString(record.updatedAt),
    archived_at: toOptionalIsoString(record.archivedAt),
  };
}

export function mapPrismaProjectToDomain(record: PrismaProject): Tex7PrismaProjectEntity {
  return {
    id: record.id,
    organization_id: record.organizationId,
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
    featured: record.featured,
    visibility_status: toVisibilityStatus(record.visibilityStatus),
    display_order: record.displayOrder,
    created_at: toIsoString(record.createdAt),
    updated_at: toIsoString(record.updatedAt),
    archived_at: toOptionalIsoString(record.archivedAt),
  };
}

export function mapPrismaNewsToDomain(record: PrismaNews): Tex7PrismaNewsEntity {
  return {
    id: record.id,
    organization_id: record.organizationId,
    slug: record.slug,
    title_en: record.titleEn,
    title_ar: record.titleAr,
    content_en: record.contentEn,
    content_ar: record.contentAr,
    excerpt_en: record.excerptEn,
    excerpt_ar: record.excerptAr,
    category: record.category,
    publish_date: toDateText(record.publishDate),
    image_id: record.imageId,
    visibility_status: toVisibilityStatus(record.visibilityStatus),
    display_order: record.displayOrder,
    created_at: toIsoString(record.createdAt),
    updated_at: toIsoString(record.updatedAt),
    archived_at: toOptionalIsoString(record.archivedAt),
  };
}

export function mapPrismaPublicationToDomain(record: PrismaPublication): Tex7PrismaPublicationEntity {
  return {
    id: record.id,
    organization_id: record.organizationId,
    slug: record.slug,
    title_en: record.titleEn,
    title_ar: record.titleAr,
    description_en: record.descriptionEn,
    description_ar: record.descriptionAr,
    type: record.type,
    file_url: record.fileUrl,
    cover_image_id: record.coverImageId,
    publish_date: toDateText(record.publishDate),
    visibility_status: toVisibilityStatus(record.visibilityStatus),
    display_order: record.displayOrder,
    created_at: toIsoString(record.createdAt),
    updated_at: toIsoString(record.updatedAt),
    archived_at: toOptionalIsoString(record.archivedAt),
  };
}

export function mapPrismaServiceToDomain(record: PrismaService): Tex7PrismaServiceEntity {
  return {
    id: record.id,
    organization_id: record.organizationId,
    slug: record.slug,
    title_en: record.titleEn,
    title_ar: record.titleAr,
    description_en: record.descriptionEn,
    description_ar: record.descriptionAr,
    features_en: toStringArray(record.featuresEn),
    features_ar: toStringArray(record.featuresAr),
    price_info: toRecord(record.priceInfo),
    visibility_status: toVisibilityStatus(record.visibilityStatus),
    display_order: record.displayOrder,
    created_at: toIsoString(record.createdAt),
    updated_at: toIsoString(record.updatedAt),
    archived_at: toOptionalIsoString(record.archivedAt),
  };
}

export function mapPrismaCertificateToDomain(record: PrismaCertificate): Tex7PrismaCertificateEntity {
  return {
    id: record.id,
    organization_id: record.organizationId,
    certificate_number: record.certificateNumber,
    artwork_id: record.artworkId,
    issued_date: toDateText(record.issuedDate),
    template_id: record.templateId ?? "",
    qr_code: record.qrCode ?? "",
    verification_url: record.verificationUrl,
    status: toCertificateStatus(record.status),
    issued_by: record.issuedBy,
    approved_by: record.approvedBy,
    issued_version: record.issuedVersion,
    issued_at: toIsoString(record.issuedAt),
    last_updated: toIsoString(record.lastUpdated),
    created_at: toIsoString(record.createdAt),
    updated_at: toIsoString(record.updatedAt),
    archived_at: toOptionalIsoString(record.archivedAt),
  };
}
