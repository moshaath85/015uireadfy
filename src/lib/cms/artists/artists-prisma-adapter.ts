import { randomUUID } from "crypto";
import { getTex7PrismaClient } from "@/lib/tex7/database/providers/prisma-client";
import { VisibilityStatus, type Artist } from "@/types";
import type { ArtistMutationInput } from "./artists-validation";

export type ArtistPrismaWriteOperation = "create" | "update" | "archive";

export type ArtistPrismaWriteBlockReason =
  | "database_unavailable"
  | "invalid_payload"
  | "duplicate_record"
  | "mutation_not_implemented";

export interface ArtistPrismaWriteSuccess {
  readonly ok: true;
  readonly operation: ArtistPrismaWriteOperation;
  readonly target: "postgresql.artist";
  readonly record: Artist;
  readonly message: string;
}

export interface ArtistPrismaWriteFailure {
  readonly ok: false;
  readonly operation: ArtistPrismaWriteOperation;
  readonly target: "postgresql.artist";
  readonly reason: ArtistPrismaWriteBlockReason;
  readonly message: string;
  readonly details?: readonly string[];
}

export type ArtistPrismaWriteResult = ArtistPrismaWriteSuccess | ArtistPrismaWriteFailure;

export interface ArtistPrismaSaveOptions {
  readonly organizationId: string;
  readonly now?: string;
}

function toDomainArtist(record: {
  readonly id: string;
  readonly slug: string;
  readonly nameEn: string;
  readonly nameAr: string;
  readonly bioEn: string;
  readonly bioAr: string;
  readonly birthYear: number;
  readonly nationalityEn: string;
  readonly nationalityAr: string;
  readonly website: string | null;
  readonly email: string | null;
  readonly instagram: string | null;
  readonly profileImageId: string | null;
  readonly featured: boolean;
  readonly displayOrder: number;
  readonly representationStatus: string;
  readonly visibilityStatus: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}): Artist {
  return {
    id: record.id,
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
    visibility_status: record.visibilityStatus as VisibilityStatus,
    created_at: record.createdAt.toISOString(),
    updated_at: record.updatedAt.toISOString(),
  };
}

function toPrismaData(input: ArtistMutationInput) {
  return {
    slug: input.slug,
    nameEn: input.name_en,
    nameAr: input.name_ar,
    bioEn: input.bio_en,
    bioAr: input.bio_ar,
    birthYear: input.birth_year,
    nationalityEn: input.nationality_en,
    nationalityAr: input.nationality_ar,
    website: input.website ?? null,
    email: input.email ?? null,
    instagram: input.instagram ?? null,
    profileImageId: input.profile_image_id ?? null,
    featured: input.featured,
    displayOrder: input.display_order,
    representationStatus: input.representation_status,
    visibilityStatus: input.visibility_status,
  };
}

function failure(
  operation: ArtistPrismaWriteOperation,
  reason: ArtistPrismaWriteBlockReason,
  message: string,
  details: readonly string[] = [],
): ArtistPrismaWriteFailure {
  return {
    ok: false,
    operation,
    target: "postgresql.artist",
    reason,
    message,
    details,
  };
}

function getPrismaErrorCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { readonly code?: unknown }).code ?? "")
    : undefined;
}

function getPrismaErrorMetaValue(error: unknown, key: "target" | "field_name"): string {
  if (typeof error !== "object" || error === null || !("meta" in error)) {
    return key === "target" ? "unique_constraint" : "foreign_key";
  }

  const meta = (error as { readonly meta?: Record<string, unknown> }).meta;
  return String(meta?.[key] ?? (key === "target" ? "unique_constraint" : "foreign_key"));
}

