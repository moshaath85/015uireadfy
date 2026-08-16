# Gallery 015 — Canonicalization Audit (Phase 3)

Owner decision: ONE repo / ONE folder / ONE source of truth.

## Canonical local folder

`/Users/apple/Downloads/015_Gallery_GitHub_Ready_Sprint_01` — CANONICAL

## Duplicate project folders

### 1. `/Users/apple/Downloads/015_Gallery_UI_Phase1_Patch16_Final`
- **Classification: ARCHIVE** (stale snapshot, remote `moshaath85/015V3.1.git`,
  single commit `b802698`, last activity 2026-07-18).
- Contains 8 unique files not in canonical:

| File | Value | Disposition |
|---|---|---|
| `src/app/error.tsx` | Error boundary (worth having) | ARCHIVE — not merged (freeze: no UI feature changes) |
| `src/app/global-error.tsx` | Global error boundary | ARCHIVE — not merged (freeze) |
| `src/app/participations/page.tsx` | No DB model in canonical | ARCHIVE — stale (no data backend) |
| `src/app/private-works/page.tsx` | No DB model in canonical | ARCHIVE — stale |
| `src/app/services/[slug]/page.tsx` | No per-service detail in canonical schema | ARCHIVE — stale |
| `src/components/admin/ConfirmActionButton.tsx` | Not used in canonical | ARCHIVE — orphaned |
| `src/components/public/ArtistCard.tsx` | Removed from canonical (unused) | ARCHIVE |
| `src/components/public/ArtworkCard.tsx` | Removed from canonical (unused) | ARCHIVE |

- **NOT deleted.** Preserved for reference. All 8 are recoverable from this
  folder or the `015V3.1` git history.

### 2. Other folders (`*Gallery 015_files`, asset packs, HTML snapshots)
- **Classification: ARCHIVE** — reference/media packs, not code projects.
- No `package.json`+`src`+`prisma`; not Gallery 015 application projects.

## Deletion rule (per owner)

Duplicate folders are NOT deleted until:
- canonical GitHub push to `015uireadfy` is confirmed
- remote HEAD matches local HEAD
- production build passes
- recovery tag `gallery015-pre-canonicalization` exists

None of the deletion preconditions are met yet (push is network-blocked from
this environment), so **nothing has been deleted.**

## Phase 4 — One database
- Single Neon PostgreSQL: `ep-withered-rice-abahjvr9-pooler.eu-west-2.aws.neon.tech/neondb`
- One Prisma schema (`prisma/schema.prisma`), one migration chain (2 migrations).
- All active repositories use Prisma/PostgreSQL (`production-prisma` or
  `artists-prisma-adapter`). The JSON adapters (`*-json-adapter.ts`,
  `data/loaders.ts`) are legacy and not imported by any active route.
- No JSON production fallback in the production data path.

## Phase 5 — One CMS
- Single admin app: `src/app/admin` + `src/components/admin` (one `AdminShell`).
- Covers all managed entities: artists, artworks, exhibitions, collections,
  projects, publications, news, services, media, certificates, settings.
- No duplicate admin app / no second CMS folder / no alternate CMS runtime.

## Phase 6 — One media system
- Existing seeded content: committed static assets in `public/images` (323 files),
  served at relative `/images/*` paths (media records store `storage_path`).
- Future CMS uploads: Cloudflare R2 via the single `S3StorageProvider`
  (`media-upload-service.ts`), configured through `OBJECT_STORAGE_*` env vars.
- One coordinated strategy: static for seeded content, R2 for uploads.
- One storage provider; no second storage system.

## Phase 7 — One Netlify site
- **NETLIFY SITE CREATION REQUIRED.** No Netlify site association is
  discoverable: no `.netlify/state.json`, no site ID in the repo, no Netlify
  CLI, and no live URL resolves (gallery015.com → 000, *.netlify.app → 404).
- `netlify.toml` is present and correct (build `npm run build`, publish `.next`,
  plugin, Node 20). The site *binding* is not present in the repo.
- Not created (no authenticated Netlify access; creation not explicitly approved).
- When created: bind `moshaath85/015uireadfy` → `main` → canonical project root.
- Render is NOT used and must not be configured.

## Phase 8 — Clean references
- See below (in progress).
