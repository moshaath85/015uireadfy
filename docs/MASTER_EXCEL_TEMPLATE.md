# Gallery 015 — Master Excel Content Template

Canonical field definitions for real content entry via the CMS bulk
import/export workflow. This is the single source of truth for what the
importer accepts and what the exporter produces — import and export use the
same field definitions.

## How to use

1. In the CMS, on any entity index page (Artists, Artworks, Exhibitions,
   Collections, Projects, Publications, Services, News), use
   **Download Excel Template** to get the `.xls` XML template, or
   **Export Data** to get a CSV of current records.
2. Fill only the columns described below.
3. Upload via **Import Excel**.

> Supported formats: **`.xlsx`** (modern binary), **`.xls`** (XML template),
> and **`.csv`**. The `.xlsx` parser resolves cell values (never executes
> formulas) and treats workbooks as untrusted input.

### A complete reference workbook

A master workbook covering all entity sheets plus a README sheet is shipped as
`docs/gallery-015-master-template.xlsx`.

### Import limits

- Maximum file size: **8 MB**
- Maximum rows read per sheet: **10,000**
- Maximum columns: **200**
- Empty workbooks and malformed `.xlsx` files are rejected with a clear message.
- Data rows are imported; invalid rows are skipped and reported — valid rows
  are never discarded silently.

## Conventions

- `*` = REQUIRED (importer will reject the row if missing)
- RECOMMENDED = strongly advised for a complete public record
- OPTIONAL = blank allowed
- SYSTEM GENERATED / DO NOT EDIT = never supplied; the importer or database
  sets these (do not include them in your file)

---

## Artists

| Column | Requirement |
|---|---|
| `id` | REQUIRED — unique record id (e.g. `art-001`) |
| `slug` | REQUIRED — unique URL-safe slug (e.g. `artist-name`) |
| `name_en` | REQUIRED |
| `name_ar` | REQUIRED |
| `bio_en` | REQUIRED |
| `bio_ar` | REQUIRED |
| `birth_year` | REQUIRED — integer |
| `nationality_en` | REQUIRED |
| `nationality_ar` | REQUIRED |
| `website` | OPTIONAL |
| `email` | OPTIONAL |
| `instagram` | OPTIONAL |
| `profile_image_id` | OPTIONAL — media id from Media library |
| `featured` | OPTIONAL — `true`/`false` |
| `display_order` | OPTIONAL — integer |
| `representation_status` | REQUIRED — one of `represented`, `exclusive`, `non_exclusive`, `collection` |
| `visibility_status` | REQUIRED — `public` or `hidden` |

SYSTEM GENERATED: `organizationId`, `createdAt`, `updatedAt`, `archivedAt`,
relation tables.

## Artworks

| Column | Requirement |
|---|---|
| `id` | REQUIRED |
| `slug` | REQUIRED — unique URL-safe slug |
| `title_en` | REQUIRED |
| `title_ar` | REQUIRED |
| `artist_id` | REQUIRED — existing Artist id |
| `collection_id` | OPTIONAL — existing Collection id |
| `year` | REQUIRED — integer |
| `medium_en` | REQUIRED |
| `medium_ar` | OPTIONAL (falls back to `medium_en`) |
| `dimensions` | REQUIRED |
| `description_en` | REQUIRED |
| `description_ar` | REQUIRED |
| `price_status` | REQUIRED — e.g. `price_upon_request` |
| `availability_status` | REQUIRED — e.g. `available` |
| `visibility_status` | REQUIRED — `public` or `hidden` |
| `primary_image_id` | REQUIRED — existing Media id |
| `featured` | OPTIONAL — `true`/`false` |
| `display_order` | OPTIONAL — integer |

SYSTEM GENERATED: `organizationId`, `primaryMedia` relation, `createdAt`,
`updatedAt`, `archivedAt`.

## Exhibitions

| Column | Requirement |
|---|---|
| `id` | REQUIRED |
| `slug` | REQUIRED |
| `title_en` | REQUIRED |
| `title_ar` | REQUIRED |
| `description_en` | REQUIRED |
| `description_ar` | REQUIRED |
| `start_date` | REQUIRED — `YYYY-MM-DD` |
| `end_date` | REQUIRED — `YYYY-MM-DD` |
| `venue_en` | REQUIRED |
| `venue_ar` | REQUIRED |
| `cover_media_id` | OPTIONAL — Media id |
| `status` | OPTIONAL — e.g. `planned`, `ongoing`, `closed` |
| `featured` | OPTIONAL — `true`/`false` |
| `display_order` | OPTIONAL — integer |
| `visibility_status` | REQUIRED — `public` or `hidden` |
| `artist_ids` | OPTIONAL — pipe-separated Artist ids (`art-001\|art-002`) |
| `artwork_ids` | OPTIONAL — pipe-separated Artwork ids |

