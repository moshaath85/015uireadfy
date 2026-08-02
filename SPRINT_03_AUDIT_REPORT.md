# 015 Gallery Sprint 03 Audit Report

## Audit scope

This report is the Phase 1, audit-only deliverable for **015 Gallery — Experience Refinement**. It reviews the current Artists implementation, reusable public components, App Router structure, CMS architecture, entity relationships, and media system. No application code, Prisma schema, migration, database model, or API contract was changed.

Audit date: 18 July 2026  
Requested baseline: `015_Gallery_UI_Phase1_Patch16_Final`  
Repository commit inspected: `aece409` (`feat: migrate legacy content to PostgreSQL`)  
Requested branch: `main`  
Checked-out branch: `sprint-02b-media-upload-ui`

The checked-out branch, local `main`, and `origin/main` currently point to the same commit. The working tree also contains pre-existing, uncommitted CMS/media edits. Those edits were treated as user-owned and were not modified by this audit.

## Executive assessment

The project has a sound institutional content model and a usable server-rendered public foundation. Its strongest current idea is the shared `EditorialExperience` layer: it already establishes large typography, generous spacing, image-led layouts, metadata, related content, and inquiry endings across the five priority entity types.

However, the repository does **not** currently contain the Artists interaction described as the approved reference. The checked-in `/artists` experience is a two-column linked card grid; it has no closed initial state, single-open accordion state, or expansion behavior. Only two commits are available in the repository history, and neither exposes a prior accordion implementation. Sprint 03 must therefore not infer or replace the approved design from memory. The approved Artists HTML artifact, commit, or visual reference must be located before implementation begins.

The principal technical gap is not the database schema. The schema already expresses most required relationships. The gap is the public read layer: repositories expose flattened entity lists and primary/cover media, but do not expose the exhibition/project junctions, project media, artwork media galleries, or richer cross-entity queries needed by the requested pages.

## 1. Current Artists UI implementation

### Current state

- `/artists` is a dynamic server component in `src/app/artists/page.tsx`.
- It reads public artists from PostgreSQL through `artistsRepository.getPublicAll()`.
- Each artist resolves one profile image through `mediaRepository.getArtistProfileMedia()`.
- The page maps data into `EditorialIndex`, using representation status, nationality, birth year, biography, and profile image.
- `EditorialIndex` renders a two-column grid of full-card links. Cards are always visually open and include image, metadata, biography, and a “View” link.
- `/artists/[slug]` uses the shared `EditorialDetail` template. It presents a profile image, bilingual name, facts, biography, selected works, and an inquiry CTA.
- Selected works are obtained by loading all public artworks and filtering in application memory by `artist_id`, capped at six.

### Baseline discrepancy — implementation blocker

The requested approved behavior is:

- all artists closed initially;
- one artist open at a time;
- large image focus;
- smooth expansion;
- editorial feeling.

The inspected implementation has no interactive client component, disclosure control, expanded-state model, animation lifecycle, or accordion accessibility semantics. Because the approved Artists HTML is identified as the official reference but is not present in the repository history or current files, implementation should pause at the start of Phase 2 until that reference is recovered and confirmed.

### Existing strengths

- Data access remains server-side and respects public visibility.
- Artist order is stable (`displayOrder`, then `updatedAt`) in the Prisma adapter.
- Profile media and artwork media are resolved through a repository rather than embedded page-specific storage logic.
- Empty public states are handled.
- The detail view already supplies the core institutional hierarchy: entity label, primary identity, media, facts, story, related works, and inquiry.
- Responsive CSS and reduced-motion handling are already present globally.

### Risks

- Recreating the accordion without the approved reference would risk redesigning the identity.
- Biography text is placed directly on every index card, which can produce irregular rhythm and overlong list pages.
- Artist work relationships are resolved with a full artwork fetch and in-memory filter, which will not scale well.
- Instagram is rendered as plain text, not a validated external link.
- Images use raw `<img>` elements, so sizing, responsive source selection, and loading behavior are manually controlled and inconsistent.
- There is no explicit accessible control model for the required expand/collapse behavior yet.

## 2. Existing public experience components

### Shared components

`src/components/public/EditorialExperience.tsx` currently provides:

- `EditorialIndex`: editorial introduction plus reusable entity cards;
- `EditorialDetail`: back link, entity hero, metadata facts, body, child sections, and inquiry CTA;
- `EditorialRelated`: reusable related-content cards.

Supporting public components include `HomeHero`, `PageContainer`, `SectionTitle`, `ArtistCard`, `ArtworkCard`, and `CertificateVerificationPanel`. The homepage has a separate, richer visual vocabulary with artist, artwork, exhibition, project, and news compositions.

