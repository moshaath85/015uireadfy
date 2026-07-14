# Gallery 015 — Enterprise Architecture Audit v0.8

Sprint: 63  
Scope: Enterprise architecture audit only  
Date: 2026-07-09  
Change policy: Documentation only; no source code, public UI, admin UI, database, authentication, dependency, or feature changes.

## Executive Summary

Gallery 015 remains architecturally coherent as a Next.js App Router application backed by JSON files, typed repository access, admin/public route separation, CMS module contracts, and guarded development-only JSON mutation paths.

The production build passes, standalone TypeScript validation passes, and all JSON files parse successfully. The project is deployment-ready for the current JSON-backed foundation phase.

The audit found no critical build blocker and no critical frozen-layer violation. However, it found high-priority issues that should be resolved before approving a database foundation sprint:

1. Two artist profile image references point to missing media records.
2. Admin routes are still protected only by foundation guard contracts, not by enforced runtime authentication.
3. Runtime module shape is inconsistent across later modules: Services, News, and Publications have action/validation/adapter files but no module-level runtime file; Media is implemented as a monolithic runtime file rather than the split action/validation/adapter pattern.
4. Admin Media and Settings pages directly import data loaders instead of using repository/module abstractions.
5. Type definitions still contain one unsafe `any` and multiple type assertions that can hide JSON/type drift.

## Overall Verdict

PASS WITH CONDITIONS

The current project passes build and static validation for the JSON-backed foundation. It should not be treated as database-ready until the high-priority data-integrity, auth-boundary, and runtime-consistency findings are addressed.

## Validation Commands and Results

| Check | Command / Method | Result |
|---|---|---|
| Production build | `npm run build` | Passed |
| TypeScript validation | `node_modules/.bin/tsc --noEmit` | Passed |
| JSON validation | Parsed all JSON files under `data/` plus `package.json` | Passed |
| Import validation | Static import scan plus build/type validation | Passed with custom-scan notes |
| Circular import scan | Static dependency traversal over 222 TS/TSX files | No circular imports found |
| Direct loader boundary scan | Static import scan | 2 admin-page boundary findings |
| Lint | Skipped because no non-interactive ESLint configuration exists | Skipped per sprint rule |

Important import-scan note: the custom scan reported JSON imports inside `src/lib/data/loaders.ts` as missing because the scan only resolved TS/TSX source files. Next.js and TypeScript both resolved these JSON imports successfully through `resolveJsonModule`, so they are not broken imports.

## Architecture Findings

### Strengths

- `src/app` cleanly separates public routes and admin routes.
- `src/components/public`, `src/components/admin`, and `src/components/layout` preserve UI component separation.
- `src/lib/repositories` remains the approved abstraction for public/domain reads.
- `src/lib/cms` contains module-specific action, validation, configuration, and JSON adapter layers for major CMS entities.
- `src/lib/database/json-write-guards.ts` blocks unsafe production JSON writes.
- `src/lib/database/json-writer.ts` centralizes guard execution before module-specific file mutation proceeds.
- Frozen JSON-backed architecture is still intact; no database or alternate persistence layer was introduced.
- Public content loader filtering continues to expose only `visibility_status === "public"` for public content collections.

### Frozen Layers That Must Not Be Changed

These layers should remain frozen until an approved database/authentication foundation sprint begins:

- Public route structure under `src/app/*` outside `src/app/admin`.
- Admin route structure under `src/app/admin/*`.
- Public UI components under `src/components/public`.
- Admin UI components under `src/components/admin`.
- JSON data files under `data/`.
- Repository read abstraction under `src/lib/repositories`.
- Loader read boundary under `src/lib/data/loaders.ts`.
- Guarded development-only write boundary under `src/lib/database/json-write-guards.ts` and `src/lib/database/json-writer.ts`.
- CMS module naming convention under `src/lib/cms/<module>/<module>-*.ts`.
- App Router, TypeScript, React, JSON data, repository/loader stack.

## Findings Grouped by Severity

## Critical Findings

None.

No critical build blocker, broken production build, fatal import cycle, invalid JSON syntax, or confirmed production-write exposure was found.

## High Findings

### HIGH-001 — Broken artist profile media references

Category: Data integrity  
Affected files:

- `data/artists.json`
- `data/media.json`

Finding:

- Artist `art-001` references `profile_image_id: media-006`, but `media-006` does not exist in `data/media.json`.
- Artist `art-002` references `profile_image_id: media-007`, but `media-007` does not exist in `data/media.json`.

Risk:

- Database migration would create invalid foreign-key-style references.
- Public artist detail rendering may lose profile media when relation hydration is expanded.
- Future media enforcement could fail during import or seed validation.

Recommended remediation:

1. Add the missing media records if the references are valid.
2. Or update the artist profile image references to existing media IDs.
3. Add a repeatable relationship validation script before database migration.

Blocks Database Foundation: Yes.

### HIGH-002 — Admin authentication contracts exist but are not enforced at route runtime

Category: Security / authentication readiness  
Affected files:

- `src/lib/auth/auth-guards.ts`
- `src/lib/auth/auth-session.ts`
- `src/app/admin/page.tsx`
- `src/app/admin/artists/page.tsx`
- `src/app/admin/artists/new/page.tsx`
- `src/app/admin/artists/[id]/edit/page.tsx`
- `src/app/admin/artworks/page.tsx`
- `src/app/admin/artworks/new/page.tsx`
- `src/app/admin/artworks/[id]/edit/page.tsx`
- `src/app/admin/collections/page.tsx`
- `src/app/admin/collections/new/page.tsx`
- `src/app/admin/collections/[id]/edit/page.tsx`
- `src/app/admin/exhibitions/page.tsx`
- `src/app/admin/exhibitions/new/page.tsx`
- `src/app/admin/exhibitions/[id]/edit/page.tsx`
- `src/app/admin/projects/page.tsx`
- `src/app/admin/projects/new/page.tsx`
- `src/app/admin/projects/[id]/edit/page.tsx`
- `src/app/admin/services/page.tsx`
- `src/app/admin/services/new/page.tsx`
- `src/app/admin/services/[id]/edit/page.tsx`
- `src/app/admin/news/page.tsx`
- `src/app/admin/news/new/page.tsx`
- `src/app/admin/news/[id]/edit/page.tsx`
- `src/app/admin/publications/page.tsx`
- `src/app/admin/publications/new/page.tsx`
- `src/app/admin/publications/[id]/edit/page.tsx`
- `src/app/admin/media/page.tsx`
- `src/app/admin/settings/page.tsx`

Finding:

Authentication guard functions exist as foundation contracts, but the admin routes are not currently protected by real session enforcement. This is accepted for the current JSON foundation phase but is not authentication-ready.

Risk:

- Admin screens are accessible as normal routes.
- Future write-enabled admin routes must not proceed to production without enforced authorization.
- Database-backed mutations would require real authenticated user and role checks.

Recommended remediation:

1. Define the approved authentication implementation sprint separately.
2. Apply route-level server guard enforcement before database-backed writes.
3. Require role checks for all create/edit/admin-only routes.
4. Preserve current admin UI layout while adding guard enforcement.

Blocks Database Foundation: Conditional Yes. Database schema design can begin, but database-backed admin mutation must not be enabled before auth enforcement is implemented.

### HIGH-003 — Runtime module shape is inconsistent across CMS modules

Category: Runtime consistency  
Affected files:

- `src/lib/cms/artists/artists-runtime.ts`
- `src/lib/cms/artworks/artworks-runtime.ts`
- `src/lib/cms/collections/collections-runtime.ts`
- `src/lib/cms/exhibitions/exhibitions-runtime.ts`
- `src/lib/cms/projects/projects-runtime.ts`
- `src/lib/cms/services/services-actions.ts`
- `src/lib/cms/services/services-validation.ts`
- `src/lib/cms/services/services-json-adapter.ts`
- `src/lib/cms/news/news-actions.ts`
- `src/lib/cms/news/news-validation.ts`
- `src/lib/cms/news/news-json-adapter.ts`
- `src/lib/cms/publications/publications-actions.ts`
- `src/lib/cms/publications/publications-validation.ts`
- `src/lib/cms/publications/publications-json-adapter.ts`
- `src/lib/cms/media/media-runtime.ts`

Finding:

The module matrix is not fully consistent:

- Artists, Artworks, Collections, Exhibitions, and Projects have module-level runtime files.
- Services, News, and Publications have action/validation/JSON adapter files but no `<module>-runtime.ts` file.
- Media has `media-runtime.ts`, but does not follow the split `media-actions.ts`, `media-validation.ts`, `media-json-adapter.ts`, `media-crud-config.ts`, `media-form-config.ts`, `media-table-config.ts`, and `index.ts` structure used by other modules.

Risk:

- Database foundation mapping becomes harder because module boundaries are not uniform.
- Future code generation or migration scripts cannot rely on one module contract shape.
- Media write/read behavior is harder to isolate, audit, and test.

Recommended remediation:

1. Normalize Services, News, and Publications with runtime aggregator files if runtime files are now part of the frozen module contract.
2. Split Media into the same action/validation/adapter/config/index shape as other CMS modules, or document Media as an intentional exception.
3. Do this in a controlled patch with no public/admin redesign.

Blocks Database Foundation: Yes, unless explicitly accepted as an intentional transitional exception.

## Medium Findings

### MEDIUM-001 — Admin Media and Settings bypass repository abstraction

Category: Architecture / layer boundaries  
Affected files:

- `src/app/admin/media/page.tsx`
- `src/app/admin/settings/page.tsx`
- `src/lib/data/loaders.ts`

Finding:

Most admin entity pages use repository abstractions. Admin Media and Settings directly import from `@/lib/data/loaders`.

Risk:

- Boundary consistency is weakened.
- Database migration would require special handling for these admin pages.
- Loader access outside repository/module layers increases coupling to JSON implementation.

Recommended remediation:

1. Add repository/module abstractions for settings and admin media reads.
2. Refactor the two admin pages to consume those abstractions.
3. Keep UI unchanged.

Blocks Database Foundation: No, but should be completed before migration implementation.

### MEDIUM-002 — Type assertions can hide JSON/type drift

Category: Type safety  
Affected files include:

- `src/lib/data/loaders.ts`
- `src/app/admin/artists/[id]/edit/page.tsx`
- `src/app/admin/artworks/[id]/edit/page.tsx`
- `src/app/admin/collections/[id]/edit/page.tsx`
- `src/app/admin/exhibitions/[id]/edit/page.tsx`
- `src/app/admin/news/[id]/edit/page.tsx`
- `src/app/admin/projects/[id]/edit/page.tsx`
- `src/app/admin/services/[id]/edit/page.tsx`
- `src/lib/cms/artists/artists-json-adapter.ts`
- `src/lib/cms/artworks/artworks-json-adapter.ts`
- `src/lib/cms/collections/collections-json-adapter.ts`
- `src/lib/cms/exhibitions/exhibitions-json-adapter.ts`
- `src/lib/cms/news/news-json-adapter.ts`
- `src/lib/cms/projects/projects-json-adapter.ts`
- `src/lib/cms/publications/publications-json-adapter.ts`
- `src/lib/cms/services/services-json-adapter.ts`

Finding:

The scan found 38 files with type assertions. Some are harmless narrowing, but loader-level JSON casts and adapter-level parsed JSON casts can hide schema drift.

Risk:

- JSON data can drift from TypeScript contracts while still compiling.
- Database migration may import records that do not match expected shapes.
- Runtime validation coverage may differ by module.

Recommended remediation:

1. Add centralized parse/validate functions per JSON entity.
2. Replace broad data casts with validated typed records.
3. Keep existing public/admin rendering unchanged.

Blocks Database Foundation: No, but should be part of pre-migration hardening.

### MEDIUM-003 — One unsafe `any` remains in public type contract

Category: Type safety  
Affected files:

- `src/types/index.ts`

Finding:

`Service.price_info?: Record<string, any>` uses `any`.

Risk:

- Service price structure can drift without compile-time safety.
- Database schema design cannot infer stable fields from this contract.

Recommended remediation:

1. Replace `Record<string, any>` with `Record<string, unknown>` or a specific `ServicePriceInfo` interface.
2. Validate any existing JSON service price data against the chosen contract.

Blocks Database Foundation: No, but should be fixed before schema finalization for Services.

### MEDIUM-004 — JSON write adapters use direct file-system mutation

Category: Security / runtime implementation  
Affected files:

- `src/lib/cms/artists/artists-json-adapter.ts`
- `src/lib/cms/artworks/artworks-json-adapter.ts`
- `src/lib/cms/collections/collections-json-adapter.ts`
- `src/lib/cms/exhibitions/exhibitions-json-adapter.ts`
- `src/lib/cms/projects/projects-json-adapter.ts`
- `src/lib/cms/services/services-json-adapter.ts`
- `src/lib/cms/news/news-json-adapter.ts`
- `src/lib/cms/publications/publications-json-adapter.ts`
- `src/lib/cms/media/media-runtime.ts`
- `src/lib/database/json-write-guards.ts`
- `src/lib/database/json-writer.ts`

Finding:

Entity adapters use `path.join`, `readFileSync`, and `writeFileSync`. This is currently guarded by safe target checks and development-only write guards.

Risk:

- File-based writes can race in development.
- Production file mutation must remain blocked.
- Path construction must remain constrained to approved JSON targets.

Recommended remediation:

1. Keep all file mutation behind `jsonWriter` and `guardJsonWrite`.
2. Do not expand write paths beyond approved `data/<entity>.json` files.
3. Replace file write adapters with database repositories in a future database sprint.

Blocks Database Foundation: No. This is expected technical debt for the JSON foundation phase.

### MEDIUM-005 — Public media loader exposes all media records

Category: Security / content visibility  
Affected files:

- `src/lib/data/loaders.ts`
- `src/lib/repositories/media.ts`
- `data/media.json`

Finding:

`getMedia()` returns all media records without visibility filtering. This may be intentional because media records do not currently expose a `visibility_status` field, but it should be formalized before private/VIP media is introduced.

Risk:

- Future private media records could become visible through admin or repository consumers if field-level restrictions are not added.
- Media related to VIP/private content needs a clear visibility policy.

Recommended remediation:

1. Decide whether media inherits visibility from owning content or receives its own status field.
2. Document the media visibility policy.
3. Enforce that policy before private or VIP media upload workflows are introduced.

Blocks Database Foundation: No, but should be resolved before private/VIP content expansion.

## Low Findings

### LOW-001 — Both npm and pnpm lockfiles are present

Category: Dependencies  
Affected files:

- `package-lock.json`
- `pnpm-lock.yaml`

Finding:

Both lockfiles exist. This does not break the build, but it can create package-manager ambiguity.

Risk:

- Different environments may install subtly different dependency trees.
- CI/CD needs an explicit package-manager decision.

Recommended remediation:

1. Choose the official package manager for the repository.
2. Keep the other lockfile only if intentionally required by platform tooling.

Blocks Database Foundation: No.

### LOW-002 — No non-interactive ESLint configuration exists

Category: Build and quality  
Affected files:

- `package.json`

Finding:

`npm run lint` maps to `next lint`, but no non-interactive ESLint config exists. Lint was skipped per Sprint 63 instruction.

Risk:

- Lint cannot be used as an automated gate without configuration.
- Future quality checks rely on build and TypeScript only.

Recommended remediation:

1. Add lint configuration in a future dedicated quality sprint.
2. Do not create ESLint configuration inside audit-only sprints.

Blocks Database Foundation: No.

## Intentional / Accepted for Current Phase

### ACCEPTED-001 — JSON data remains the active source of truth

Affected files:

- `data/*.json`
- `src/lib/data/loaders.ts`
- `src/lib/repositories/*`

Accepted rationale:

The project is intentionally in a JSON-backed foundation phase. No database implementation was requested or introduced.

### ACCEPTED-002 — Development-only JSON mutation proof is not production CMS persistence

Affected files:

- `src/lib/database/json-write-guards.ts`
- `src/lib/database/json-writer.ts`
- `src/lib/cms/*/*-json-adapter.ts`
- `src/lib/cms/media/media-runtime.ts`

Accepted rationale:

Writes are blocked outside development and disabled unless explicitly enabled through guarded action contexts.

### ACCEPTED-003 — Authentication remains a foundation contract

Affected files:

- `src/lib/auth/*`

Accepted rationale:

Authentication implementation was explicitly excluded from this sprint and prior foundation work.

## Runtime Consistency Matrix