SYSTEM GENERATED: `organizationId`, relation join tables, `createdAt`,
`updatedAt`, `archivedAt`.

## Collections

| Column | Requirement |
|---|---|
| `id` | REQUIRED |
| `slug` | REQUIRED |
| `title_en` | REQUIRED |
| `title_ar` | REQUIRED |
| `description_en` | REQUIRED |
| `description_ar` | REQUIRED |
| `cover_media_id` | OPTIONAL — Media id |
| `featured` | OPTIONAL — `true`/`false` |
| `display_order` | OPTIONAL — integer |
| `visibility_status` | REQUIRED — `public` or `hidden` |

## Projects

| Column | Requirement |
|---|---|
| `id` | REQUIRED |
| `slug` | REQUIRED |
| `title_en` | REQUIRED |
| `title_ar` | REQUIRED |
| `description_en` | REQUIRED |
| `description_ar` | REQUIRED |
| `client_en` | OPTIONAL |
| `client_ar` | OPTIONAL |
| `type` | REQUIRED — e.g. `commission` |
| `year` | REQUIRED — integer |
| `status` | REQUIRED — e.g. `in_progress`, `completed`, `planned` |
| `cover_media_id` | OPTIONAL — Media id |
| `featured` | OPTIONAL — `true`/`false` |
| `display_order` | OPTIONAL — integer |
| `visibility_status` | REQUIRED — `public` or `hidden` |
| `artist_ids` | OPTIONAL — pipe-separated Artist ids |
| `artwork_ids` | OPTIONAL — pipe-separated Artwork ids |
| `media_ids` | OPTIONAL — pipe-separated Media ids |

## Publications

| Column | Requirement |
|---|---|
| `id` | REQUIRED |
| `slug` | REQUIRED |
| `title_en` | REQUIRED |
| `title_ar` | REQUIRED |
| `description_en` | REQUIRED |
| `description_ar` | REQUIRED |
| `type` | REQUIRED — e.g. `catalogue` |
| `file_url` | REQUIRED — URL of the publication file |
| `cover_image_id` | OPTIONAL — Media id |
| `publish_date` | REQUIRED — `YYYY-MM-DD` |
| `display_order` | OPTIONAL — integer |
| `visibility_status` | REQUIRED — `public` or `hidden` |

## Services

| Column | Requirement |
|---|---|
| `id` | REQUIRED |
| `slug` | REQUIRED |
| `title_en` | REQUIRED |
| `title_ar` | REQUIRED |
| `description_en` | REQUIRED |
| `description_ar` | REQUIRED |
| `features_en` | OPTIONAL — pipe-separated list (`Feature 1\|Feature 2`) |
| `features_ar` | OPTIONAL — pipe-separated list |
| `price_info` | OPTIONAL — JSON string, e.g. `{"type":"upon_request"}` |
| `cover_media_id` | OPTIONAL — Media id |
| `display_order` | OPTIONAL — integer |
| `visibility_status` | REQUIRED — `public` or `hidden` |

## News (Journal)

| Column | Requirement |
|---|---|
| `id` | REQUIRED |
| `slug` | REQUIRED |
| `title_en` | REQUIRED |
| `title_ar` | REQUIRED |
| `content_en` | REQUIRED |
| `content_ar` | REQUIRED |
| `excerpt_en` | REQUIRED |
| `excerpt_ar` | REQUIRED |
| `category` | REQUIRED — e.g. `announcement` |
| `publish_date` | REQUIRED — `YYYY-MM-DD` |
| `image_id` | OPTIONAL — Media id |
| `display_order` | OPTIONAL — integer |
| `visibility_status` | REQUIRED — `public` or `hidden` |

---

## Validation behaviour

- A row missing a REQUIRED field is skipped and reported:
  `Artists row 17: name_en is required.`
- A slug that already exists in the database is reported:
  `Artists row 17: Column slug, Value "x", Error: slug already exists on record y. Expected: a unique URL-safe slug.`
- A duplicate slug within the same file is reported:
  `Artists row 18: duplicate slug x appears in the import file.`
- Valid rows are still imported even if other rows fail — no silent
  whole-file failure.
- Media and relational references are checked before write; missing
  references are reported per row.

## Source of truth

The field definitions in this document are generated from
`src/lib/cms/bulk-import-export.ts` (`bulkModules`), which is the exact
schema the importer and exporter share. If a field is not listed above, the
importer does not accept it.
