import type { Artist as PrismaArtist, Artwork as PrismaArtwork, Certificate as PrismaCertificate, Collection as PrismaCollection, Exhibition as PrismaExhibition, News as PrismaNews, Project as PrismaProject, Publication as PrismaPublication, Prisma, Service as PrismaService } from "@prisma/client";
import { getTex7PrismaClient } from "@/lib/tex7/database/providers/prisma-client";
import {
  mapPrismaArtistToDomain,
  mapPrismaArtworkToDomain,
  mapPrismaCertificateToDomain,
  mapPrismaCollectionToDomain,
  mapPrismaExhibitionToDomain,
  mapPrismaNewsToDomain,
  mapPrismaProjectToDomain,
  mapPrismaPublicationToDomain,
  mapPrismaServiceToDomain,
  type Tex7PrismaArtistEntity,
  type Tex7PrismaArtworkEntity,
  type Tex7PrismaCertificateEntity,
  type Tex7PrismaCollectionEntity,
  type Tex7PrismaExhibitionEntity,
  type Tex7PrismaNewsEntity,
  type Tex7PrismaProjectEntity,
  type Tex7PrismaPublicationEntity,
  type Tex7PrismaServiceEntity,
} from "@/lib/tex7/database/providers/prisma-gallery-core-mapper";
import type { Tex7RepositoryContract } from "../repository-contracts";
import type { Tex7RepositoryContext, Tex7RepositoryEntityId } from "../repository-context";
import type { Tex7RepositoryFilter, Tex7RepositoryFilterGroup, Tex7RepositoryQuery, Tex7RepositorySort } from "../repository-query";
import {
  tex7RepositoryFailure,
  tex7RepositorySuccess,
  type Tex7RepositoryConnection,
  type Tex7RepositoryResult,
} from "../repository-result";
import type {
  Tex7RepositoryCreateOptions,
  Tex7RepositoryRestoreOptions,
  Tex7RepositorySoftDeleteOptions,
  Tex7RepositoryUpdateOptions,
  Tex7RepositoryWriteResult,
} from "../repository-write";

const providerId = "prisma";
const maxPageSize = 100;

type GalleryCoreFailureCode =
  | "TEX7_REPOSITORY_TENANT_CONTEXT_REQUIRED"
  | "TEX7_REPOSITORY_WRITE_DISABLED"
  | "TEX7_REPOSITORY_UNKNOWN_ERROR";

type PrismaReadDelegate<TRecord, TWhereInput, TOrderByInput> = {
  readonly findMany: (args: {
    readonly where: TWhereInput;
    readonly orderBy: readonly TOrderByInput[];
    readonly skip: number;
    readonly take: number;
  }) => Promise<TRecord[]>;
  readonly count: (args: { readonly where: TWhereInput }) => Promise<number>;
  readonly findFirst: (args: { readonly where: TWhereInput }) => Promise<TRecord | null>;
};

interface PrismaRepositoryConfig<TEntity extends Record<string, unknown>, TRecord, TWhereInput, TOrderByInput> {
  readonly repositoryKey: string;
  readonly entityType: string;
  readonly delegate: () => PrismaReadDelegate<TRecord, TWhereInput, TOrderByInput>;
  readonly mapRecord: (record: TRecord) => TEntity;
  readonly fieldMap: Readonly<Record<string, string>>;
}

const commonFieldMap = {
  id: "id",
  organization_id: "organizationId",
  organizationId: "organizationId",
  slug: "slug",
  featured: "featured",
  display_order: "displayOrder",
  displayOrder: "displayOrder",
  visibility_status: "visibilityStatus",
  visibilityStatus: "visibilityStatus",
  created_at: "createdAt",
  createdAt: "createdAt",
  updated_at: "updatedAt",
  updatedAt: "updatedAt",
  archived_at: "archivedAt",
  archivedAt: "archivedAt",
} as const;

const artistFieldMap: Readonly<Record<string, string>> = {
  ...commonFieldMap,
  name_en: "nameEn",
  nameEn: "nameEn",
  name_ar: "nameAr",
  nameAr: "nameAr",
  bio_en: "bioEn",
  bioEn: "bioEn",
  bio_ar: "bioAr",
  bioAr: "bioAr",
  birth_year: "birthYear",
  birthYear: "birthYear",
  nationality_en: "nationalityEn",
  nationalityEn: "nationalityEn",
  nationality_ar: "nationalityAr",
  nationalityAr: "nationalityAr",
  website: "website",
  email: "email",
  instagram: "instagram",
  profile_image_id: "profileImageId",
  profileImageId: "profileImageId",
  representation_status: "representationStatus",
  representationStatus: "representationStatus",
};

