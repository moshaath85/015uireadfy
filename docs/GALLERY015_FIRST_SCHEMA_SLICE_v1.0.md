# Gallery 015 First Schema Slice v1.0

## Status

DATABASE FOUNDATION — PHASE 5

Architecture approval only.

This document evaluates the first real Gallery 015 product schema slice after platform core approval. It does not introduce Prisma models, SQL, migrations, JSON imports, repository behavior changes, CMS runtime changes, authentication changes, business logic changes, public UI changes, dashboard changes, production writes, or implementation work.

## Decision outcome

GO WITH CONDITIONS

The approved first Gallery 015 product slice is:

- Media
- Artist
- Collection
- Artwork

These are approved as an architecture slice only. No Prisma models are implemented in this sprint.

## 1. Product boundary

Gallery 015 product models describe art-gallery content and relationships. They do not belong to TEX7 platform core because their business meaning is specific to Gallery 015.

The first product slice should validate real gallery content behavior while depending only on the approved platform tenant boundary.

## 2. Approved first slice order

| Order | Entity | Reason |
|---:|---|---|
| 1 | Media | Foundational asset references are needed by Artist and Artwork |
| 2 | Artist | Artwork depends on artist authorship/attribution |
| 3 | Collection | Artwork may be grouped or curated by collection strategy |
| 4 | Artwork | Central domain entity that depends on Artist and may depend on Media and Collection relationships |

## 3. Tenant isolation

All first-slice records must be scoped to Organization in future implementation.

Approved conceptual isolation rule:

- Every Media, Artist, Collection, and Artwork record belongs to exactly one Organization.
- Slug uniqueness must be tenant-scoped, not globally forced across all organizations.
- Cross-organization relations are not allowed unless a future sharing model is explicitly approved.

No Tenant model is approved. Organization is the tenant boundary.

## 4. Entity decisions

### Media

#### Business purpose

Media represents gallery-owned or gallery-managed media assets, including artwork images, artist portraits, publication images, and other institutional assets.

#### Ownership

Gallery 015 owns media records and their domain meaning. TEX7 owns storage infrastructure policy and visibility architecture.

#### Tenant isolation

Media must be Organization-scoped.

#### Unique constraints

Future implementation should preserve stable source identifiers and may require tenant-scoped uniqueness for source id or canonical asset key.

#### Slug strategy

Media does not require a public slug by default.

#### Media relations

Media is the foundational relation target for Artist and Artwork. A media record may be referenced by multiple domain records only when reuse is intended and policy allows it.

#### Nullable relations

Media itself should not require an Artist or Artwork relation. It must remain reusable as a foundational asset.

#### Visibility

Media visibility requires explicit policy. Public media may be used in public pages. Private, VIP, or restricted media must not become publicly addressable without a future access-control decision.

#### Indexes

Future implementation should consider indexes for:

- organization ownership
- visibility/status
- source identifier
- asset type
- created or updated timestamp

#### Repository compatibility

The future repository adapter must preserve current JSON-backed read behavior until cutover is explicitly approved.

### Artist

#### Business purpose

Artist represents gallery artist profiles, biographies, identity metadata, and public-facing artist pages.

#### Ownership

Gallery 015 owns Artist records, editorial content, display order, biography text, slugs, and publication state.

#### Tenant isolation

Artist must be Organization-scoped.

#### Unique constraints

Artist slug should be unique per Organization.

Stable source id should remain unique per Organization during migration.

#### Slug strategy

Artist uses a routable slug. Slug changes must be treated as editorial changes with possible redirect strategy deferred to a future routing sprint.

#### Media relations

Artist may reference optional profile media. The profile media relation should be nullable because not every artist requires an image at creation time.

#### Nullable relations

Approved nullable relation:

- profile media may be null

Rejected requirement:

- Artist must not require Artwork records at creation time.

#### Visibility

Artist visibility should support draft/private/public concepts if already represented in Gallery 015 domain rules. Public pages must only expose public artist records.

#### Indexes

Future implementation should consider indexes for:

- organization + slug
- organization + status/visibility
- organization + display ordering
- source identifier

#### Repository compatibility

Artist repository behavior must remain compatible with existing public and admin read patterns until a separate repository migration sprint approves provider switching.

### Collection

#### Business purpose

Collection represents curated groupings of artworks or gallery content.

#### Ownership

Gallery 015 owns collection names, descriptions, slugs, ordering, visibility, and curation meaning.

#### Tenant isolation

Collection must be Organization-scoped.

#### Unique constraints

Collection slug should be unique per Organization.

Stable source id should remain unique per Organization during migration.

#### Slug strategy

Collection may use a routable slug if exposed publicly or administratively. Slug uniqueness remains tenant-scoped.

#### Media relations

Collection may later require cover media, but the first implementation should not force this unless current JSON data proves it is required.

#### Nullable relations

Approved nullable relation:

- cover media may be null if introduced later

Collection membership strategy remains open if many-to-many artwork membership is required.

#### Visibility

Collection visibility must prevent draft/private collections from being exposed publicly.

#### Indexes

