# Gallery 015 — CMS Persistence & Editability Audit v1.0

## 1. File created

`docs/GALLERY015_CMS_PERSISTENCE_EDITABILITY_AUDIT_v1.0.md`

Scope: Sprint CMS-A1 audit only. No source, package, runtime, Prisma, repository, route, authentication, localization, public website, or dependency changes are included in this sprint.

## 2. Module-by-module persistence table

| Module | Create | Persist | Edit | Update | Delete | Archive | Storage type | Exact blocker | Recommended next patch |
|---|---:|---:|---:|---:|---:|---:|---|---|---|
| Artists | Yes | Development-only JSON only | Yes | Development-only JSON only | No | Status field only; no archive action | JSON-backed, development-only | `src/lib/cms/artists/artists-actions.ts` blocks server actions outside `NODE_ENV=development`; `src/lib/cms/artists/artists-json-adapter.ts` writes local `data/artists.json`; no production persistence or delete/archive actions exist. Existing edit reliability is limited by development-only file writes and local runtime state. | First patch: make Artist create/update reliable in the approved environment by wiring the existing actions to an approved persistent repository path or explicitly approved JSON write mode, then revalidate admin/public routes. |
| Artworks | Yes | Development-only JSON only | Yes | Development-only JSON only | No | Status field only; no archive action | JSON-backed, development-only | `src/app/admin/artworks/new/page.tsx` and edit page call `prepareCreateArtworkAction` / `prepareUpdateArtworkAction` with `mutationEnabled: true`, but `src/lib/cms/artworks/artworks-json-adapter.ts` uses guarded local JSON writes and `development_write_disabled`; no production persistence, delete, or archive action exists. | After Artists: standardize Artwork create/update persistence through the approved repository path, preserving relationship checks for artist, collection, and media references. |
| Collections | Yes | Development-only JSON only | Yes | Development-only JSON only | No | Status field only; no archive action | JSON-backed, development-only | `src/lib/cms/collections/collections-actions.ts` can call the JSON adapter only when mutation is enabled; `src/lib/cms/collections/collections-json-adapter.ts` writes local `data/collections.json` behind development-only guards; no production persistence, delete, or archive action exists. | Add reliable create/update persistence for Collections using the same pattern approved for Artists. |
| Exhibitions | Yes | Development-only JSON only | Yes | Development-only JSON only | No | Not implemented as an action | JSON-backed, development-only | `src/lib/cms/exhibitions/exhibitions-actions.ts` supports create/update preparation and development JSON writing; `src/lib/cms/exhibitions/exhibitions-json-adapter.ts` writes only through guarded local JSON with `development_write_disabled`; no production persistence, delete, or archive action exists. | Add approved create/update persistence for Exhibitions after core Artist/Artwork/Collection paths are reliable. |
| Projects | Yes | Development-only JSON only | Yes | Development-only JSON only | No | Status field only; no archive action | JSON-backed, development-only | `src/lib/cms/projects/projects-actions.ts` and `src/lib/cms/projects/projects-json-adapter.ts` implement guarded development-only JSON create/update; no production persistence, delete, or archive action exists. | Add approved create/update persistence for Projects after Exhibition pattern is stable. |
| Services | Yes | Development-only JSON only | Yes | Development-only JSON only | No | Status field only; no archive action | JSON-backed, development-only | `src/lib/cms/services/services-actions.ts` and `src/lib/cms/services/services-json-adapter.ts` implement guarded development-only JSON create/update; no production persistence, delete, or archive action exists. | Add approved create/update persistence for Services after higher-traffic content modules. |
| News | Yes | Development-only JSON only | Yes | Development-only JSON only | No | Status field only; no archive action | JSON-backed, development-only | `src/lib/cms/news/news-actions.ts` and `src/lib/cms/news/news-json-adapter.ts` implement guarded development-only JSON create/update; no production persistence, delete, or archive action exists. | Add approved create/update persistence for News after shared create/update action contract is finalized. |
| Publications | Yes | Development-only JSON only | Yes | Development-only JSON only | No | Status field only; no archive action | JSON-backed, development-only | `src/lib/cms/publications/publications-actions.ts` and `src/lib/cms/publications/publications-json-adapter.ts` implement guarded development-only JSON create/update; no production persistence, delete, or archive action exists. | Add approved create/update persistence for Publications after News/Services pattern is finalized. |
| Certificates | Yes, screen exists | No | Yes, screen exists | No | No | Status field only; no archive action | Read-only / preparation-only | `src/lib/cms/certificates/certificates-actions.ts` validates form data and always returns `prepared` with `shouldWriteJson: false`; it has no JSON adapter call and no repository create/update method. `src/lib/repositories/certificates.ts` exposes read/lookup methods only. Certificate creation cannot persist now. | First five-file-safe persistence patch should target Certificates: add guarded create/update persistence path, wire create/edit actions to it, and preserve verification lookup compatibility. |
| Media | No usable create route in admin; media library screen exists | No real upload or create from screen | No full edit route | No real update from screen | No | Prepared only; no active archive action | JSON-backed action scaffolding, UI read/preparation-only | `src/app/admin/media/page.tsx` is a search/filter/preview/reuse screen. `src/lib/cms/media/media-actions.ts` and `src/lib/cms/media/media-json-adapter.ts` contain guarded development JSON create/update functions, but admin UI does not provide a real create/edit/upload route and page text states production writes remain disabled. Delete operations are blocked by JSON write guards. | Defer until content persistence is fixed; then implement media upload/replace/archive as a dedicated storage-backed patch. |
| General Settings | No | No | No | No | No | No | Read-only JSON import | `src/app/admin/settings/page.tsx` renders rows from `settingsRepository.getSiteSettings()`. `src/lib/repositories/settings.ts` only exposes `getSiteSettings`. `src/lib/data/loaders.ts` imports `data/settings.json`. There is no edit route, form action, save action, JSON adapter, or repository update method. | Add a Settings edit patch after Certificate/Artist reliability: create edit form, validation, guarded save action, and approved persistence path for settings fields. |