const collectionFieldMap: Readonly<Record<string, string>> = {
  ...commonFieldMap,
  title_en: "titleEn",
  titleEn: "titleEn",
  title_ar: "titleAr",
  titleAr: "titleAr",
  description_en: "descriptionEn",
  descriptionEn: "descriptionEn",
  description_ar: "descriptionAr",
  descriptionAr: "descriptionAr",
  cover_media_id: "coverMediaId",
  coverMediaId: "coverMediaId",
};

const exhibitionFieldMap: Readonly<Record<string, string>> = {
  ...commonFieldMap,
  title_en: "titleEn",
  titleEn: "titleEn",
  title_ar: "titleAr",
  titleAr: "titleAr",
  description_en: "descriptionEn",
  descriptionEn: "descriptionEn",
  description_ar: "descriptionAr",
  descriptionAr: "descriptionAr",
  start_date: "startDate",
  startDate: "startDate",
  end_date: "endDate",
  endDate: "endDate",
  venue_en: "venueEn",
  venueEn: "venueEn",
  venue_ar: "venueAr",
  venueAr: "venueAr",
  cover_media_id: "coverMediaId",
  coverMediaId: "coverMediaId",
  status: "status",
};

const projectFieldMap: Readonly<Record<string, string>> = {
  ...commonFieldMap,
  title_en: "titleEn",
  titleEn: "titleEn",
  title_ar: "titleAr",
  titleAr: "titleAr",
  description_en: "descriptionEn",
  descriptionEn: "descriptionEn",
  description_ar: "descriptionAr",
  descriptionAr: "descriptionAr",
  client_en: "clientEn",
  clientEn: "clientEn",
  client_ar: "clientAr",
  clientAr: "clientAr",
  type: "type",
  year: "year",
  status: "status",
};

const artworkFieldMap: Readonly<Record<string, string>> = {
  ...commonFieldMap,
  title_en: "titleEn",
  titleEn: "titleEn",
  title_ar: "titleAr",
  titleAr: "titleAr",
  description_en: "descriptionEn",
  descriptionEn: "descriptionEn",
  description_ar: "descriptionAr",
  descriptionAr: "descriptionAr",
  artist_id: "artistId",
  artistId: "artistId",
  collection_id: "collectionId",
  collectionId: "collectionId",
  primary_image_id: "primaryMediaId",
  primary_media_id: "primaryMediaId",
  primaryMediaId: "primaryMediaId",
  year: "yearCreated",
  year_created: "yearCreated",
  yearCreated: "yearCreated",
  medium: "medium",
  medium_en: "medium",
  medium_ar: "medium",
  dimensions: "dimensions",
  price_status: "priceVisibility",
  price_visibility: "priceVisibility",
  priceVisibility: "priceVisibility",
  availability_status: "availabilityStatus",
  availabilityStatus: "availabilityStatus",
  is_featured_homepage: "featured",
};

const newsFieldMap: Readonly<Record<string, string>> = {
  ...commonFieldMap,
  title_en: "titleEn",
  titleEn: "titleEn",
  title_ar: "titleAr",
  titleAr: "titleAr",
  content_en: "contentEn",
  contentEn: "contentEn",
  content_ar: "contentAr",
  contentAr: "contentAr",
  excerpt_en: "excerptEn",
  excerptEn: "excerptEn",
  excerpt_ar: "excerptAr",
  excerptAr: "excerptAr",
  category: "category",
  publish_date: "publishDate",
  publishDate: "publishDate",
  image_id: "imageId",
  imageId: "imageId",
};

const publicationFieldMap: Readonly<Record<string, string>> = {
  ...commonFieldMap,
  title_en: "titleEn",
  titleEn: "titleEn",
  title_ar: "titleAr",
  titleAr: "titleAr",
  description_en: "descriptionEn",
  descriptionEn: "descriptionEn",
  description_ar: "descriptionAr",
  descriptionAr: "descriptionAr",
  type: "type",
  file_url: "fileUrl",
  fileUrl: "fileUrl",
  cover_image_id: "coverImageId",
  coverImageId: "coverImageId",
  publish_date: "publishDate",
  publishDate: "publishDate",
};

