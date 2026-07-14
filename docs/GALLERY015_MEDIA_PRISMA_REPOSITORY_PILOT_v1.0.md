# Gallery 015 Media Prisma Repository Pilot v1.0

## Status

Database Integration — Controlled Pilot.

Sprint 73 implements the first Prisma-backed repository pilot for Media behind the existing TEX7 repository contracts.

The JSON-backed Media runtime remains operational and unchanged.

No public UI, admin UI, CRUD engine, Form engine, Table engine, Runtime engine, authentication, migration, database push, JSON import, or production-write path was modified.

## Files Implemented

- `src/lib/tex7/database/providers/prisma-client.ts`
- `src/lib/tex7/database/providers/prisma-media-mapper.ts`
- `src/lib/tex7/repository/providers/prisma-media-repository.ts`
- `src/lib/tex7/repository/providers/index.ts`

## Contract Mapping

The pilot repository exports `prismaMediaRepository` as a `Tex7RepositoryContract`.

Contract identity:

- Repository key: `gallery015.media.prisma`
- Entity type: `Media`
- Provider: `prisma`

Supported read contract methods:

- `findById`
- `findMany`
- `exists`

Defined write contract methods:

- `create`
- `update`
- `softDelete` as archive
- `restore`

All write methods return a typed write-disabled repository failure.

## Prisma-to-Domain Mapping

Prisma `Media` records are mapped to the existing provider-neutral Media/domain shape.

Mapping highlights:

- `id` → `id`
- `organizationId` → `organization_id`
- `storagePath` → `url` and `storage_path`
- `mediaType` → lowercase domain `type`
- `mimeType` → `mime_type`
- `altText` → `alt_en` and `alt_ar`
- `fileSize` → `file_size`
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`
- `archivedAt` → `archived_at`

The mapper stays isolated inside the TEX7 Prisma provider layer.

## Tenant-Scoping Behavior

Every read method requires a TEX7 repository context with `tenantId`.

The repository applies `organizationId = context.tenantId` to every Prisma read.

Unscoped calls return a typed isolation failure:

- `TEX7_REPOSITORY_TENANT_CONTEXT_REQUIRED`

There is no unscoped list or lookup path.

If a caller provides a filter that attempts to target a different organization, the repository still applies the required tenant condition through an `AND` clause.

## Supported Read Operations

### findById

Looks up a Media record by:

- `id`
- required `organizationId`
- non-archived status

### exists

Checks whether a Media record exists by:

- `id`
- required `organizationId`
- non-archived status

### findMany

Supports:

- tenant-scoped listing
- filtering
- sorting
- offset pagination
- total count
- page cursors based on returned record IDs
- optional archived record inclusion through `includeDeleted`

Default pagination is applied when no pagination input is provided.

## Disabled Write Operations

The pilot defines write methods for future contract compatibility, but writes remain disabled by default.

Disabled methods:

- create
- update
- archive through `softDelete`
- restore

Each returns:

- `TEX7_REPOSITORY_WRITE_DISABLED`

No Prisma create, update, delete, upsert, archive, restore, seed, import, migration, or database push operation is executed by this pilot.

## Prisma Client Lifecycle

The Prisma client is isolated in:

- `src/lib/tex7/database/providers/prisma-client.ts`

Development reload safety is handled through a `globalThis` singleton cache.

Production creates a new client instance through the provider entrypoint without activating the Gallery runtime.

No direct Prisma usage is introduced outside the TEX7 provider implementation files.

## Runtime Activation Status

Not activated.

Existing Gallery 015 Media runtime continues to use the JSON-backed repository/loaders.

Gallery modules remain unaware of Prisma.

## Production Write Status

Disabled.

This sprint does not enable production writes.

## Remaining Cutover Work

Before Prisma Media can replace JSON runtime reads or writes, the following remain required:

- controlled database migration
- database deployment or push approval
- JSON-to-database import plan and execution approval
- runtime provider registration
- repository cutover switch
- production authorization policy
- production write enablement approval
- write-path tenant authorization checks
- operational rollback plan