### Design-language strengths

- Typography-first hierarchy using restrained sans-serif metadata and Georgia editorial display type.
- Warm ivory palette, low-contrast rules, calm whitespace, and photography-led proportions.
- Fluid type and spacing through `clamp()`.
- Large media fields and asymmetric project grids.
- Small, quiet interaction cues rather than dashboard-like controls.
- Global `prefers-reduced-motion` support and visible focus treatment.
- Shared inquiry and related-content endings create a repeatable institutional page rhythm.

### System weaknesses

- The experience system is concentrated in one component file and a large, cumulative global stylesheet rather than explicit composable primitives.
- `EditorialDetail` fixes hero, facts, body, and inquiry into one template; it is too rigid for artwork galleries, exhibition rosters, project timelines, or long-form curatorial sequences.
- There are no named primitives yet for hero variants, editorial sections, large-media sequences, metadata groups, entity headers, timelines, or motion/disclosure patterns.
- Index cards use the same structural treatment across different content types, reducing entity-specific storytelling.
- Motion is mostly hover scaling/translation. There is no shared motion contract for disclosure height, opacity, media reveal, sequencing, or reduced-motion alternatives.
- Empty media renders as an unlabelled blank figure, which may appear broken.
- Global CSS contains several successive visual layers and legacy public/admin rules, increasing cascade and regression risk.
- Header navigation contains eight primary links at once; responsive behavior relies mainly on wrapping rather than a deliberate compact navigation state.

## 3. Existing routing

### Public routes relevant to Sprint 03

- `/artists` and `/artists/[slug]`
- `/artworks` and `/artworks/[slug]`
- `/collections` and `/collections/[slug]`
- `/exhibitions` and `/exhibitions/[slug]`
- `/projects` and `/projects/[slug]`

Additional public routes include the homepage, news, publications, services, contact, certificate verification, sitemap, and robots routes. All five Sprint 03 entity families therefore already have list and detail route shells. New routes are not required for the stated public objective.

### Routing strengths

- Next.js App Router organization is clear and conventional.
- Slug-based public detail URLs are established.
- Missing records correctly invoke `notFound()`.
- Public routes are server-rendered and currently marked `force-dynamic`, matching database-backed content.
- Shared header/footer navigation already links to the five priority entity families.

### Routing risks

- Artists and artworks have `getPublicBySlug()` repository methods; collections, exhibitions, and projects load every public record and find by slug in memory.
- Every detail page repeats its own relation assembly and media mapping.
- Page-level relation queries are incomplete, so existing routes cannot yet render all required cross-entity sections.
- No route-level loading or error UI was found for these experience routes.
- The current Next 16 code uses synchronous `params` typing. It passes the present typecheck, but should be checked against the actual runtime/build behavior before broader refactoring.

## 4. Existing CMS structure

### Current state

The CMS is organized by entity under `src/lib/cms/*`, with separate form, table, CRUD, validation, action, adapter, and runtime concerns. Admin routes exist for artists, artworks, collections, exhibitions, projects, media, and other institutional content.

The production read/write path is PostgreSQL/Prisma-based. Public repository adapters return legacy-shaped domain interfaces from Prisma records, which keeps pages insulated from database naming conventions. The project also retains legacy JSON adapters and data files, creating a transitional dual-system footprint.

Artist and artwork admin/media files currently have uncommitted edits in the working tree. Sprint 03 should avoid overlapping those files until that work is resolved or incorporated.

### CMS strengths

- Clear module boundaries and reusable form/table/CRUD engines.
- Validation and persistence preparation are separated from UI components.
- Bilingual Arabic/English fields are first-class in entity forms.
- Visibility, status, featured state, display order, and media references are already modeled.
- PostgreSQL persistence and organization scoping are implemented.
- Database relationships already cover artist–artwork, artwork–collection, exhibition–artist, exhibition–artwork, project–artist, project–artwork, certificates, and project media.
- Existing architecture can support an entity-management UX without schema changes.

### CMS preparation gaps

- Admin edit pages are still framed primarily as “Edit [Entity]” and single long forms.
- Relationship management is not surfaced as an institutional entity workspace with Profile/Works/Collections/Exhibitions/Projects/Media/Certificates/History sections.
- Several legacy config descriptions still say workflows are future, read-only, or JSON-disabled even where production Prisma actions now exist; UX copy and runtime reality need reconciliation.
- Legacy JSON adapters coexist with Prisma services, increasing the chance of using the wrong persistence path during future work.
- The public domain types do not expose several Prisma fields and relations (for example exhibition status/featured/display order, collection featured/display order, and relation collections).