function mapPrismaError(operation: ArtistPrismaWriteOperation, error: unknown): ArtistPrismaWriteFailure {
  const code = getPrismaErrorCode(error);

  if (code === "P2002") {
    return failure(operation, "duplicate_record", "Artist id or slug already exists in PostgreSQL.", [
      getPrismaErrorMetaValue(error, "target"),
    ]);
  }

  if (code === "P2003") {
    return failure(operation, "invalid_payload", "Artist references an organization or media record that does not exist.", [
      getPrismaErrorMetaValue(error, "field_name"),
    ]);
  }

  if (code === "P2025") {
    return failure(operation, "invalid_payload", "Artist record was not found in PostgreSQL.", []);
  }

  return failure(
    operation,
    "database_unavailable",
    error instanceof Error ? error.message : "PostgreSQL artist mutation did not complete.",
  );
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

async function ensureArtistWriteOrganization(organizationId: string): Promise<void> {
  await getTex7PrismaClient().organization.upsert({
    where: {
      id: organizationId,
    },
    create: {
      id: organizationId,
      name: "Gallery 015",
      slug: organizationSlugFromId(organizationId),
      status: "active",
    },
    update: {},
  });
}

async function getPublicOrganizationId(): Promise<string | null> {
  const configuredOrganizationId = process.env.GALLERY015_ADMIN_ORGANIZATION_ID?.trim();

  if (configuredOrganizationId) {
    return configuredOrganizationId;
  }

  try {
    const organization = await getTex7PrismaClient().organization.findFirst({
      where: {
        status: "active",
        archivedAt: null,
        suspendedAt: null,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
      },
    });

    return organization?.id ?? null;
  } catch {
    return null;
  }
}

export async function listArtistPrismaRecords(organizationId: string): Promise<readonly Artist[]> {
  try {
    const records = await getTex7PrismaClient().artist.findMany({
      where: {
        organizationId,
        archivedAt: null,
      },
      orderBy: [
        { displayOrder: "asc" },
        { updatedAt: "desc" },
      ],
    });

    return records.map(toDomainArtist);
  } catch {
    return [];
  }
}

export async function listPublicArtistPrismaRecords(options: { readonly featuredOnly?: boolean } = {}): Promise<readonly Artist[]> {
  const organizationId = await getPublicOrganizationId();

  if (!organizationId) {
    return [];
  }

  try {
    const records = await getTex7PrismaClient().artist.findMany({
      where: {
        organizationId,
        archivedAt: null,
        visibilityStatus: VisibilityStatus.Public,
        ...(options.featuredOnly ? { featured: true } : {}),
      },
      orderBy: [
        { displayOrder: "asc" },
        { updatedAt: "desc" },
      ],
    });

    return records.map(toDomainArtist);
  } catch {
    return [];
  }
}

export async function findPublicArtistPrismaRecordBySlug(slug: Artist["slug"]): Promise<Artist | null> {
  const organizationId = await getPublicOrganizationId();

  if (!organizationId) {
    return null;
  }

  try {
    const record = await getTex7PrismaClient().artist.findFirst({
      where: {
        organizationId,
        slug,
        archivedAt: null,
        visibilityStatus: VisibilityStatus.Public,
      },
    });

    return record ? toDomainArtist(record) : null;
  } catch {
    return null;
  }
}

export async function findArtistPrismaRecord(artistId: Artist["id"], organizationId: string): Promise<Artist | null> {
  try {
    const record = await getTex7PrismaClient().artist.findFirst({
      where: {
        organizationId,
        id: artistId,
        archivedAt: null,
      },
    });

    return record ? toDomainArtist(record) : null;
  } catch {
    return null;
  }
}

export async function createArtistPrismaRecord(
  input: ArtistMutationInput,
  options: ArtistPrismaSaveOptions,
): Promise<ArtistPrismaWriteResult> {
  try {
    const now = options.now ? new Date(options.now) : new Date();
    await ensureArtistWriteOrganization(options.organizationId);
    const record = await getTex7PrismaClient().artist.create({
      data: {
        id: `art-${randomUUID()}`,
        organizationId: options.organizationId,
        ...toPrismaData(input),
        createdAt: now,
        updatedAt: now,
      },
    });

    return {
      ok: true,
      operation: "create",
      target: "postgresql.artist",
      record: toDomainArtist(record),
      message: "Artist was saved to PostgreSQL.",
    };
  } catch (error) {
    return mapPrismaError("create", error);
  }
}

export async function updateArtistPrismaRecord(
  artistId: Artist["id"],
  input: ArtistMutationInput,
  options: ArtistPrismaSaveOptions,
): Promise<ArtistPrismaWriteResult> {
  try {
    const record = await getTex7PrismaClient().artist.update({
      where: {
        organizationId_id: {
          organizationId: options.organizationId,
          id: artistId,
        },
      },
      data: {
        ...toPrismaData(input),
        updatedAt: options.now ? new Date(options.now) : new Date(),
      },
    });

    return {
      ok: true,
      operation: "update",
      target: "postgresql.artist",
      record: toDomainArtist(record),
      message: "Artist was updated in PostgreSQL.",
    };
  } catch (error) {
    return mapPrismaError("update", error);
  }
}

export async function archiveArtistPrismaRecord(
  artistId: Artist["id"],
  options: ArtistPrismaSaveOptions,
): Promise<ArtistPrismaWriteResult> {
  try {
    const now = options.now ? new Date(options.now) : new Date();
    const record = await getTex7PrismaClient().artist.update({
      where: {
        organizationId_id: {
          organizationId: options.organizationId,
          id: artistId,
        },
      },
      data: {
        visibilityStatus: VisibilityStatus.Hidden,
        archivedAt: now,
        updatedAt: now,
      },
    });

    return {
      ok: true,
      operation: "archive",
      target: "postgresql.artist",
      record: toDomainArtist(record),
      message: "Artist was archived in PostgreSQL.",
    };
  } catch (error) {
    return mapPrismaError("archive", error);
  }
}