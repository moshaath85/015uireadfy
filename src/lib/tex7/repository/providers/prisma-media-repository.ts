import type { Prisma } from "@prisma/client";
import { getTex7PrismaClient } from "@/lib/tex7/database/providers/prisma-client";
import { mapPrismaMediaToDomain, type Tex7PrismaMediaEntity } from "@/lib/tex7/database/providers/prisma-media-mapper";
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

const repositoryKey = "gallery015.media.prisma";
const providerId = "prisma";
const maxPageSize = 100;

type MediaFailureCode =
  | "TEX7_REPOSITORY_TENANT_CONTEXT_REQUIRED"
  | "TEX7_REPOSITORY_WRITE_DISABLED"
  | "TEX7_REPOSITORY_VALIDATION_FAILED"
  | "TEX7_REPOSITORY_UNKNOWN_ERROR";

type MediaWhereInput = Prisma.MediaWhereInput;
type MediaOrderByInput = Prisma.MediaOrderByWithRelationInput;

const fieldMap: Record<string, keyof Prisma.MediaWhereInput & string> = {
  id: "id",
  organization_id: "organizationId",
  organizationId: "organizationId",
  filename: "filename",
  original_filename: "originalFilename",
  originalFilename: "originalFilename",
  mime_type: "mimeType",
  mimeType: "mimeType",
  type: "mediaType",
  media_type: "mediaType",
  mediaType: "mediaType",
  url: "storagePath",
  storage_path: "storagePath",
  storagePath: "storagePath",
  alt_text: "altText",
  altText: "altText",
  alt_en: "altText",
  alt_ar: "altText",
  width: "width",
  height: "height",
  file_size: "fileSize",
  fileSize: "fileSize",
  visibility: "visibility",
  checksum: "checksum",
  created_at: "createdAt",
  createdAt: "createdAt",
  updated_at: "updatedAt",
  updatedAt: "updatedAt",
  archived_at: "archivedAt",
  archivedAt: "archivedAt",
};

function resultMeta(operation: string, context?: Tex7RepositoryContext) {
  return {
    repositoryKey,
    providerId,
    operation,
    requestId: context?.audit?.requestId,
  };
}

function requireTenantContext(
  operation: string,
  context?: Tex7RepositoryContext,
): Tex7RepositoryResult<string, MediaFailureCode> {
  if (!context?.tenantId) {
    return tex7RepositoryFailure(
      "TEX7_REPOSITORY_TENANT_CONTEXT_REQUIRED",
      "Prisma Media repository requires an organization tenant context for every operation.",
      {
        recoverable: true,
        details: { operation, repositoryKey },
        meta: resultMeta(operation, context),
      },
    );
  }

  return tex7RepositorySuccess(context.tenantId, resultMeta(operation, context));
}

function mapField(field: string): string {
  return fieldMap[field] ?? field;
}

function normalizeEnumValue(field: string, value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  if (field === "mediaType") {
    return value.toUpperCase();
  }

  if (field === "visibility") {
    return value.toUpperCase();
  }

  return value;
}

function filterToWhere(filter: Tex7RepositoryFilter | Tex7RepositoryFilterGroup): MediaWhereInput {
  if ("filters" in filter) {
    const nested = filter.filters.map(filterToWhere);

    return filter.operator === "or" ? { OR: nested } : { AND: nested };
  }

  const field = mapField(filter.field);
  const value = normalizeEnumValue(field, filter.value);

  switch (filter.operator) {
    case "eq":
      return { [field]: value } as MediaWhereInput;
    case "neq":
      return { NOT: { [field]: value } } as MediaWhereInput;
    case "in":
      return { [field]: { in: Array.isArray(value) ? value : [value] } } as MediaWhereInput;
    case "notIn":
      return { [field]: { notIn: Array.isArray(value) ? value : [value] } } as MediaWhereInput;
    case "lt":
      return { [field]: { lt: value } } as MediaWhereInput;
    case "lte":
      return { [field]: { lte: value } } as MediaWhereInput;
    case "gt":
      return { [field]: { gt: value } } as MediaWhereInput;
    case "gte":
      return { [field]: { gte: value } } as MediaWhereInput;
    case "contains":
      return { [field]: { contains: String(value ?? ""), mode: "insensitive" } } as MediaWhereInput;
    case "startsWith":
      return { [field]: { startsWith: String(value ?? ""), mode: "insensitive" } } as MediaWhereInput;
    case "endsWith":
      return { [field]: { endsWith: String(value ?? ""), mode: "insensitive" } } as MediaWhereInput;
    case "isNull":
      return { [field]: null } as MediaWhereInput;
    case "isNotNull":
      return { NOT: { [field]: null } } as MediaWhereInput;
    default:
      return {};
  }
}

function buildWhere(query: Tex7RepositoryQuery | undefined, organizationId: string): MediaWhereInput {
  const conditions: MediaWhereInput[] = [{ organizationId }];

  if (!query?.includeDeleted) {
    conditions.push({ archivedAt: null });
  }

  if (query?.filter) {
    conditions.push(filterToWhere(query.filter));
  }

  return { AND: conditions };
}

