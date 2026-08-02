# Sprint 07 CMS Implementation Plan

Purpose: transform the Gallery 015 CMS from a functional admin dashboard into a professional institutional Content Operating System.

Architecture status: frozen.

This plan does not propose changes to:

- Prisma schema
- Database models
- Migrations
- Experience contracts
- Public routes
- APIs

Scope focus: CMS operations and admin/frontend experience only.

Public Experience System v1.0 status:

- Artist Experience: complete
- Artwork Experience: complete
- Collection Experience: complete
- Exhibition Experience: complete
- Project Experience: complete

---

# 1. Current CMS Inventory

## Admin modules

- Artists
- Artworks
- Collections
- Exhibitions
- Projects
- Media
- Certificates
- Settings
- Import/Export

## Existing pages

### Core

- `/admin`
- `/admin/login`
- `/admin/logout`

### Artists

- `/admin/artists`
- `/admin/artists/new`
- `/admin/artists/[id]/edit`

### Artworks

- `/admin/artworks`
- `/admin/artworks/new`
- `/admin/artworks/[id]/edit`

### Collections

- `/admin/collections`
- `/admin/collections/new`
- `/admin/collections/[id]/edit`

### Exhibitions

- `/admin/exhibitions`
- `/admin/exhibitions/new`
- `/admin/exhibitions/[id]/edit`

### Projects

- `/admin/projects`
- `/admin/projects/new`
- `/admin/projects/[id]/edit`

### Services, News, Publications (existing editorial modules)

- `/admin/services`, `/admin/services/new`, `/admin/services/[id]/edit`
- `/admin/news`, `/admin/news/new`, `/admin/news/[id]/edit`
- `/admin/publications`, `/admin/publications/new`, `/admin/publications/[id]/edit`

### Media

- `/admin/media`

### Certificates

- `/admin/certificates`
- `/admin/certificates/new`
- `/admin/certificates/[id]/edit`

### Settings

- `/admin/settings`

### Bulk import/export endpoints

- `/admin/bulk/[module]/template`
- `/admin/bulk/[module]/export`
- `/admin/bulk/[module]/import`

## Existing components

### Layout and navigation

- `AdminShell`
- `AdminHeader`
- `AdminNav`
- `PageToolbar`

### Data and status

- `DataTable`
- `EmptyState`
- `StatusBadge` and module-specific badges

### Forms

- `FormField`
- `FormActions`
- Module forms (`ArtistForm`, `ArtworkForm`, `CollectionForm`, `ExhibitionForm`, `ProjectForm`, `NewsForm`, `PublicationForm`, `ServiceForm`)

### Media components

- `MediaGrid`
- `MediaCard`
- `MediaDetails`
- `MediaPicker`

### Settings and utility

- `SettingsPanel`
- `SettingsField`
- `BulkImportExportPanel`

## Current persistence state

- PostgreSQL write-enabled in admin workflows: Artists, Artworks, Collections, Exhibitions, Projects, Services, News, Publications.
- Media upload persists through production media upload flow (object storage + PostgreSQL metadata).
- Certificates admin create/update currently run in prepare-only mode (validation + messaging, no actual save path invoked from admin create/edit pages).
- Settings admin page is read-only table view; no edit/save action wired in current route.

## Existing workflows

- Authenticated admin access through `/admin` middleware and server-action authorization.
- List -> Create/Edit forms -> redirect-based success/error feedback.
- Archive action currently present in selected modules (for example Artists and Artworks list pages).
- Media upload in admin media page with immediate status feedback.
- Bulk template/export/import for supported modules via dedicated endpoints.

---

# 2. CMS Capability Matrix