const serviceFieldMap: Readonly<Record<string, string>> = {
  ...commonFieldMap,
  title_en: "titleEn",
  titleEn: "titleEn",
  title_ar: "titleAr",
  titleAr: "titleAr",
  description_en: "descriptionEn",
  descriptionEn: "descriptionEn",
  description_ar: "descriptionAr",
  descriptionAr: "descriptionAr",
  features_en: "featuresEn",
  featuresEn: "featuresEn",
  features_ar: "featuresAr",
  featuresAr: "featuresAr",
  price_info: "priceInfo",
  priceInfo: "priceInfo",
};

const certificateFieldMap: Readonly<Record<string, string>> = {
  ...commonFieldMap,
  certificate_number: "certificateNumber",
  certificateNumber: "certificateNumber",
  artwork_id: "artworkId",
  artworkId: "artworkId",
  issued_date: "issuedDate",
  issuedDate: "issuedDate",
  template_id: "templateId",
  templateId: "templateId",
  qr_code: "qrCode",
  qrCode: "qrCode",
  verification_url: "verificationUrl",
  verificationUrl: "verificationUrl",
  status: "status",
  issued_by: "issuedBy",
  issuedBy: "issuedBy",
  approved_by: "approvedBy",
  approvedBy: "approvedBy",
  issued_version: "issuedVersion",
  issuedVersion: "issuedVersion",
  issued_at: "issuedAt",
  issuedAt: "issuedAt",
  last_updated: "lastUpdated",
  lastUpdated: "lastUpdated",
};

function resultMeta(repositoryKey: string, operation: string, context?: Tex7RepositoryContext) {
  return {
    repositoryKey,
    providerId,
    operation,
    requestId: context?.audit?.requestId,
  };
}

function requireTenantContext(
  repositoryKey: string,
  entityType: string,
  operation: string,
  context?: Tex7RepositoryContext,
): Tex7RepositoryResult<string, GalleryCoreFailureCode> {
  if (!context?.tenantId) {
    return tex7RepositoryFailure(
      "TEX7_REPOSITORY_TENANT_CONTEXT_REQUIRED",
      `Prisma ${entityType} repository requires an organization tenant context for every operation.`,
      {
        recoverable: true,
        details: { operation, repositoryKey },
        meta: resultMeta(repositoryKey, operation, context),
      },
    );
  }

  return tex7RepositorySuccess(context.tenantId, resultMeta(repositoryKey, operation, context));
}

function mapField(fieldMap: Readonly<Record<string, string>>, field: string): string {
  return fieldMap[field] ?? field;
}

function filterToWhere(
  fieldMap: Readonly<Record<string, string>>,
  filter: Tex7RepositoryFilter | Tex7RepositoryFilterGroup,
): Record<string, unknown> {
  if ("filters" in filter) {
    const nested = filter.filters.map((item) => filterToWhere(fieldMap, item));

    return filter.operator === "or" ? { OR: nested } : { AND: nested };
  }

  const field = mapField(fieldMap, filter.field);
  const value = filter.value;

  switch (filter.operator) {
    case "eq":
      return { [field]: value };
    case "neq":
      return { NOT: { [field]: value } };
    case "in":
      return { [field]: { in: Array.isArray(value) ? value : [value] } };
    case "notIn":
      return { [field]: { notIn: Array.isArray(value) ? value : [value] } };
    case "lt":
      return { [field]: { lt: value } };
    case "lte":
      return { [field]: { lte: value } };
    case "gt":
      return { [field]: { gt: value } };
    case "gte":
      return { [field]: { gte: value } };
    case "contains":
      return { [field]: { contains: String(value ?? ""), mode: "insensitive" } };
    case "startsWith":
      return { [field]: { startsWith: String(value ?? ""), mode: "insensitive" } };
    case "endsWith":
      return { [field]: { endsWith: String(value ?? ""), mode: "insensitive" } };
    case "isNull":
      return { [field]: null };
    case "isNotNull":
      return { NOT: { [field]: null } };
    default:
      return {};
  }
}

function buildWhere<TWhereInput>(
  fieldMap: Readonly<Record<string, string>>,
  query: Tex7RepositoryQuery | undefined,
  organizationId: string,
): TWhereInput {
  const conditions: Record<string, unknown>[] = [{ organizationId }];

  if (!query?.includeDeleted) {
    conditions.push({ archivedAt: null });
  }

  if (query?.filter) {
    conditions.push(filterToWhere(fieldMap, query.filter));
  }

  return { AND: conditions } as TWhereInput;
}