### Phase 4 direction without backend changes

Prepare a compositional admin shell around existing actions and contracts:

- entity identity header with publication/status context;
- section navigation for the existing form and related records;
- relation panels powered by read-only selectors first;
- media and certificate panels using current IDs and existing actions;
- activity/history presentation where data already exists;
- progressive enhancement of relationship editing only when existing endpoints/actions support it.

This should remain a UX composition exercise. It must not introduce new models, fields, migrations, or altered action payloads.

## 5. Existing media system

### Current state

- Media records live in PostgreSQL and are mapped to the public `Media` interface.
- Binary upload uses an S3-compatible storage provider.
- Storage configuration is environment-driven and supports custom endpoints/public base URLs.
- Upload validation accepts images, video, audio, and PDF, with a 20 MB maximum.
- Files receive generated object keys, SHA-256 checksums, MIME classification, visibility, and database records.
- Public media lookup currently exposes all image media, lookup by ID, artist profile media, artwork primary media, and homepage hero media.
- `next.config.js` builds remote image patterns from the configured public storage base URL.

### Media strengths

- Storage and persistence are separated behind a provider/repository boundary.
- Failed database persistence triggers object deletion cleanup.
- Alt text, MIME type, dimensions, size, checksum, visibility, and storage path have established concepts.
- Artist profiles, artwork primary media, and entity cover media already use stable media IDs.
- The Prisma model contains richer relationships including artwork media and project media.

### Media risks and gaps

- Public components render raw `<img>` rather than the configured Next image pipeline.
- Public repository methods expose only single primary/cover images; large media sequences and galleries are not available to pages.
- Width and height are optional in the public type and are not populated during upload in the inspected service, limiting aspect-ratio reservation and increasing layout-shift risk.
- Upload body limit is configured to 10 MB while upload validation permits 20 MB, creating a practical limit mismatch.
- Media alt text is mapped into both English and Arabic from one Prisma `altText` field; bilingual presentation is not truly represented at the production mapper boundary.
- The current public filter returns images only, so project video/audio/document storytelling needs a separate, deliberately scoped read method.
- Remote object availability, derivatives, focal points, and responsive renditions are not represented in the current public API.
- Existing uncommitted media-picker changes must be stabilized before related CMS preparation.

## 6. Entity-by-entity readiness

### Artist

Ready now: identity, biography, nationality, birth year, representation status, profile image, works by artist, inquiry.  
Missing for objective: approved index disclosure implementation; richer metadata/story sequencing; collection, exhibition, project, media, certificate, and history relation reads.

### Artwork

Ready now: primary image, title, artist, year, medium, dimensions, description, availability, conditional price, same-artist related works, inquiry.  
Missing for objective: media gallery, collection link/content, exhibition links, project links, more intentional related-work logic, certificates/provenance presentation where appropriate.

### Collection

Ready now: cover, title, description, directly assigned artworks, inquiry.  
Missing for objective: distinct curatorial-story composition, derived artist roster, related exhibitions, richer featured-work ordering, direct slug repository query.

### Exhibition

Ready now: cover, title, statement/description, dates, venue, inquiry.  
Missing for objective: artist roster, artwork selection, exhibition status/context, gallery information composition, related media, direct slug repository query.

### Project

Ready now: cover, title, description, client, type, year, status, inquiry.  
Missing for objective: story chapters, project media, artist roster, artwork selection, timeline representation, direct slug repository query.

## 7. Principal risks

| Risk | Level | Impact | Mitigation |
|---|---|---|---|
| Approved Artists reference is absent from the inspected repository | Critical | Implementation may unintentionally redesign the approved identity | Recover and sign off the exact HTML/commit/screenshots before Phase 2 |
| Public relation read layer is incomplete | High | Artwork, collection, exhibition, and project objectives cannot be fulfilled cleanly | Add repository query methods over existing models/contracts; do not change schema |
| Current working tree contains unrelated CMS/media edits | High | Overlap may lose or conflict with active work | Resolve/stash/commit that work before Sprint 03 implementation; never overwrite it |
| Requested branch differs from checked-out branch | Medium | Delivery may land on the wrong branch | Confirm/switch branch only after preserving the dirty working tree |
| Shared detail template is too rigid | Medium | Pages may become generic and repetitive | Decompose into small experience primitives while preserving visual language |
| Large cumulative global CSS cascade | Medium | Visual regression and admin/public leakage | Isolate new experience classes and migrate incrementally with page verification |
| Full-list fetch plus in-memory relation filtering | Medium | Poor scaling and unnecessary database/data transfer | Add scoped repository reads and relation assemblers |
| Image dimension/loading pipeline is incomplete | Medium | Layout shift, inconsistent crops, slow media delivery | Establish aspect-ratio/media policies using existing metadata and storage URLs |
| 10 MB action limit conflicts with 20 MB validation | Medium | Uploads between 10–20 MB fail before service validation | Align limits in the existing media configuration during the appropriate media sprint |