| Module | Read | Create | Update | Archive | Bulk | Media | Relationships | Current State |
|---|---|---|---|---|---|---|---|---|
| Artists | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ Partial | Operational, but messaging drift and relationship tooling not unified in UI |
| Artworks | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ Partial | Operational, but list/form copy still references read-only/preparation in places |
| Collections | ✅ | ✅ | ✅ | ⚠️ Partial | ✅ | ✅ | ⚠️ Partial | Operational core CRUD; relationship management is implicit rather than explicit |
| Exhibitions | ✅ | ✅ | ✅ | ⚠️ Partial | ✅ | ✅ | ⚠️ Partial | Operational core CRUD; artist/artwork relationship management needs dedicated UX layer |
| Projects | ✅ | ✅ | ✅ | ⚠️ Partial | ✅ | ✅ | ⚠️ Partial | Operational core CRUD; artist/artwork/media relationship management needs dedicated UX layer |
| Media | ✅ | ✅ Upload | ⚠️ Partial | ⚠️ Partial | ❌ | N/A | ⚠️ Partial | Strong upload/list foundation; usage/relationship visibility and archive lifecycle not fully surfaced |
| Certificates | ✅ | ⚠️ Prepared-only | ⚠️ Prepared-only | ⚠️ Partial backend / no clear admin UX | ❌ | ❌ | ✅ Artwork link | UI exists but admin save path not activated |
| Settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Read-only display; no settings operation workflow |
| Import/Export | ✅ | ✅ Import | ✅ Export | N/A | ✅ | ✅ refs validated | ✅ refs validated | Functional base pipeline; needs enterprise governance layer |

Gap summary:

- Capability truth is inconsistent between UI copy and actual behavior.
- Relationship operations exist in data model and import pipelines but not as first-class admin UX workflows.
- Certificates and Settings are not fully operational for institutional daily usage.
- Search/filter consistency and operational feedback are uneven across modules.

---

# 3. Operational Truth Problems

## Problem 1: read-only messaging where writes are active

Current behavior:

- Some pages/forms state records are read-only or preparation-only while create/update are actually persisted to PostgreSQL.

Problem:

- Operators cannot trust system state; this increases publication risk and training overhead.

Recommended fix:

- Replace static copy with capability-driven copy generated from a registry and action state.

## Problem 2: JSON/development references after production persistence activation

Current behavior:

- Multiple form and helper messages still reference guarded JSON/development write language.

Problem:

- Legacy language conflicts with current production persistence and creates policy ambiguity.

Recommended fix:

- Remove legacy JSON language from active modules and keep any legacy/deferred mode language only where capability is truly disabled.

## Problem 3: Certificates create/edit experience visible but not saving

Current behavior:

- Certificate pages allow preparation flow and show success-like feedback, but create/edit admin path does not activate persistence.

Problem:

- High operational risk: user believes certificate operation completed when no record is committed.

Recommended fix:

- Enable certificate create/update persistence through existing repository/service path and align CTA/feedback language with true action outcome.

## Problem 4: Settings presented as a management area but read-only

Current behavior:

- Settings is accessible in navigation and presented as administrative domain, but route is display-only.

Problem:

- Institutional operators lack direct operational control over critical site configuration.

Recommended fix:

- Add controlled edit workflow with validation, save confirmation, and change visibility in admin.

## Problem 5: search appears available but is functionally limited

Current behavior:

- Shared search input appears on many pages but is read-only and not consistently bound to URL/state.

Problem:

- Perceived search capability without real query behavior damages usability confidence.

Recommended fix:

- Standardize URL-based query handling and per-module filtering behavior.

## Problem 6: visible features that are partial or not uniformly implemented

Current behavior:

- Archive, lifecycle controls, and relationship actions are unevenly surfaced across modules.

Problem:

- Inconsistent operation model across modules increases errors and onboarding time.

Recommended fix:

- Capability registry controls visibility/availability of controls; unavailable actions are hidden or clearly marked as unavailable.

---

# 4. Proposed CMS Architecture

## Capability Registry

Define a module capability registry for admin operations:

- `read`
- `create`
- `update`
- `archive`
- `bulk`
- `media-link`
- `relationship-management`

Design intent:

- One source of truth for what each module can do now.
- No inferred behavior from static page text.
- No duplicate capability logic across pages/components.

How it affects admin UX:

- Navigation: show operational status and available actions per module.
- Buttons: render only actions that are enabled by capability.
- Forms: show capability-aware helper text and submit labels.
- Messages: show action outcomes based on real write result, not static copy.