function buildOrderBy<TOrderByInput>(
  fieldMap: Readonly<Record<string, string>>,
  sort: readonly Tex7RepositorySort[] | undefined,
): TOrderByInput[] {
  if (!sort?.length) {
    return [{ updatedAt: "desc" }, { id: "asc" }] as TOrderByInput[];
  }

  return sort.map((item) => ({ [mapField(fieldMap, item.field)]: item.direction }) as TOrderByInput);
}

function getOffsetPagination(query: Tex7RepositoryQuery | undefined): { skip: number; take: number } {
  const pagination = query?.pagination;

  if (!pagination || pagination.mode !== "offset") {
    return { skip: 0, take: 25 };
  }

  const page = Math.max(1, pagination.page);
  const pageSize = Math.min(Math.max(1, pagination.pageSize), maxPageSize);

  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

function disabledWriteResult<TEntity extends Record<string, unknown>>(
  repositoryKey: string,
  entityType: string,
  operation: string,
  context?: Tex7RepositoryContext,
): Promise<Tex7RepositoryResult<Tex7RepositoryWriteResult<TEntity>, GalleryCoreFailureCode>> {
  return Promise.resolve(
    tex7RepositoryFailure(
      "TEX7_REPOSITORY_WRITE_DISABLED",
      `Prisma ${entityType} repository writes are defined for contract compatibility but disabled for this controlled pilot.`,
      {
        recoverable: true,
        details: { operation, repositoryKey, writesEnabled: false },
        meta: resultMeta(repositoryKey, operation, context),
      },
    ),
  );
}

function createPrismaRepository<TEntity extends Record<string, unknown>, TRecord, TWhereInput, TOrderByInput>(
  config: PrismaRepositoryConfig<TEntity, TRecord, TWhereInput, TOrderByInput>,
): Tex7RepositoryContract<TEntity> {
  return {
    key: config.repositoryKey,
    entityType: config.entityType,
    read: {
      async findMany(
        query?: Tex7RepositoryQuery,
        context?: Tex7RepositoryContext,
      ): Promise<Tex7RepositoryResult<Tex7RepositoryConnection<TEntity>, GalleryCoreFailureCode>> {
        const tenant = requireTenantContext(config.repositoryKey, config.entityType, "findMany", context);

        if (!tenant.ok) {
          return tenant;
        }

        try {
          const where = buildWhere<TWhereInput>(config.fieldMap, query, tenant.data);
          const orderBy = buildOrderBy<TOrderByInput>(config.fieldMap, query?.sort);
          const pagination = getOffsetPagination(query);
          const delegate = config.delegate();
          const [records, totalCount] = await Promise.all([
            delegate.findMany({
              where,
              orderBy,
              skip: pagination.skip,
              take: pagination.take,
            }),
            delegate.count({ where }),
          ]);
          const nodes = records.map(config.mapRecord);
          const startCursor = nodes[0]?.id;
          const endCursor = nodes[nodes.length - 1]?.id;

          return tex7RepositorySuccess(
            {
              nodes,
              pageInfo: {
                hasNextPage: pagination.skip + nodes.length < totalCount,
                hasPreviousPage: pagination.skip > 0,
                startCursor: typeof startCursor === "string" ? startCursor : undefined,
                endCursor: typeof endCursor === "string" ? endCursor : undefined,
                totalCount,
              },
            },
            resultMeta(config.repositoryKey, "findMany", context),
          );
        } catch (error) {
          return tex7RepositoryFailure(
            "TEX7_REPOSITORY_UNKNOWN_ERROR",
            `Unable to read Prisma ${config.entityType} records.`,
            {
              recoverable: true,
              details: { error: error instanceof Error ? error.message : String(error) },
              meta: resultMeta(config.repositoryKey, "findMany", context),
            },
          );
        }
      },

      async findById(
        id: Tex7RepositoryEntityId,
        context?: Tex7RepositoryContext,
      ): Promise<Tex7RepositoryResult<TEntity | null, GalleryCoreFailureCode>> {
        const tenant = requireTenantContext(config.repositoryKey, config.entityType, "findById", context);

        if (!tenant.ok) {
          return tenant;
        }

        try {
          const record = await config.delegate().findFirst({
            where: {
              id: String(id),
              organizationId: tenant.data,
              archivedAt: null,
            } as TWhereInput,
          });

          return tex7RepositorySuccess(
            record ? config.mapRecord(record) : null,
            resultMeta(config.repositoryKey, "findById", context),
          );
        } catch (error) {
          return tex7RepositoryFailure(
            "TEX7_REPOSITORY_UNKNOWN_ERROR",
            `Unable to read a Prisma ${config.entityType} record.`,
            {
              recoverable: true,
              details: { id, error: error instanceof Error ? error.message : String(error) },
              meta: resultMeta(config.repositoryKey, "findById", context),
            },
          );
        }
      },

      async exists(
        id: Tex7RepositoryEntityId,
        context?: Tex7RepositoryContext,
      ): Promise<Tex7RepositoryResult<boolean, GalleryCoreFailureCode>> {
        const tenant = requireTenantContext(config.repositoryKey, config.entityType, "exists", context);

        if (!tenant.ok) {
          return tenant;
        }

        try {
          const count = await config.delegate().count({
            where: {
              id: String(id),
              organizationId: tenant.data,
              archivedAt: null,
            } as TWhereInput,
          });

          return tex7RepositorySuccess(count > 0, resultMeta(config.repositoryKey, "exists", context));
        } catch (error) {
          return tex7RepositoryFailure(
            "TEX7_REPOSITORY_UNKNOWN_ERROR",
            `Unable to check Prisma ${config.entityType} existence.`,
            {
              recoverable: true,
              details: { id, error: error instanceof Error ? error.message : String(error) },
              meta: resultMeta(config.repositoryKey, "exists", context),
            },
          );
        }
      },
    },
    write: {
      create(input: Partial<TEntity>, options?: Tex7RepositoryCreateOptions, context?: Tex7RepositoryContext) {
        void input;
        void options;
        return disabledWriteResult<TEntity>(config.repositoryKey, config.entityType, "create", context);
      },
      update(
        id: Tex7RepositoryEntityId,
        input: Partial<TEntity>,
        options?: Tex7RepositoryUpdateOptions,
        context?: Tex7RepositoryContext,
      ) {
        void id;
        void input;
        void options;
        return disabledWriteResult<TEntity>(config.repositoryKey, config.entityType, "update", context);
      },
      softDelete(
        id: Tex7RepositoryEntityId,
        options: Tex7RepositorySoftDeleteOptions,
        context?: Tex7RepositoryContext,
      ) {
        void id;
        void options;
        return disabledWriteResult<TEntity>(config.repositoryKey, config.entityType, "archive", context);
      },
      restore(
        id: Tex7RepositoryEntityId,
        options: Tex7RepositoryRestoreOptions,
        context?: Tex7RepositoryContext,
      ) {
        void id;
        void options;
        return disabledWriteResult<TEntity>(config.repositoryKey, config.entityType, "restore", context);
      },
    },
  };
}

export const prismaArtistRepository = createPrismaRepository<
  Tex7PrismaArtistEntity,
  PrismaArtist,
  Prisma.ArtistWhereInput,
  Prisma.ArtistOrderByWithRelationInput
>({
  repositoryKey: "gallery015.artist.prisma",
  entityType: "Artist",
  delegate: () =>
    getTex7PrismaClient().artist as unknown as PrismaReadDelegate<
      PrismaArtist,
      Prisma.ArtistWhereInput,
      Prisma.ArtistOrderByWithRelationInput
    >,
  mapRecord: mapPrismaArtistToDomain,
  fieldMap: artistFieldMap,
});

export const prismaCollectionRepository = createPrismaRepository<
  Tex7PrismaCollectionEntity,
  PrismaCollection,
  Prisma.CollectionWhereInput,
  Prisma.CollectionOrderByWithRelationInput
>({
  repositoryKey: "gallery015.collection.prisma",
  entityType: "Collection",
  delegate: () =>
    getTex7PrismaClient().collection as unknown as PrismaReadDelegate<
      PrismaCollection,
      Prisma.CollectionWhereInput,
      Prisma.CollectionOrderByWithRelationInput
    >,
  mapRecord: mapPrismaCollectionToDomain,
  fieldMap: collectionFieldMap,
});

export const prismaArtworkRepository = createPrismaRepository<
  Tex7PrismaArtworkEntity,
  PrismaArtwork,
  Prisma.ArtworkWhereInput,
  Prisma.ArtworkOrderByWithRelationInput
>({
  repositoryKey: "gallery015.artwork.prisma",
  entityType: "Artwork",
  delegate: () =>
    getTex7PrismaClient().artwork as unknown as PrismaReadDelegate<
      PrismaArtwork,
      Prisma.ArtworkWhereInput,
      Prisma.ArtworkOrderByWithRelationInput
    >,
  mapRecord: mapPrismaArtworkToDomain,
  fieldMap: artworkFieldMap,
});

export const prismaExhibitionRepository = createPrismaRepository<
  Tex7PrismaExhibitionEntity,
  PrismaExhibition,
  Prisma.ExhibitionWhereInput,
  Prisma.ExhibitionOrderByWithRelationInput
>({
  repositoryKey: "gallery015.exhibition.prisma",
  entityType: "Exhibition",
  delegate: () =>
    getTex7PrismaClient().exhibition as unknown as PrismaReadDelegate<
      PrismaExhibition,
      Prisma.ExhibitionWhereInput,
      Prisma.ExhibitionOrderByWithRelationInput
    >,
  mapRecord: mapPrismaExhibitionToDomain,
  fieldMap: exhibitionFieldMap,
});

export const prismaProjectRepository = createPrismaRepository<
  Tex7PrismaProjectEntity,
  PrismaProject,
  Prisma.ProjectWhereInput,
  Prisma.ProjectOrderByWithRelationInput
>({
  repositoryKey: "gallery015.project.prisma",
  entityType: "Project",
  delegate: () =>
    getTex7PrismaClient().project as unknown as PrismaReadDelegate<
      PrismaProject,
      Prisma.ProjectWhereInput,
      Prisma.ProjectOrderByWithRelationInput
    >,
  mapRecord: mapPrismaProjectToDomain,
  fieldMap: projectFieldMap,
});

export const prismaNewsRepository = createPrismaRepository<
  Tex7PrismaNewsEntity,
  PrismaNews,
  Prisma.NewsWhereInput,
  Prisma.NewsOrderByWithRelationInput
>({
  repositoryKey: "gallery015.news.prisma",
  entityType: "News",
  delegate: () =>
    getTex7PrismaClient().news as unknown as PrismaReadDelegate<
      PrismaNews,
      Prisma.NewsWhereInput,
      Prisma.NewsOrderByWithRelationInput
    >,
  mapRecord: mapPrismaNewsToDomain,
  fieldMap: newsFieldMap,
});

export const prismaPublicationRepository = createPrismaRepository<
  Tex7PrismaPublicationEntity,
  PrismaPublication,
  Prisma.PublicationWhereInput,
  Prisma.PublicationOrderByWithRelationInput
>({
  repositoryKey: "gallery015.publication.prisma",
  entityType: "Publication",
  delegate: () =>
    getTex7PrismaClient().publication as unknown as PrismaReadDelegate<
      PrismaPublication,
      Prisma.PublicationWhereInput,
      Prisma.PublicationOrderByWithRelationInput
    >,
  mapRecord: mapPrismaPublicationToDomain,
  fieldMap: publicationFieldMap,
});

export const prismaServiceRepository = createPrismaRepository<
  Tex7PrismaServiceEntity,
  PrismaService,
  Prisma.ServiceWhereInput,
  Prisma.ServiceOrderByWithRelationInput
>({
  repositoryKey: "gallery015.service.prisma",
  entityType: "Service",
  delegate: () =>
    getTex7PrismaClient().service as unknown as PrismaReadDelegate<
      PrismaService,
      Prisma.ServiceWhereInput,
      Prisma.ServiceOrderByWithRelationInput
    >,
  mapRecord: mapPrismaServiceToDomain,
  fieldMap: serviceFieldMap,
});

export const prismaCertificateRepository = createPrismaRepository<
  Tex7PrismaCertificateEntity,
  PrismaCertificate,
  Prisma.CertificateWhereInput,
  Prisma.CertificateOrderByWithRelationInput
>({
  repositoryKey: "gallery015.certificate.prisma",
  entityType: "Certificate",
  delegate: () =>
    getTex7PrismaClient().certificate as unknown as PrismaReadDelegate<
      PrismaCertificate,
      Prisma.CertificateWhereInput,
      Prisma.CertificateOrderByWithRelationInput
    >,
  mapRecord: mapPrismaCertificateToDomain,
  fieldMap: certificateFieldMap,
});