function buildOrderBy(sort: readonly Tex7RepositorySort[] | undefined): MediaOrderByInput[] {
  if (!sort?.length) {
    return [{ updatedAt: "desc" }, { id: "asc" }];
  }

  return sort.map((item) => ({ [mapField(item.field)]: item.direction }) as MediaOrderByInput);
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

function disabledWriteResult<TEntity>(
  operation: string,
  context?: Tex7RepositoryContext,
): Promise<Tex7RepositoryResult<Tex7RepositoryWriteResult<TEntity>, MediaFailureCode>> {
  return Promise.resolve(
    tex7RepositoryFailure(
      "TEX7_REPOSITORY_WRITE_DISABLED",
      "Prisma Media repository writes are defined for contract compatibility but disabled for this controlled pilot.",
      {
        recoverable: true,
        details: { operation, repositoryKey, writesEnabled: false },
        meta: resultMeta(operation, context),
      },
    ),
  );
}

export const prismaMediaRepository: Tex7RepositoryContract<Tex7PrismaMediaEntity> = {
  key: repositoryKey,
  entityType: "Media",
  read: {
    async findMany(
      query?: Tex7RepositoryQuery,
      context?: Tex7RepositoryContext,
    ): Promise<Tex7RepositoryResult<Tex7RepositoryConnection<Tex7PrismaMediaEntity>, MediaFailureCode>> {
      const tenant = requireTenantContext("findMany", context);

      if (!tenant.ok) {
        return tenant;
      }

      try {
        const prisma = getTex7PrismaClient();
        const where = buildWhere(query, tenant.data);
        const orderBy = buildOrderBy(query?.sort);
        const pagination = getOffsetPagination(query);
        const [records, totalCount] = await Promise.all([
          prisma.media.findMany({
            where,
            orderBy,
            skip: pagination.skip,
            take: pagination.take,
          }),
          prisma.media.count({ where }),
        ]);
        const nodes = records.map(mapPrismaMediaToDomain);
        const startCursor = nodes[0]?.id;
        const endCursor = nodes[nodes.length - 1]?.id;

        return tex7RepositorySuccess(
          {
            nodes,
            pageInfo: {
              hasNextPage: pagination.skip + nodes.length < totalCount,
              hasPreviousPage: pagination.skip > 0,
              startCursor,
              endCursor,
              totalCount,
            },
          },
          resultMeta("findMany", context),
        );
      } catch (error) {
        return tex7RepositoryFailure("TEX7_REPOSITORY_UNKNOWN_ERROR", "Unable to read Prisma Media records.", {
          recoverable: true,
          details: { error: error instanceof Error ? error.message : String(error) },
          meta: resultMeta("findMany", context),
        });
      }
    },

    async findById(
      id: Tex7RepositoryEntityId,
      context?: Tex7RepositoryContext,
    ): Promise<Tex7RepositoryResult<Tex7PrismaMediaEntity | null, MediaFailureCode>> {
      const tenant = requireTenantContext("findById", context);

      if (!tenant.ok) {
        return tenant;
      }

      try {
        const record = await getTex7PrismaClient().media.findFirst({
          where: {
            id: String(id),
            organizationId: tenant.data,
            archivedAt: null,
          },
        });

        return tex7RepositorySuccess(record ? mapPrismaMediaToDomain(record) : null, resultMeta("findById", context));
      } catch (error) {
        return tex7RepositoryFailure("TEX7_REPOSITORY_UNKNOWN_ERROR", "Unable to read a Prisma Media record.", {
          recoverable: true,
          details: { id, error: error instanceof Error ? error.message : String(error) },
          meta: resultMeta("findById", context),
        });
      }
    },

    async exists(
      id: Tex7RepositoryEntityId,
      context?: Tex7RepositoryContext,
    ): Promise<Tex7RepositoryResult<boolean, MediaFailureCode>> {
      const tenant = requireTenantContext("exists", context);

      if (!tenant.ok) {
        return tenant;
      }

      try {
        const count = await getTex7PrismaClient().media.count({
          where: {
            id: String(id),
            organizationId: tenant.data,
            archivedAt: null,
          },
        });

        return tex7RepositorySuccess(count > 0, resultMeta("exists", context));
      } catch (error) {
        return tex7RepositoryFailure("TEX7_REPOSITORY_UNKNOWN_ERROR", "Unable to check Prisma Media existence.", {
          recoverable: true,
          details: { id, error: error instanceof Error ? error.message : String(error) },
          meta: resultMeta("exists", context),
        });
      }
    },
  },
  write: {
    create(
      input: Partial<Tex7PrismaMediaEntity>,
      options?: Tex7RepositoryCreateOptions,
      context?: Tex7RepositoryContext,
    ) {
      void input;
      void options;
      return disabledWriteResult<Tex7PrismaMediaEntity>("create", context);
    },
    update(
      id: Tex7RepositoryEntityId,
      input: Partial<Tex7PrismaMediaEntity>,
      options?: Tex7RepositoryUpdateOptions,
      context?: Tex7RepositoryContext,
    ) {
      void id;
      void input;
      void options;
      return disabledWriteResult<Tex7PrismaMediaEntity>("update", context);
    },
    softDelete(
      id: Tex7RepositoryEntityId,
      options: Tex7RepositorySoftDeleteOptions,
      context?: Tex7RepositoryContext,
    ) {
      void id;
      void options;
      return disabledWriteResult<Tex7PrismaMediaEntity>("archive", context);
    },
    restore(
      id: Tex7RepositoryEntityId,
      options: Tex7RepositoryRestoreOptions,
      context?: Tex7RepositoryContext,
    ) {
      void id;
      void options;
      return disabledWriteResult<Tex7PrismaMediaEntity>("restore", context);
    },
  },
};