## Admin Feedback System

Define a shared feedback pattern:

- Success messages:
  - explicit action + entity + outcome
  - example: "Artwork saved to PostgreSQL and ready for public rendering."
- Error messages:
  - user-facing safe message + actionable hint
  - preserve detailed technical context in server logs
- Validation messages:
  - field-level and summary-level
  - persistent until corrected
- Warnings:
  - non-blocking operational warnings (missing optional metadata, weak relationship coverage, etc.)

Feedback standards:

- Keep response semantics consistent between list/create/edit/archive flows.
- Keep UI messages synchronized with true backend results.

## Search System

Define URL-based search and filter standard:

- Use query parameters for search/filter/sort (`q`, module-specific filters, `sort`, `page`).
- Keep filter state shareable/bookmarkable via URL.
- Preserve search state after create/edit return flows.

Pagination expectations:

- Introduce deterministic pagination for large institutional datasets.
- Include total count, page size, current range, and empty-result guidance.

---

# 5. Relationship Management Plan

Design relationship workflows using existing schema and current relationships only.

## Artist workflows

- Link/unlink Artworks assigned to the artist.
- Link/unlink Exhibitions involving the artist.
- Link/unlink Projects involving the artist.
- Provide relationship summary panels on artist edit screen.

## Artwork workflows

- Assign/reassign primary Artist.
- Assign/unassign Collection.
- Link/unlink Exhibitions containing the artwork.
- Link/unlink Projects containing the artwork.

## Collection workflows

- Attach/detach Artworks.
- View ordered collection membership and coverage status.

## Exhibition workflows

- Manage participating Artists.
- Manage included Artworks.
- Support ordering and visibility of included entities.

## Project workflows

- Manage participating Artists.
- Manage included Artworks.
- Manage supporting Media references.

Relationship UX requirements:

- Relationship selector with search.
- Duplicate prevention.
- Clear add/remove confirmation messaging.
- Visibility of relationship impact before save.

---

# 6. Media Operating System Plan

Media Library improvements (without schema/API changes):

- Search:
  - full query across id, alt text, mime type, checksum, storage path.
- Filtering:
  - media type, provider, visibility, duplicate candidates, usage state.
- Usage tracking:
  - show where media is used across artists/artworks/collections/exhibitions/projects/news/publications.
- Entity relationships:
  - per-asset relationship panel with linked entities.
- Picker experience:
  - faster selection, recent selections, context-aware suggestions.
- Metadata operations:
  - consistent edit affordances for alt text and operational metadata.

Operational objective:

- Media becomes a governed reusable asset system, not only a file list.

---

# 7. Import / Export Enterprise Workflow

## Safe import flow

Upload
↓
Validation
↓
Report
↓
Approval
↓
Import

### Validation gates

- Duplicate detection:
  - duplicate IDs and slugs within file.
  - conflict awareness for existing records.
- Missing field detection:
  - required field checks by module config.
- Relationship validation:
  - referenced entities must exist.
  - media references must resolve.

### Report and approval

- Present row-level summary:
  - total rows, valid rows, blocked rows, warnings.
- Approval step confirms operator intent before mutation.
- Store import summary artifacts for operational traceability.

### Rollback considerations

- Prefer staged import in deterministic chunks.
- Use transaction boundaries where available in current runtime.
- On failure, provide clear partial-success report and retry instructions.

## Export requirements

Provide export with:

- JSON
- CSV
- relationship references
- media references
- timestamps (`created_at`, `updated_at`, and relevant operational fields)

Export objective:

- reliable round-trip data exchange for institutional governance.

---

# 8. Sprint Breakdown

## Sprint 07A: CMS Truth & Foundation

Goal:

- Align all admin UX messaging, controls, and behavior with real capabilities.
- Introduce capability registry and shared feedback/search baseline.

Files likely affected:

- `src/app/admin/**/page.tsx`
- `src/components/admin/PageToolbar.tsx`
- `src/components/admin/SearchBar.tsx`
- `src/components/admin/FormActions.tsx`
- `src/components/admin/AdminHeader.tsx`
- `src/lib/cms/**/` capability/messaging helpers

