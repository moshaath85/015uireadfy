# Broken Image Audit

Checked every `Media` row in the database (330 total) against the actual
file on disk or the actual remote host, across the public site, the admin
dashboard, and the Museum. This is a **live, verified** audit — every path
below was cross-referenced against `public/images/` or fetched, not
inferred from field names.

**Date:** 4 August 2026

## Summary

| Source pattern | Count | Status |
|---|---|---|
| `/images/...` static path, file present on disk | 325 | OK |
| `/images/...` static path, **file missing on disk** | 3 | **Broken** |
| Full remote URL (Cloudflare R2, real upload) | 2 | OK, reachable |
| Malformed / relative-without-leading-slash | 0 | — |
| Empty `storagePath` | 0 | — |

**330 media rows total. 3 are broken. That's it** — this is not a systemic
pipeline failure, it's three specific rows in a bad state, all three tied to
the same root cause.

## The image-resolution strategy (as it exists today)

One rule, applied everywhere: `Media.url` **is** `Media.storagePath` —
no base-URL joining, no transformation (`src/lib/tex7/database/providers/prisma-media-mapper.ts:33`).

- **Legacy/seed assets** get a repo-relative path starting with `/`
  (e.g. `/images/artworks/othman-taha-03.webp`), served by Next from
  `public/`. 95MB of these are committed to the repository.
- **New admin uploads** get the full public URL returned by the S3-compatible
  object storage provider at upload time
  (`src/lib/cms/media/media-upload-service.ts:49` — `storagePath: uploaded.publicUrl`),
  which is already an absolute `https://` URL. Verified: 2 rows in the
  database are real Cloudflare R2 URLs and both resolve.

This is a coherent, if slightly unusual, strategy — one field does double
duty as "relative path into the public folder" or "absolute URL," decided
purely by whether it starts with `/`. It is **not** the cause of the broken
images below; both mechanisms work correctly for every row except three.

**No change is needed to the resolution strategy itself.** What's needed is
fixing the three rows and, more importantly, the process gap that produced
them (see "Root cause").

## The three broken images

| Entity | Entity ID | Current source | Failure reason | Affected pages | Required action |
|---|---|---|---|---|---|
| Artist — Layla Al-Hassan | `art-001` | `/images/artists/layla-al-hassan-profile.jpg` (media `media-006`) | File does not exist in `public/images/artists/` | None currently — see "Why this isn't visible today" | Re-upload the portrait, or clear `profile_image_id` |
| Artist — Omar Farouk | `art-002` | `/images/artists/omar-farouk-profile.jpg` (media `media-007`) | File does not exist in `public/images/artists/` | None currently | Re-upload the portrait, or clear `profile_image_id` |
| Media — orphaned row | — (no artist references it) | `/images/artists/fahad-al-hijailan-profile.jpeg` (media `media-016`) | File does not exist; `width`/`height`/`checksum` are all `null`, unlike every real upload | None — unreferenced | Delete the media row |

### Why this isn't visible today, and why it's still worth fixing

Both `art-001` and `art-002` are currently **archived** (`archivedAt` set,
2026-08-01) — confirmed live: `GET /artists/layla-al-hassan` returns a
genuine 404 ("Artist Not Found"), and neither artist appears in
`getPublicAll()`, so today no visitor can reach either broken image.

But both records are *also* still flagged `visibilityStatus: "public"` —
an inconsistent state fully explained in
`docs/PRODUCTION_FUNCTIONAL_AUDIT.md` §3/§6: there is no "archive" button
anywhere in the dashboard UI (the mutation exists in the data layer for
every module but was never wired to a control), so this pair of fields can
only have drifted apart outside the normal product flow, and there is no
"unarchive" action either — so nothing in the CMS can currently fix this
without a direct database write.

**The real risk isn't today's rendering — it's tomorrow's.** The moment
someone adds a feature that queries by `visibilityStatus: 'public'` without
also checking `archivedAt: null` (a search index, an admin "public items"
filter, a future API), these two broken images resurface immediately,
because the data itself already says "public." Fixing the pipeline means
fixing the two fields together, not just the file.

`media-016` is different: it isn't tied to the archive bug. Its `checksum`
is `null` and its `width`/`height` are `null`, where every genuine upload in
the table has real values — this looks like a leftover seed/placeholder row
from before Fahad Al-Hijailan's `profile_image_id` was cleared (he
correctly shows the initials monogram today). It references nothing and
should simply be deleted.

## Current handling on the public site — already correct, verified live

Every portrait render path in the codebase (`ArtistMedia`, the homepage
roster, the three related-artist rails, the artist detail hero) uses
`<img onError={() => setFailedSource(...)}>`, so a 404 on any of these three
files degrades to the `ArtistMonogram` initials fallback rather than a
broken-image icon — this is the mechanism shipped in the artist-monogram
milestone earlier in this session, and it is a general safety net, not
specific to these three rows. If either archived artist were ever made
public again without fixing the file, a visitor would see initials, not a
broken image.

**Requirement from your brief — "do not silently hide broken content":**
confirmed not violated. The fallback only activates on an actual image
load failure (`onError`), never pre-emptively, and it announces itself via
`aria-label="No portrait of {name} on file"` rather than pretending nothing
is missing.

## What I did not change

I have **not** touched `art-001` / `art-002`'s `visibilityStatus`, deleted
`media-016`, or built the missing archive/unarchive UI. All three are one
or two lines of a database write or a small, well-scoped UI addition, but
they sit on top of the systemic finding in the functional audit (no
archive control exists anywhere in the dashboard) — fixing the data without
fixing the missing control just means it can happen again on the next
artist. Recommending this be done together, as part of whatever scope you
approve from the functional audit's Milestone 2.