| Module | Runtime file | Actions | Validation | JSON adapter | Config exports | Admin list | Create route | Edit route | Status |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Artists | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Consistent |
| Artworks | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Consistent |
| Collections | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Consistent |
| Exhibitions | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Consistent |
| Projects | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Consistent |
| Services | No | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Inconsistent runtime aggregator |
| News | No | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Inconsistent runtime aggregator |
| Publications | No | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Inconsistent runtime aggregator |
| Media | Yes | Inside runtime | Inside runtime | Inside runtime | No | Yes | No | No | Intentional or incomplete exception |

## Imports and Dependencies Verdict

PASS WITH CONDITIONS

- Build and TypeScript validation passed.
- No circular imports were found.
- No confirmed broken TS/TSX imports were found.
- Custom scan JSON import warnings in `src/lib/data/loaders.ts` are false positives because JSON module resolution is enabled and build/typecheck passed.
- Two boundary concerns remain: direct loader use in Admin Media and Admin Settings.

## Naming and Structure Verdict

PASS WITH CONDITIONS

- Most CMS modules follow the `<module>-actions.ts`, `<module>-validation.ts`, `<module>-json-adapter.ts`, config, and index naming pattern.
- Runtime naming is inconsistent for Services, News, Publications, and Media.
- Route naming is consistent with Next.js App Router conventions.
- No duplicate contract file names were found.

## Type Safety Verdict

PASS WITH CONDITIONS

- Strict TypeScript is enabled.
- TypeScript validation passes.
- Remaining risk is primarily from JSON casts, type assertions, and one `any` usage.
- JSON data vs TypeScript drift should be validated before migration.

## Data Integrity Verdict

PASS WITH CONDITIONS

- JSON syntax is valid.
- Duplicate IDs were not found by the audit scan.
- Slug format validation found no invalid slugs in the scanned entities.
- Exhibition date range validation found no invalid ranges.
- Broken relation findings exist for artist profile image IDs `media-006` and `media-007`.

## Security Verdict

PASS WITH CONDITIONS

- Production JSON write protection is present and effective by design.
- Development-only write guard requires safe target, development environment, explicit enablement, and non-delete operations.
- Authentication is not runtime-enforced on admin routes.
- Media visibility policy is not fully defined for future private/VIP media expansion.
- No unsafe source-code fix was required during this audit.

## Performance Verdict

PASS WITH CONDITIONS

- Static generation remains suitable for the current JSON-backed project scale.
- Repository/loader reads perform repeated full JSON scans and in-memory filtering.
- This is accepted for the current small static dataset.
- Database migration should introduce indexed queries and relation loading plans.
- No performance issue blocks current deployment.

## Database-Readiness Verdict

NO-GO FOR DATABASE FOUNDATION

Reason:

The project is close to database-foundation readiness, but the following must be resolved or explicitly accepted first:

1. Broken artist profile media references.
2. Inconsistent module runtime shape for Services, News, Publications, and Media.
3. Auth boundary plan for admin write routes.
4. Typed data validation plan to prevent JSON/type drift during migration.

## Authentication-Readiness Verdict

NO-GO FOR AUTHENTICATED ADMIN PRODUCTION

Reason:

Auth guard contracts exist, but real session enforcement is not wired into admin routes. Authentication implementation was intentionally excluded from this sprint.

## Deployment-Readiness Verdict

GO FOR CURRENT JSON-BACKED FOUNDATION DEPLOYMENT

Reason:

- Production build passes.
- TypeScript validation passes.
- JSON syntax validation passes.
- Current frozen architecture is intact.
- No critical defect was found for current static/JSON-backed operation.

Deployment condition:

Do not market the admin area as production-secured CMS administration until authentication and authorization are implemented.

## Go / No-Go Decision for Database Foundation

NO-GO

Database Foundation should wait until the high findings are addressed or formally accepted with a migration-risk waiver.

Minimum remediation order before Database Foundation:

1. Fix broken artist profile media references.
2. Normalize or explicitly freeze module runtime contracts for Services, News, Publications, and Media.
3. Define database mapping for media visibility and private/VIP content exposure.
4. Define authentication/authorization enforcement plan for admin writes.
5. Add repeatable data-integrity validation for JSON-to-database migration.
6. Harden loader JSON casts with schema validation or migration-specific validators.