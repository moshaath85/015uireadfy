# Gallery 015 Tenant Relation Enforcement v1.0

## Status

Product Layer — Tenant Integrity Correction completed.

This patch resolves the Gallery Core tenant-integrity conditions identified after Sprint 72 for:

- Artist profile media
- Collection cover media
- Artist archive parity

No new Prisma models were added.

No migrations were created.

No database push was executed.

No runtime, repository, authentication, dashboard, public UI, JSON import, or production-write path was modified.

## Scope

Reviewed and aligned only the approved Gallery Core Prisma entities:

- Organization
- Media
- Artist
- Collection
- Artwork

The patch remains schema-foundation only and does not enable production writes.

## Tenant Boundary

`Organization` remains the tenant root.

All Gallery Core product-layer entities remain organization-owned:

- `Media.organizationId`
- `Artist.organizationId`
- `Collection.organizationId`
- `Artwork.organizationId`

Tenant-sensitive media presentation relations are aligned to the same tenant boundary by using compound relation fields that include `organizationId`.

## Artist Profile Media Alignment

`Artist.profileImage` is tenant-scoped through the compound relation:

```prisma
profileImage Media? @relation("ArtistProfileImage", fields: [organizationId, profileImageId], references: [organizationId, id], onDelete: Restrict)
```

This means an Artist profile image can only resolve to a Media record with the same `organizationId` when database constraints are applied.

The relation is optional because an Artist may exist without a profile image.

The supporting lookup index is tenant-aligned:

```prisma
@@index([organizationId, profileImageId])
```

Result: PASS.

## Collection Cover Media Alignment

`Collection.coverMedia` is tenant-scoped through the compound relation:

```prisma
coverMedia Media? @relation("CollectionCoverMedia", fields: [organizationId, coverMediaId], references: [organizationId, id], onDelete: Restrict)
```

This means a Collection cover image can only resolve to a Media record with the same `organizationId` when database constraints are applied.

The relation is optional because a Collection may exist without a cover image.

The supporting lookup index is tenant-aligned:

```prisma
@@index([organizationId, coverMediaId])
```

Result: PASS.

## Media Compound Target

`Media` exposes the compound uniqueness target required by tenant-scoped media relations:

```prisma
@@unique([organizationId, id])
```

This supports tenant-aligned relations from:

- Artist profile media
- Collection cover media
- Artwork primary media

Result: PASS.

## Artist Archive Parity Decision

Artist archive parity is approved and present.

`Artist` includes the same nullable timestamp archive strategy used by other Gallery Core product-layer entities:

```prisma
archivedAt DateTime? @map("archived_at")
@@index([archivedAt])
```

This keeps Artist aligned with:

- Organization archive status
- SystemConfiguration archive status
- Media archive status
- Collection archive status
- Artwork archive status

The archive strategy remains soft-delete oriented and does not introduce destructive cascade behavior.

Result: PASS.

## Delete Policy

Tenant-owned relations continue to use restrictive delete behavior.

Aligned media presentation relations use `onDelete: Restrict` rather than destructive cascade or automatic nulling.

This prevents accidental deletion of media that is still referenced by Artists, Collections, or Artworks.

Result: PASS.

## Production Write Position

Production writes remain disabled.

This patch does not add:

- Prisma migrations
- `prisma db push`
- runtime repository switching
- JSON import
- write API activation
- admin dashboard changes
- authentication or authorization changes

Before production writes are enabled, write paths must still enforce tenant authorization at the service/repository boundary in addition to the schema-level relation constraints.

## Validation Commands

Required validation commands for this patch:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/gallery015" node node_modules/prisma/build/index.js validate
DATABASE_URL="postgresql://user:password@localhost:5432/gallery015" node node_modules/prisma/build/index.js generate
npm run build
```

Not executed:

```bash
prisma migrate
prisma db push
```

## Verdict

PASS.

Artist profile media and Collection cover media are tenant-aligned through compound `organizationId` relations.

Artist archive parity is accepted and present through `Artist.archivedAt`.

The Gallery Core schema remains migration-ready but production-write disabled.