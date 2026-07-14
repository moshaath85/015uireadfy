# Gallery 015 — Production Deployment

## Required environment variables

Set these in Netlify Site configuration → Environment variables. Never commit real values.

- `TEX7_DATABASE_ENV=production`
- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `GALLERY015_ADMIN_EMAIL`
- `GALLERY015_ADMIN_PASSWORD`
- `GALLERY015_ADMIN_NAME`
- `GALLERY015_ADMIN_ROLE`
- `GALLERY015_ADMIN_ORGANIZATION_ID`
- `GALLERY015_ADMIN_SESSION_SECRET`
- `OBJECT_STORAGE_ENDPOINT`
- `OBJECT_STORAGE_REGION`
- `OBJECT_STORAGE_BUCKET`
- `OBJECT_STORAGE_ACCESS_KEY_ID`
- `OBJECT_STORAGE_SECRET_ACCESS_KEY`
- `OBJECT_STORAGE_PUBLIC_BASE_URL`
- `OBJECT_STORAGE_FORCE_PATH_STYLE`

## First production database deployment

Run from a trusted terminal with the production `DATABASE_URL` loaded:

```bash
npm ci
npm run prisma:validate
npm run prisma:generate
npm run db:migrate:deploy
npm run data:migrate:dry-run
npm run data:migrate
npm run production:verify
```

The JSON migration is idempotent and should be executed only after reviewing the dry-run output and confirming a database backup exists.

## GitHub and Netlify

1. Push this folder to the production GitHub repository.
2. Connect the repository to Netlify.
3. Netlify reads `netlify.toml` automatically.
4. Add all environment variables before the first deploy.
5. Trigger the first deploy.
6. Verify `/`, `/admin/login`, `/robots.txt`, and `/sitemap.xml`.

## Object storage

The application supports S3-compatible storage. The bucket must exist before upload testing. Configure public access or a public CDN base URL matching `OBJECT_STORAGE_PUBLIC_BASE_URL`.
