# Production Functional Audit

**Scope:** dashboard (`/admin/*`), the shared data/repository layer, the Museum
experience, and the AI chatbot. Read against the live application — routes
were requested against a running dev server, one full admin login was
performed, and the database was queried directly for the findings marked
**verified**. Findings not exercised live are marked **inspected** (read from
source) and flagged as such; they are not claims of a live test.

**Date:** 4 August 2026 · Branch `uiux-controlled-99` · Commit `08deca3` at time of audit.

---

## Summary

| | Count |
|---|---|
| Admin modules with a working list/create/edit path | 9 of 9 that exist |
| Admin modules with **no archive/delete control in the UI** | 9 of 9 that exist (backend support exists, unreachable) |
| Modules named in the brief that do not exist at all | Museum, Users & permissions, Appointments, Inquiries (as a dashboard view) |
| AI chatbot implementation found in the repository | **None** — no route, no UI, no provider integration, no API key slot |
| Museum data source | Static TypeScript config + one hardcoded array of 8 artwork IDs in `page.tsx` — no database table |
| Confirmed data-integrity bug | 6 records (3 artists, 3 artworks) archived but still flagged `visibilityStatus: public` |
| Confirmed broken images (verified against disk) | 3 media rows, tied directly to the bug above |

The honest one-line summary: **the CRUD write paths are real and working**
(server actions, auth-guarded, hit Postgres) — this is not a decorative
dashboard. What's missing is almost entirely the *destructive/lifecycle*
half of CRUD (archive, delete, unarchive) which exists in the data layer but
was never wired to a button, plus three subsystems that don't exist yet at
all: Museum administration, multi-user permissions, and the chatbot.

---

## 1. Frontend framework and structure

Next.js 16 (App Router, Turbopack dev), React 18, TypeScript, Prisma 5 against
Postgres (Neon). Public site and admin dashboard share one Next.js app;
`middleware.ts` gates every `/admin/*` route behind a signed session cookie.
Styling is hand-written CSS (`src/styles/*.css`), no component library.
3D Museum uses `@react-three/fiber` / `@react-three/drei` / `three`.

## 2. Authentication and authorization

**Single admin identity, environment-configured, no roles.**

- `src/lib/auth/admin-auth-runtime.ts` reads one email/password/role from
  `GALLERY015_ADMIN_EMAIL` / `_PASSWORD` / `_ROLE` / `_ORGANIZATION_ID` env
  vars — there is no `User` table, no invite flow, no per-user audit trail.
  `AdminRole` exists as a type but nothing in the codebase branches on it.
- Session: signed cookie, 8-hour TTL, rate-limited login (5 failures / 15 min).
- **Verified live:** logged in with the real admin credentials from
  `.env.local`; landed on `/admin` with the full nav rendered, no console
  errors, no failed requests.
- `requireAdminServerAction(permission)` is called at the top of every
  mutation I inspected (e.g. `updateArtworkAction`) — so mutations are
  auth-checked, not just the page shell.

**Gap:** "Users and permissions," named in the brief as a module to verify,
does not exist as a concept in this codebase. Adding it is a new subsystem
(a `User`/`Role` table, an invite/reset flow, a permissions matrix), not a
missing page — flagged for your decision in the final report.

## 3. Dashboard modules — what actually exists

