# Gallery 015 — Production Freeze Baseline

This document records the exact state of the Gallery 015 codebase at the UI/UX
freeze point, so the project can be returned to a known-good state if later
content or production work causes a regression.

## Freeze tag

- **Tag:** `phase6-freeze-e80b5c1`
- **Commit SHA:** `e80b5c1f7b0d375fdb04f021322c5366a9de4660`
- **Branch:** `uiux-controlled-99`
- **Created:** Phase 6 (production & content readiness pass)
- **UI/UX score at freeze:** 95/100 (institutional benchmark)

## Canonicalization (one repo / one source of truth)

Owner decision: Gallery 015 must be ONE repo / folder / branch / site / DB.

- **Canonical local folder:** `/Users/apple/Downloads/015_Gallery_GitHub_Ready_Sprint_01`
- **Canonical repository:** `https://github.com/moshaath85/015uireadfy.git`
- **Canonical production branch:** `main`
- **Recovery tag (pre-canonicalization):** `gallery015-pre-canonicalization`
  → commit `b2bff68` (includes all approved UI/UX + Phase 6.1 XLSX/content work)
- Local `main` was fast-forwarded to `b2bff68` (identical to `uiux-controlled-99`).
- **Status of push to origin/main:** BLOCKED by this environment (the git
  smart-HTTP receive-pack endpoint to GitHub hangs; API/raw HTTPS work). The
  push must be run from a machine with push network access:
  `git push origin main` (fast-forward; no force needed).

> The UI/UX is frozen. Do not redesign pages, change typography, spacing,
> homepage hierarchy, navigation, animations, colors, or public components
> unless fixing a proven functional bug.

## Repository

- **Project root:** `/Users/apple/Downloads/015_Gallery_GitHub_Ready_Sprint_01`
- **Git remote (origin):** `https://github.com/moshaath85/015uireadfy.git`
- **Active branch:** `uiux-controlled-99`
- **Note:** A stale duplicate project exists at
  `/Users/apple/Downloads/015_Gallery_UI_Phase1_Patch16_Final`
  (remote `moshaath85/015V3.1.git`, branch `main`, single commit `b802698`,
  2026-07-14). It is an older snapshot and is NOT the active project. It was
  left in place (nothing deleted).

## Database

- **Provider:** PostgreSQL (Prisma)
- **Single shared instance (CMS, public site, local dev, production):**
  `postgresql://***@ep-withered-rice-abahjvr9-pooler.eu-west-2.aws.neon.tech/neondb`
- **Environment selector:** `TEX7_DATABASE_ENV` (`production` / `development` /
  `staging`), enforced by `evaluateTex7DatabaseEnvironmentSafety` which prevents
  local dev from selecting the Production database unless explicitly set.
- **Migrations:** 2 in `prisma/migrations` (both applied).
- **Storage:** Cloudflare R2 (S3-compatible) — `OBJECT_STORAGE_*` env vars;
  media is also committed to `public/images` (323 files) and served statically.

## Deployment

- **Host:** Netlify (single source). Config in `netlify.toml`.
  - Build: `npm run build` (runs `prisma:generate` then `next build`)
  - Publish dir: `.next`
  - Plugin: `@netlify/plugin-nextjs`
  - Node 20 / npm 10
- **Render:** NOT used. No Render configuration or references exist in the repo.

## Environment variables required (Netlify)

Set in Netlify Site → Environment variables (never commit real values):

- `TEX7_DATABASE_ENV`
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

## Quality gates at freeze

- **TypeScript:** PASS (`npx tsc --noEmit`)
- **Tests:** 64/64 PASS (`npx vitest run`)
- **Production build:** PASS (`npm run build:app`)

## Post-freeze content-readiness additions

- **XLSX support added** (Phase 6.1): the bulk importer now accepts modern
  binary `.xlsx` in addition to `.xls` (XML template) and `.csv`.
  - Dependency: `exceljs@^4.4.0` (MIT, Node-compatible, server-only usage).
  - New module: `src/lib/cms/xlsx-parser.ts`.
  - Limits: 8 MB file / 10,000 rows / 200 columns.
- **Master workbook:** `docs/gallery-015-master-template.xlsx` (all entity
  sheets + README sheet).

## Content readiness notes

At freeze, the following institutional contact data is `CONTENT REQUIRED`
(fabricated/placeholder values were removed, not replaced):

- Real phone number (placeholder removed from `/contact` and `/visit`)
- Verified street address
- Real social URLs (placeholder handles removed)

## How to restore this baseline

```bash
git checkout phase6-freeze-e80b5c1
npm ci
npx prisma generate
npm run build
```