## 8. Recommended implementation order

### Gate 0 — establish the approved reference

1. Recover the approved Artists HTML experience or an authoritative visual/interaction artifact.
2. Confirm its typography, spacing, image ratios/crops, desktop/mobile behavior, focus/keyboard behavior, and motion timing.
3. Preserve the current dirty CMS/media work and align the checked-out branch with the requested delivery branch.

No visual implementation should begin before this gate is complete.

### Step 1 — define the 015 experience primitives

Extract, without changing data contracts:

1. entity header and hero variants;
2. editorial text section;
3. large single media and media sequence;
4. metadata/facts block;
5. related entity rail/grid;
6. inquiry section;
7. accessible disclosure and shared motion tokens/behaviors.

Keep the warm palette, type hierarchy, whitespace, rules, and photography emphasis already established. Avoid creating a generic component library or dashboard vocabulary.

### Step 2 — restore and polish Artists first

Implement the approved closed-first, single-open interaction as the canonical disclosure pattern. Preserve link access to artist detail pages. Add metadata and story depth only where it supports the approved rhythm. Verify keyboard operation, focus, reduced motion, mobile layout, long biographies, missing images, and one-open-at-a-time state.

### Step 3 — establish the public relation query layer

Add read-only repository methods over existing Prisma relations for:

- artwork → artist, collection, exhibitions, projects, media, related works;
- collection → artworks, derived artists, related exhibitions;
- exhibition → artists, artworks, media/cover;
- project → artists, artworks, project media;
- direct public lookup by slug for every entity.

Return page-oriented view data or composed repository results without altering schema, models, migrations, public API contracts, or CMS mutation payloads.

### Step 4 — Artwork experience

Use Artwork as the first proof of the decomposed detail system because it exercises the most relationships: hero image/media, title and artist, narrative, details, collection, exhibitions, projects, related works, and inquiry.

### Step 5 — Collections

Build collection hero, curatorial story, featured artworks, derived artists, and related exhibitions. Reuse artwork/media and related-entity primitives rather than introducing a second visual system.

### Step 6 — Exhibitions

Build hero, statement, dates/venue/gallery information, artist roster, and artwork selection. Treat current/forthcoming/archive state as editorial context, not a dashboard badge pattern.

### Step 7 — Projects

Build story chapters, media sequence, artists, artworks, and a calm timeline. Use the existing project and project-media relationships; do not introduce a new timeline database model. Derive the available timeline from existing year/status/media/content unless a later approved backend contract provides more detail.

### Step 8 — CMS experience preparation

Prepare entity-workspace UX and section navigation around existing forms and relations. Keep changes presentational and compositional. Defer any relationship mutation that is not already supported by the existing CMS actions.

### Step 9 — continuous quality control

After every implementation increment:

1. run `npm run typecheck`;
2. verify list/detail routes for all five entities;
3. test empty, missing-media, and long-content states;
4. test desktop, tablet, and mobile layouts;
5. verify keyboard, focus, semantics, and reduced-motion behavior;
6. visually compare Artists against the approved reference before propagating its language.

## 9. Audit verification performed

- Inspected App Router public and admin route inventory.
- Inspected Artists list/detail data flow and shared public experience components.
- Inspected all five priority list/detail page implementations.
- Inspected global public/admin styling and responsive/reduced-motion rules.
- Inspected repository adapters, Prisma-backed public reads, entity types, CMS configurations, and relationship models.
- Inspected media repository, upload service, object-storage provider, and Next media configuration.
- Inspected Git status, branch pointers, and available commit history.
- Ran `npm run typecheck`: **passed with no TypeScript errors**.

Runtime route rendering and live database/object-storage availability were not exercised in this audit-only phase. No build was required, and no application code was modified.

## 10. Phase 1 conclusion

Sprint 03 should proceed, but only after the approved Artists reference is recovered. The current codebase already contains the beginnings of an appropriate 015 Gallery language and a strong relational backend foundation. The safest path is to preserve that identity, decompose the existing editorial layer into flexible experience primitives, and extend the public repository read layer over existing relationships. Schema or contract changes are neither required nor recommended for the stated objectives.