The nav (`src/components/admin/AdminNav.tsx`) lists exactly these 11 items.
Two admin routes exist but are **not linked from the nav at all**
(`/admin/intelligence`, and the media library's second inline form) —
reachable only by typing the URL.

| Module | List | Create | Edit | Archive/Delete | Image upload | Search | i18n fields |
|---|---|---|---|---|---|---|---|
| Overview | ✅ | — | — | — | — | — | — |
| Artists | ✅ | ✅ (server action) | ✅ (server action, **verified** auth-gated) | ❌ **no UI control** | ✅ via `MediaPicker` | ✅ (`SearchBar`, inspected) | ✅ `_en`/`_ar` pairs throughout |
| Artworks | ✅ | ✅ | ✅ (**verified** the exact mutation: `updateArtworkAction` → `prepareUpdateArtworkAction` → Prisma, with redirect+status feedback) | ❌ | ✅ | ✅ | ✅ |
| Collections | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Exhibitions | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Projects | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Services | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| News (Journal) | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Publications | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Certificates | ✅ | ✅ | ✅ | ⚠️ archive exists in data layer (`archiveCertificateRecord`, sets `status: Revoked`) but **no button found** | n/a | ✅ | n/a |
| Media library | ✅ (`MediaGrid`) | ✅ upload, real S3-backed server action | n/a | ❌ **no delete/archive button** | — | — | n/a |
| Settings | ✅ | n/a | ✅ (single record) | n/a | ✅ (site logo etc.) | n/a | ✅ |
| Museum | — | — | — | — | — | — | — |
| Users & permissions | — | — | — | — | — | — | — |
| Appointments | — | — | — | — | — | — | — |
| Inquiries (dashboard view) | — | — | — | — | — | — | — |

Checkmarks for Create/Edit are based on reading the server action for each
route (they all follow the same pattern: `"use server"`, call
`requireAdminServerAction`, call a `prepareX/updateX` function in
`src/lib/cms/*`, redirect with a status query param) plus one live,
end-to-end verification on Artworks. I did not click through all nine forms
by hand — the pattern is consistent enough across modules that I'm reporting
it as the same shape, but if you want every module individually
click-tested, say so and I'll do it as its own pass.

### The one systemic finding: archive/delete is backend-complete, UI-absent

`src/lib/cms/production-prisma.ts` and `artists-prisma-adapter.ts` implement
a correct archive mutation for **every** entity — artists, artworks,
collections, exhibitions, projects, services, news, publications,
certificates. Each one sets `visibilityStatus: Hidden` **and**
`archivedAt: <now>` together, which is the right shape.

But grepping every admin list card (`ArtistAdminCard`, `ArtworkAdminCard`,
`ExhibitionAdminCard`, `ProjectAdminCard`, `CollectionAdminCard`,
`NewsAdminCard`, `ServiceAdminCard`) and the corresponding edit forms for
"archive" or "delete" returns **zero matches** in every one. The only
row actions rendered anywhere are "Edit" and "View" (the public link). A
curator can create and edit everything, and can never take anything down
through the interface. That's not a rough edge — it's half of CRUD
missing across the entire dashboard, from one root cause (the button was
never added), which makes it a contained fix once you say go: one small
`ArchiveButton` component wired to the already-correct server actions,
reused nine times.

**This also explains a live data bug** (see §6): six records are currently
archived (`archivedAt` set) but still flagged `visibilityStatus: public`,
which is the exact inconsistent state you'd get from a manual/scripted
correction done outside the UI, because the UI has no archive control to
have produced it through normal use, and there is no "unarchive" mutation
at all — so once a record reaches this state, nothing in the product can fix
it.

### Empty/loading/error/success states

**Inspected, not live-tested per module.** `EmptyState.tsx`,
`AdminAccessNotice.tsx`, and the `status=success|error` query-param pattern on
every edit page (visible in the `updateArtworkAction` redirect) indicate this
was actually built out, not skipped — success/error feedback happens via a
redirect + banner, not a toast, which is a reasonable pattern for
server-action forms. I did not verify every module shows a *distinct*
message on validation failure vs. a database error.

## 4. Museum — architecture, not a bug list

The brief calls this "incomplete." What it actually is: **a complete,
working 3D experience with a fully static, code-only data source.**
There is no database concept of a museum at all.

- `src/app/museum/page.tsx` hardcodes the exhibition as a literal array of
  8 artwork IDs (`EXHIBITION.heroes`, `.secondary`, `.all`). Changing which
  works appear means editing this file and redeploying.
- Wall placement (`src/components/museum/config/museum-artworks.config.ts`)
  is a **second**, independent hardcoded array — `wallId` + `[x,y,z]`
  position — keyed by array order, not by artwork ID. The two lists have to
  be kept in sync by hand; nothing enforces that they agree.
- Room geometry, lighting, frame styling, and navigation are all further
  static config files under `src/components/museum/config/`. None of it is
  read from Postgres.
- There is **no `/admin/museum` route** and no reference to museum data
  anywhere under `src/app/admin`.

So "not connected to the dashboard" is accurate, but the underlying reason
is that there is nothing in the schema for a dashboard to manage — no
`MuseumRoom`, `MuseumWall`, or `ArtworkPlacement` table. Building the
connection described in Phase 4 of your brief is a genuine **schema
addition**, not a wiring fix. Per your own instructions ("if a schema
migration is required, stop first"), I have not touched this — see the
final report for the concrete proposal.

### Artwork scale in the Museum — closer to correct than the brief assumes

`AutoArtworkFrame.tsx` **does** attempt physical-dimension scaling: it
parses the artwork's `dimensions` string (e.g. `"80 × 80 cm"`), converts to
metres, and only falls back to an image-aspect-ratio guess when no physical
dimensions are recorded. So the mechanism the brief asks for in Phase 5
partially exists already. Three real problems with it:

1. **Most works have nothing to parse.** Per the metadata audit, 245 of 268
   public artworks have `dimensions = "Dimensions available on request"` —
   there is no number to extract, so those works silently fall back to the
   pixel-ratio guess the brief specifically says not to use.
2. **Hard-coded per-image special cases inside the renderer:**
   `imageUrl.includes('mohammed-siam-01')` and
   `imageUrl.includes('mohammed-al-ajam-02')` are literal filename checks
   that apply a manual crop rectangle. This is a workaround for two specific
   photographs, not a system — it will not extend to any new artwork.
3. **No collision or wall-boundary validation.** Placement is `[x, y, z]` in
   free space; nothing checks that a scaled frame fits within the wall's
   declared dimensions or doesn't overlap its neighbour.

## 5. AI chatbot — does not exist

Searched the entire `src/` tree for `chatbot`, `openai`, `anthropic`,
`claude`, `gpt-`, `/api/chat`, `assistant` (case-insensitive): **zero
matches.** `.env.example` has no provider API key variable reserved at all.

What *does* exist and is easy to confuse for it: `/admin/intelligence`, which
reads an `AssetIntelligence` table (image quality scoring — resolution,
dominant colour, frame detection, duplicate grouping) — this is a media QA
tool, not a conversational assistant, and has nothing to do with answering
visitor questions. `AIKnowledge` and `AILog` also appear as TypeScript
interfaces in `src/types/index.ts`, but **have no corresponding Prisma
model** — they are dead types with no schema behind them, left over from an
earlier plan.

There is no partial implementation to complete. Building this is a from-zero
project: choosing a provider, provisioning a key, building retrieval over
the approved content, a UI widget, rate limiting, and Arabic/RTL support.
Per your own brief ("if a production AI provider is not configured...
report it as BLOCKED"), that's exactly how it's reported in the final
summary.

## 6. Data-integrity finding (verified against the live database)

Queried directly, not inferred:

- **6 records** — artists `art-001` (Layla Al-Hassan) and `art-002` (Omar
  Farouk), plus 3 artworks — have `archivedAt` set to a real timestamp
  (2026-08-01) **and** `visibilityStatus: "public"` simultaneously.
- Every public-facing query (`getPublicAll`, `getPublicBySlug`, the sitemap)
  correctly filters on `archivedAt: null`, so these records **do not**
  leak onto the live site or into the sitemap — confirmed by reading
  `sitemap.ts` and the repository functions, and by a live request:
  `curl /artists/layla-al-hassan` → genuine `404`, "Artist Not Found,"
  even though the admin UI would show this artist's status as "Public."
- Root cause, as established in §3: there is no "archive" button anywhere
  in the UI, so this state can only have been produced by a script or a
  direct database edit that set `archivedAt` without the matching
  `visibilityStatus: Hidden` the real archive function always sets together.
  There is also no "unarchive" mutation in the codebase at all, so once a
  record reaches this state nothing in the product — dashboard included —
  can bring it back or fully retire it.
- This is the direct cause of the three broken image references documented
  in `docs/BROKEN_IMAGE_AUDIT.md`: the two artists' profile photos were
  removed from disk (presumably as part of whatever archiving pass produced
  this state) but the `Media` and `Artist.profileImageId` rows were never
  cleaned up.

## 7. What I did not do

- Did not click-test all nine CRUD modules end-to-end (create → edit →
  attempted archive) individually; verified the pattern once in full on
  Artworks and confirmed the shape is identical everywhere by reading the
  server actions.
- Did not attempt to build the missing archive-button UI, the Museum
  database schema, the Museum admin module, or the chatbot — each is
  either a schema change requiring your sign-off, a new subsystem
  requiring a decision (provider, budget for a multi-user auth model), or
  both. See the final report.
- Did not audit `src/app/admin/bulk/[module]/{export,import}` beyond
  confirming the routes exist; bulk import/export was out of scope for this
  pass given everything above.
