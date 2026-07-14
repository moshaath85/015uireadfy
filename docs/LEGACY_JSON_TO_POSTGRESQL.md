# Legacy JSON → PostgreSQL Migration

This migration moves Gallery 015 legacy content from `/data/*.json` into the existing Prisma/PostgreSQL schema.

## Safety

- Idempotent upserts by stable legacy ID.
- No table truncation and no record deletion.
- Parent entities are imported before relationship records.
- Relationship integrity is validated before any database write.
- A machine-readable `legacy-migration-report.json` is generated after every run.

## Required environment

```env
DATABASE_URL="postgresql://..."
GALLERY015_ADMIN_ORGANIZATION_ID="gallery-015"
```

## Commands

Validate all legacy files without connecting to PostgreSQL:

```bash
npm run data:migrate:dry-run
```

Execute the import against the configured PostgreSQL database:

```bash
npm run prisma:generate
npm run data:migrate
```

Run the execute command again safely when required; existing records are updated rather than duplicated.

## Import order

1. Organization and site settings
2. Media
3. Artists
4. Collections
5. Artworks
6. Exhibitions
7. Projects
8. Services
9. News
10. Publications
11. Certificates
12. Join relationships

The legacy JSON files remain migration inputs only. Public pages already use repository/Prisma adapters and must not be changed back to direct JSON imports.
