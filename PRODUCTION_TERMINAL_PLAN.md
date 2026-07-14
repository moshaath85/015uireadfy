# Gallery 015 — Mac Terminal Production Plan

Use this file after downloading and extracting the project.

## 1. Open the project

```bash
cd "/path/to/015_Gallery"
```

## 2. Confirm Node and npm

```bash
node -v
npm -v
```

Use Node 20.x. If needed:

```bash
nvm install 20
nvm use 20
```

## 3. Create local environment

```bash
cp .env.example .env.local
open -e .env.local
```

Fill the real PostgreSQL, admin and object-storage values. Never commit `.env.local`.

## 4. Clean and install

```bash
rm -rf node_modules .next .netlify
npm ci
```

## 5. Prisma baseline

```bash
npm run prisma:validate
npm run prisma:generate
npm run db:migrate:status
```

Do not run a destructive reset. Apply existing production migrations only after confirming the correct database:

```bash
npm run db:migrate:deploy
```

## 6. Import legacy JSON once

Preview first:

```bash
npm run data:migrate:dry-run
```

Then execute after reviewing the totals:

```bash
npm run data:migrate
```

## 7. Verify locally

```bash
npm run typecheck
npm run build
npm run dev
```

Open:

- Public: http://localhost:3000
- CMS: http://localhost:3000/admin/login

Test artists, artworks, collections, exhibitions, projects, media upload and certificate verification.

## 8. GitHub baseline

```bash
git init
git add .
git commit -m "release: Gallery 015 production baseline"
git branch -M main
git remote add origin https://github.com/moshaath85/galary015.git
git push -u origin main
```

If `origin` already exists:

```bash
git remote set-url origin https://github.com/moshaath85/galary015.git
git push -u origin main
```

## 9. Netlify

Connect the GitHub repository. Add every value documented in `.env.example` to Netlify Environment Variables. Do not upload `.env.local`.

Build command and Next.js handling are defined in `netlify.toml` and `package.json`.

## Stop conditions

Stop and share the exact terminal output before continuing if:

- Prisma reports a missing or drifted migration.
- The migration targets the wrong PostgreSQL database.
- JSON import reports conflicts or orphaned relations.
- TypeScript or production build fails.
- Object storage upload fails.