Future implementation should consider indexes for:

- organization + slug
- organization + visibility/status
- organization + display ordering
- source identifier

#### Repository compatibility

Collection repository migration must preserve existing create/edit/read behavior and current guarded JSON semantics until cutover is approved.

### Artwork

#### Business purpose

Artwork represents the central gallery object, including title, attribution, year/date metadata, medium, dimensions, description, publication state, and public artwork pages.

#### Ownership

Gallery 015 owns Artwork records, editorial metadata, status, media assignment, artist attribution, and collection relationships.

#### Tenant isolation

Artwork must be Organization-scoped.

#### Unique constraints

Artwork slug should be unique per Organization when slugs are present.

Stable source id should remain unique per Organization during migration.

#### Slug strategy

Artwork uses a routable slug where public artwork pages exist. Slug changes should be handled as editorial changes; redirect behavior is deferred.

#### Media relations

Artwork may reference:

- primary media
- additional gallery media in a later relation strategy

Primary media should be nullable only if current creation workflows allow artwork drafts without media. Public visibility should require a valid public primary media policy if the public page depends on imagery.

#### Nullable relations

Approved nullable relations for future schema design:

- primary media may be null for drafts
- collection relation may be nullable if artwork can exist outside collections
- artist relation policy requires further validation: if every artwork must have one artist, keep required; if group/unknown attribution is supported, allow nullable or attribution alternative

#### Visibility

Artwork visibility must prevent draft/private artwork from being exposed publicly. Media visibility must be compatible with artwork visibility.

#### Indexes

Future implementation should consider indexes for:

- organization + slug
- organization + status/visibility
- organization + artist reference
- organization + collection reference if direct collection relation is approved
- organization + created or updated timestamp
- source identifier

#### Repository compatibility

Artwork repository behavior is already central to public and admin pages. Future implementation must preserve current read routes, edit routes, and guarded write behavior until a separate repository migration sprint approves provider switching.

## 5. Relationship decisions

### Approved conceptual relations

| Relation | Decision |
|---|---|
| Organization → Media | Approved as tenant ownership |
| Organization → Artist | Approved as tenant ownership |
| Organization → Collection | Approved as tenant ownership |
| Organization → Artwork | Approved as tenant ownership |
| Artist → Media | Approved as optional profile media |
| Artwork → Media | Approved as primary media, nullable for drafts if policy allows |
| Artwork → Artist | Approved, but required vs nullable requires final attribution policy |
| Artwork → Collection | Open; direct nullable relation or junction strategy requires validation |

### Rejected relationship assumptions

| Proposal | Decision | Rationale |
|---|---|---|
| Global slugs | Rejected | Multi-organization operation requires tenant-scoped uniqueness |
| Required media for every record | Rejected | Draft workflows and existing content may require nullable media |
| Workspace ownership | Rejected | Workspace is not approved |
| Cross-organization product relations | Rejected | No sharing model is approved |
| Immediate many-to-many collection membership | Deferred | Needs validation against current and planned Gallery 015 curation behavior |

## 6. Unique constraint strategy

Future implementation should prefer tenant-scoped uniqueness:

- Organization + Artist slug
- Organization + Collection slug
- Organization + Artwork slug
- Organization + source id where source ids are preserved

Media unique strategy should be based on source id or asset key rather than public slug.

## 7. Visibility strategy

Visibility must be explicit for public-facing records and media.

Minimum approved concept:

- draft or private records are not public
- public records may appear on public routes
- private/restricted media must not be exposed through public pages
- visibility rules must be enforced in repositories before production cutover

No runtime changes are implemented in this sprint.

## 8. Future repository compatibility

The first schema slice must not force immediate repository migration. A future repository sprint must provide:

- JSON/provider parity checks
- source id preservation or deterministic id mapping
- route compatibility
- create/update behavior compatibility
- rollback plan
- no production write enablement until auth and authorization are approved

## 9. Open decisions

| Decision | Status | Reason |
|---|---|---|
| Artwork-to-Collection shape | Open | Direct relation vs junction requires curation requirements |
| Artwork artist attribution requirement | Open | Unknown, group, estate, or institutional attribution policy may affect nullability |
| Media private/VIP policy | Open | Requires access-control and storage policy approval |
| Redirect strategy for slug changes | Open | Routing behavior is outside this sprint |
| Publication status enum names | Open | Must match current JSON and future CMS policy |
| Deletion vs archive policy | Open | Needs operational governance |
| AuditLog model | Open | Audit requirements exist, but model approval is deferred |

## 10. Database recommendation

GO WITH CONDITIONS

Recommended future sequence:

1. CTO approves the platform core decision first.
2. Future schema sprint implements only Organization and SystemConfiguration if authorized.
3. Future product schema sprint implements Media, Artist, Collection, and Artwork only after resolving open decisions that affect constraints.
4. Do not add Prisma models during this architecture sprint.
5. Do not run migrations, db push, JSON import, runtime changes, repository changes, auth changes, dashboard changes, public UI changes, or production writes.
6. Treat unresolved relationship and visibility policies as blockers before production cutover.