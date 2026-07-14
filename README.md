# Gallery 015 Platform

Production deployment candidate for the Gallery 015 institutional art platform.

## Local setup

```bash
cp .env.example .env.local
npm ci
npm run prisma:validate
npm run prisma:generate
npm run db:migrate:deploy
npm run data:migrate:dry-run
npm run dev
```

Open `http://localhost:3000` and `http://localhost:3000/admin/login`.

## Production verification

```bash
npm run production:verify
```

See `PRODUCTION_DEPLOYMENT.md` for PostgreSQL, object storage, GitHub, and Netlify instructions.

## Data policy

PostgreSQL/Prisma is the runtime source of truth. Files under `data/` are retained only for the controlled one-time legacy import and must not be used by public runtime repositories.