## 3. Certificate save root cause

Certificate creation can actually be created and persisted now: **NO**.

Root cause:

- The create screen exists at `src/app/admin/certificates/new/page.tsx`.
- The create screen calls `prepareCreateCertificateAction`.
- `prepareCreateCertificateAction` in `src/lib/cms/certificates/certificates-actions.ts` validates fields but always returns a prepared result.
- The prepared result has `shouldWriteJson: false`.
- There is no certificate JSON adapter called by the action.
- `src/lib/repositories/certificates.ts` has read and lookup methods only: `getAll`, `getByNumber`, `getByVerificationUrl`, and `findByVerificationValue`.
- No repository `create`, `update`, `save`, `delete`, or `archive` method exists for Certificates.
- Hidden generated fields are not the root persistence blocker; they can satisfy validation if generated correctly, but validation success still produces only a prepared non-writing result.
- The current blocker is disabled/preparation-only write behavior plus missing certificate persistence method/adapter wiring.

## 4. General Settings editability status

General Settings is read-only.

Observed status:

- Settings are loaded from `data/settings.json`.
- Loading path: `src/lib/data/loaders.ts` imports settings JSON and exposes `getSettings()`.
- Repository path: `src/lib/repositories/settings.ts` exposes only `settingsRepository.getSiteSettings`.
- Admin screen: `src/app/admin/settings/page.tsx` displays settings in a table.
- Supporting display components: `src/components/admin/SettingsPanel.tsx` and `src/components/admin/SettingsField.tsx` are read-only display components.
- No edit route exists.
- No settings form action exists.
- No settings save action exists.
- No settings JSON adapter exists.
- No settings repository update method exists.

Field editability:

| Setting area | Current edit support |
|---|---|
| Logo | Not editable in General Settings audit path |
| Contact email | Read-only |
| Contact phone | Read-only |
| WhatsApp number | No clear editable setting found in General Settings screen |
| Address/contact details | Read-only |
| Social links | Read-only for Instagram, Twitter, and Facebook values shown |
| SEO defaults | No clear editable settings UI/action found |
| Public visibility settings | No clear editable settings UI/action found |

## 5. Modules with real Create

In production/reliable CMS terms: **none confirmed**.

Development-only JSON create exists for:

- Artists
- Artworks
- Collections
- Exhibitions
- Projects
- Services
- News
- Publications

Preparation-only create exists for:

- Certificates

No usable admin create screen was confirmed for:

- Media
- General Settings

## 6. Modules with real Edit

In production/reliable CMS terms: **none confirmed**.

Development-only JSON edit/update exists for:

- Artists
- Artworks
- Collections
- Exhibitions
- Projects
- Services
- News
- Publications

Preparation-only edit/update exists for:

- Certificates

Read-only/no edit exists for:

- Media admin library screen
- General Settings

## 7. Modules that are read-only or placeholder

Read-only / presentation-only / preparation-only modules:

- Certificates: create/edit screens validate only and do not write.
- Media: library UI exposes prepared actions language, but no real upload/create/edit/delete/archive persistence from the admin screen.
- General Settings: read-only table/display from `data/settings.json`; no edit/save path.

Development-only modules, not production-reliable persistence:

- Artists
- Artworks
- Collections
- Exhibitions
- Projects
- Services
- News
- Publications

## 8. Recommended implementation order

1. Certificates: fix the confirmed production issue first because Certificate create currently cannot persist at all.
2. Artists: fix unreliable existing edit and create persistence because Artists are core CMS records and affect Artworks.
3. Artworks: fix after Artists so relationship validation can rely on stable Artist records.
4. Collections: fix before broader content grouping and Artwork collection relationships.
5. General Settings: add edit/save path for operational site configuration.
6. Media: implement real upload/replace/archive with a storage-backed design, not local JSON-only assumptions.
7. Exhibitions and Projects: migrate create/update persistence after core content relationships are stable.
8. News, Services, and Publications: apply the standardized persistence pattern after the core/action contract is settled.
9. Delete/archive actions: implement after create/update is reliable, using archive/soft-delete first rather than hard delete.

## 9. First recommended five-file-safe patch

Recommended first patch: **Certificate Create Persistence Patch**.

Goal: make Certificate creation persist a real record and appear after refresh/new request without changing Prisma, migrations, dependencies, public website design, authentication, or localization.

Candidate five-file-safe scope:

1. `src/lib/cms/certificates/certificates-actions.ts`
   - Change successful create/update from preparation-only to call a guarded approved persistence function.
2. `src/lib/cms/certificates/certificates-json-adapter.ts`
   - Add a certificate JSON create/update adapter if JSON persistence is approved for this interim stage.
3. `src/lib/repositories/certificates.ts`
   - Add minimal create/update or internal persistence access only if repository ownership is approved for writes.
4. `src/app/admin/certificates/new/page.tsx`
   - Keep the simplified form but report actual save success/failure and revalidate admin/verification paths.
5. `src/app/admin/certificates/[id]/edit/page.tsx`
   - Wire update to the same persistence result semantics.

Important: if production persistence must not be local JSON, replace files 2–3 with the approved persistent repository/provider path instead. The audit confirms the missing piece is not the visible form; it is the absent write path.

## 10. Confirmation that no source code was modified

This sprint is documentation-only.

No source code, package file, runtime file, Prisma file, repository file, route file, authentication file, localization file, public website file, or dependency was intentionally modified for Sprint CMS-A1.

Validation command to confirm after this document is created:

```bash
git diff --name-only
```

Expected result for this sprint:

```text
docs/GALLERY015_CMS_PERSISTENCE_EDITABILITY_AUDIT_v1.0.md
```