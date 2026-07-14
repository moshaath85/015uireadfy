# Gallery 015 DB-ENV-1 Production Data Foundation

## Current status

Gallery 015 already has a PostgreSQL Prisma datasource and generated Prisma client foundation. TEX7 database and repository contracts exist, and Prisma-backed repository contracts exist for the approved Gallery modules. The currently active Prisma runtime remains the development-only provider from the previous sprint, with repository writes and transactions disabled.

This sprint prepares environment separation and readiness only. It does not implement CMS CRUD, module persistence, media upload, JSON import, production data creation, production migrations, or production writes.

## Environment variables

All environments use Prisma's `DATABASE_URL`, but each environment must receive a different value from the environment secret store.

| Environment | Required variables | Database target |
| --- | --- | --- |
| Development | `TEX7_DATABASE_ENV=development`, `DATABASE_URL`, optional `TEX7_DATABASE_RUNTIME=prisma-development` | Development PostgreSQL database only |
| Staging | `TEX7_DATABASE_ENV=staging`, `DATABASE_URL` | Staging PostgreSQL database only |
| Production | `TEX7_DATABASE_ENV=production`, `DATABASE_URL` | Production PostgreSQL database only |

Optional deployment context:

| Platform context | Required database environment |
| --- | --- |
| Local or Atoms development | Development |
| Netlify deploy preview or branch deploy | Staging |
| Netlify production | Production |

## Separation rules

- Development, Staging, and Production must use separate PostgreSQL databases and separate credentials.
- Local and Atoms development must never receive Production credentials.
- Netlify preview and branch deploy contexts must use Staging only.
- Netlify production context must use Production only.
- Production credentials must never be committed to Git.
- Real credentials must be stored only in the owner-controlled deployment secret store.

## Data governance

- Code deployment does not modify stored client data.
- GitHub and Netlify are application code delivery systems, not client data stores.
- PostgreSQL is the future source of truth for structured client data.
- Object Storage is the future source of truth for media files.
- JSON files are not production persistence.
- Migrations are separate controlled operations and must not be tied to ordinary code deploys.
- Backups are mandatory before production migrations.
- Media files must not be stored in GitHub.

## Provider readiness

The Prisma datasource already targets PostgreSQL through `DATABASE_URL`. The TEX7 Prisma client foundation now exposes environment-resolution and safety-evaluation helpers so readiness checks can confirm whether the current runtime is allowed to use Development, Staging, or Production.

No repository write path was enabled in this sprint. Existing TEX7 repository contracts remain the boundary for future persistence work.

## Staging validation gate

Staging validation requires an owner-approved Staging `DATABASE_URL` set in the runtime environment with `TEX7_DATABASE_ENV=staging`.

Allowed validation commands for this sprint:

```bash
npx prisma validate
npx prisma generate
node -e 'const { PrismaClient } = require("@prisma/client"); const prisma = new PrismaClient(); prisma.$queryRaw`SELECT 1`.then(() => console.log("staging database health check passed")).finally(() => prisma.$disconnect())'
npm run build
```

Forbidden commands:

```bash
npx prisma db push
npx prisma migrate reset
destructive SQL
production seed
production data deletion
production migration application
```

## External setup required

The owner must provide:

- Development PostgreSQL database and credentials.
- Staging PostgreSQL database and credentials.
- Production PostgreSQL database and credentials.
- Netlify preview or branch deploy secret mapping to Staging.
- Netlify production secret mapping to Production.
- Backup policy and restore procedure before any future Production migration.