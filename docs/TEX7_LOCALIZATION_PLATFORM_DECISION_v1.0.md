# TEX7 Localization Platform Decision v1.0

## Status

Approved foundation contract sprint.

## Scope

This decision establishes localization as a reusable TEX7 Platform module. The sprint creates provider-independent TypeScript contracts only. It does not introduce database tables, Prisma models, migrations, repository binding, route changes, React UI, dashboard UI, public UI, authentication changes, runtime changes, production writes, dependency changes, or Gallery-specific localization infrastructure.

## Approved Model

TEX7 localization separates language-independent entity identity from localized translation records.

Language-independent ownership remains attached to the base entity:

- Entity identity
- Relationships
- Permissions
- Audit history
- Certificates
- Base media file ownership

Each translation owns its localized fields independently:

- Localized content
- Localized slug
- Lifecycle status
- Publishing status
- SEO metadata
- Media captions, alt text, accessibility text, descriptions, and SEO captions

Duplicate entities per language are prohibited. Editors create one base entity, then maintain independent translations for enabled locales.

## Locale Foundation

The default first-consumer configuration prepares Arabic and English:

- Arabic: `ar`, right-to-left, enabled, default locale
- English: `en`, left-to-right, enabled

Public fallback is disabled so public pages can remain strictly monolingual.

## Translation Lifecycle

The reusable lifecycle states are:

- Missing
- Draft
- In Review
- Published
- Archived

Lifecycle is translation-specific. One locale may be published while another remains draft, in review, missing, or archived.

## Completeness Model

Completeness is automatically calculated from configurable weighted rules. The model supports required and optional checks for:

- Title
- Slug
- Summary
- Full content
- SEO
- Media metadata
- Alt text
- Captions
- Required relationships
- Custom fields

The computed result returns percentage, completed weight, total weight, missing fields, missing required fields, per-rule results, publish readiness, and a publish-blocking reason. Completeness is never manually entered.

## Routing and Slug Model

Localized slugs belong to translations. Slug uniqueness is scoped by locale and entity type. Equivalent-page and language-switch resolution must target the same base entity in another locale and report whether the target is resolved, missing, unpublished, missing a slug, or unavailable.

The contracts do not create routes or alter the current public routing behavior.

## SEO Model

Localized SEO metadata supports localized title, meta description, Open Graph text, canonical URL, hreflang alternates, structured-data text fields, and social-preview metadata. SEO is translation-owned and independent per locale.

## Media Localization Model

Media files belong to the base entity. Localized media metadata belongs to a translation and may include caption, alt text, description, accessibility text, and SEO caption. Localized media metadata never changes base media ownership.

## Remaining Implementation Phases

1. Bind the contracts to a storage provider after database schema approval.
2. Add migration planning for translation records and localized slug indexes.
3. Add CMS translation editing flows in the unified CMS.
4. Add repository read models for locale-aware public content.
5. Add public monolingual routes and language-switch resolution.
6. Add health dashboards for missing translations, review queues, publish readiness, and completeness by locale.

## Remaining Risks

- Public routing must not be enabled until equivalent translation resolution is backed by approved storage.
- Slug uniqueness must be enforced by the future provider, not only by TypeScript contracts.
- Completeness rules need per-entity configuration before CMS enforcement.
- Strict monolingual public pages require content audits before launch.