Risk:

- Medium: broad UX touch points, low data-model risk.

Acceptance criteria:

- No module claims read-only/prepared when writes are active.
- Search UX is functional and URL-based where shown.
- Feedback semantics are consistent across create/update/archive.

## Sprint 07B: Relationship Management

Goal:

- Make relationship operations explicit and operator-friendly across core modules.

Files likely affected:

- `src/app/admin/artists/[id]/edit/page.tsx`
- `src/app/admin/artworks/[id]/edit/page.tsx`
- `src/app/admin/collections/[id]/edit/page.tsx`
- `src/app/admin/exhibitions/[id]/edit/page.tsx`
- `src/app/admin/projects/[id]/edit/page.tsx`
- `src/components/admin/*Form.tsx`

Risk:

- Medium-high: relationship UX complexity and validation burden.

Acceptance criteria:

- Operators can add/remove supported relationships safely.
- Relationship errors are clear and actionable.
- No schema changes introduced.

## Sprint 07C: Media Operating System

Goal:

- Elevate media management to institutional asset operations.

Files likely affected:

- `src/app/admin/media/page.tsx`
- `src/components/admin/media/*`
- `src/components/admin/FormField.tsx`

Risk:

- Medium: high UI complexity, moderate integration impact.

Acceptance criteria:

- Advanced search/filter works reliably.
- Usage and relationship context is visible per asset.
- Picker flow is faster and clearer for editors.

## Sprint 07D: Import / Export Hardening

Goal:

- Add enterprise-safe validation/report/approval behaviors to existing bulk workflows.

Files likely affected:

- `src/app/admin/bulk/[module]/import/route.ts`
- `src/app/admin/bulk/[module]/export/route.ts`
- `src/lib/cms/bulk-import-export.ts`
- `src/components/admin/BulkImportExportPanel.tsx`

Risk:

- High: potential for large data mutations and operator impact.

Acceptance criteria:

- Import includes structured validation report and explicit approval.
- Relationship/media reference failures are clearly reported.
- Export includes operationally complete fields and references.

## Sprint 07E: Certificates & Settings

Goal:

- Make Certificates and Settings fully operational in CMS.

Files likely affected:

- `src/app/admin/certificates/new/page.tsx`
- `src/app/admin/certificates/[id]/edit/page.tsx`
- `src/lib/cms/certificates/certificates-actions.ts`
- `src/app/admin/settings/page.tsx`
- settings form/action components and repository wiring

Risk:

- Medium-high: governance-sensitive operational domains.

Acceptance criteria:

- Certificates create/update persist with truthful feedback.
- Settings edit/save path exists with validation and confirmation.
- No architecture freeze violations.

## Sprint 07F: Final CMS UX Polish

Goal:

- Complete consistency, accessibility, and institutional quality pass.

Files likely affected:

- `src/components/admin/*`
- `src/styles/globals.css`
- module route pages under `src/app/admin/*`

Risk:

- Medium: cross-cutting UX changes.

Acceptance criteria:

- Consistent interaction patterns across all modules.
- Accessibility baseline validated for key workflows.
- CMS behavior and language are institution-ready and coherent.

---

# 9. Implementation Rules

Before coding:

- Audit first.
- Propose files to change.
- Explain operational and delivery risk.

Never:

- Modify database shape without approval.
- Create duplicate systems that bypass existing architecture.
- Bypass repositories/service boundaries for admin operations.
- Break existing experience architecture or contracts.

Additional execution rule:

- Keep capability truth centralized; avoid hardcoded per-page behavior drift.

---

# 10. Final Acceptance Criteria

After Sprint 07 implementation, CMS must allow gallery staff to:

- Manage artists
- Manage artworks
- Manage collections
- Manage exhibitions
- Manage projects
- Manage media
- Safely import/export
- Manage relationships
- Preview public experience context from admin workflows

Completion standard:

- Operational truth is consistent.
- Core modules are institutionally operable.
- Admin UX supports accurate, safe, and repeatable daily content operations.
