# Gallery 015 Media Prisma Foundation v1.0

## Sprint

Gallery 015 — Sprint 68  
Product Layer — Phase 1  
Media Domain Foundation

## Scope

This sprint implements only the Gallery 015 `Media` Prisma model on top of the completed TEX7 Platform foundation.

No TEX7 Platform contracts, repository contracts, runtime code, authentication, dashboard, CRUD, forms, public UI, Gallery runtime modules, JSON import, migration, database push, or production write path was modified or enabled.

## Implemented Prisma Changes

Updated only the Prisma schema for the product-layer Media foundation.

### Added enums

#### `MediaType`

Implemented values:

- `IMAGE`
- `VIDEO`
- `AUDIO`
- `DOCUMENT`
- `OTHER`

Purpose:

- Provides a provider-neutral media classification field.
- Avoids coupling Media to Artist, Artwork, Collection, or other business domains.

#### `MediaVisibility`

Implemented values:

- `PUBLIC`
- `PRIVATE`
- `VIP`
- `HIDDEN`

Purpose:

- Matches the approved Gallery visibility policy already present in the existing product type layer.
- Defaults new Media records to `PRIVATE` at the Prisma model level.
- Does not enable production writes.

## Implemented Model

### `Media`

Implemented fields:

| Prisma field | Database column mapping | Type | Required | Notes |
|---|---|---:|---:|---|
| `id` | `id` | `String` | Yes | Primary key with `cuid()` default |
| `organizationId` | `organization_id` | `String` | Yes | Required tenant ownership field |
| `filename` | `filename` | `String` | Yes | Stored filename |
| `originalFilename` | `original_filename` | `String` | Yes | Original uploaded filename |
| `mimeType` | `mime_type` | `String` | Yes | MIME type |
| `mediaType` | `media_type` | `MediaType` | Yes | Media classification enum |
| `storagePath` | `storage_path` | `String` | Yes | Storage object path |
| `altText` | `alt_text` | `String?` | No | Accessibility text |
| `width` | `width` | `Int?` | No | Image/video width when applicable |
| `height` | `height` | `Int?` | No | Image/video height when applicable |
| `fileSize` | `file_size` | `Int` | Yes | File size in bytes |
| `visibility` | `visibility` | `MediaVisibility` | Yes | Defaults to `PRIVATE` |
| `checksum` | `checksum` | `String?` | No | Included because checksum is present in the existing approved Media product type |
| `createdAt` | `created_at` | `DateTime` | Yes | Defaults to `now()` |
| `updatedAt` | `updated_at` | `DateTime` | Yes | Uses Prisma `@updatedAt` |
| `archivedAt` | `archived_at` | `DateTime?` | No | Archive support for future soft-archive behavior |

## Implemented Relations

### `Organization` → `Media`

Implemented relation:

- `Organization.media` → `Media[]`
- `Media.organization` → `Organization`

Relation details:

- `Media.organizationId` references `Organization.id`.
- `onDelete: Restrict` prevents accidental cascading deletion of organization-owned media.
- Media belongs to exactly one Organization.
- No Artist relation was added.
- No Artwork relation was added.
- No Collection relation was added.
- No other business-domain relation was added.

## Implemented Indexes

Implemented indexes:

| Index | Purpose |
|---|---|
| `@@index([organizationId])` | Tenant/organization scoped lookup |
| `@@index([mediaType])` | Media type filtering |
| `@@index([mimeType])` | MIME type filtering |
| `@@index([visibility])` | Visibility policy filtering |
| `@@index([archivedAt])` | Archive filtering |
| `@@index([updatedAt])` | Recent update ordering/sync support |

## Implemented Constraints

Implemented constraints:

- `id` is the primary key.
- `organizationId` is required.
- `organizationId` has a required relation to `Organization.id`.
- `filename` is required.
- `originalFilename` is required.
- `mimeType` is required.
- `mediaType` is required.
- `storagePath` is required.
- `fileSize` is required.
- `visibility` is required and defaults to `PRIVATE`.
- `createdAt` defaults to current time.
- `updatedAt` is maintained by Prisma.
- Organization deletion is restricted while Media records reference it.

No uniqueness constraint was added for checksum, filename, storage path, or original filename because the sprint did not approve such uniqueness rules.

## Quality Review

Confirmed:

- Media belongs to Organization.
- Visibility follows the approved Gallery visibility policy.
- Archive support exists through `archivedAt`.
- No business-domain coupling was introduced.
- No Artist relation was added.
- No Artwork relation was added.
- No Collection relation was added.
- Runtime remains unchanged.
- Repository contracts remain unchanged.
- No Gallery module directly references Prisma.
- Production writes remain disabled.
- No JSON import was performed.

## Validation Results

Commands executed:

```bash
DATABASE_URL="postgresql://gallery015:gallery015@localhost:5432/gallery015" npx prisma validate
DATABASE_URL="postgresql://gallery015:gallery015@localhost:5432/gallery015" npx prisma generate
npm run build
```

Results:

- Prisma validation: PASS
- Prisma client generation: PASS
- Production build: PASS

Observed result:

- Prisma schema loaded successfully.
- Prisma schema is valid.
- Prisma Client v5.22.0 generated successfully.
- Next.js production build compiled successfully.
- Static generation completed successfully for all listed routes.

## Prohibited Actions Not Performed

Not executed:

- `prisma migrate`
- `prisma db push`
- Database writes
- JSON import
- Runtime Prisma activation
- Repository replacement
- Authentication changes
- Dashboard changes
- CRUD changes
- Form changes
- Public UI changes
- Gallery module changes
- TEX7 Platform changes

## Remaining Blockers

No Sprint 68 validation blockers remain.

Future work remains required before runtime database use:

- Approved Prisma migration sprint.
- Approved provider/repository adapter sprint.
- Approved JSON-to-database import or migration sprint.
- Approved production write enablement sprint.
- Future domain relation sprints for Artist, Artwork, Collection, and other Gallery entities.

## Production Write Status

Production writes remain disabled.