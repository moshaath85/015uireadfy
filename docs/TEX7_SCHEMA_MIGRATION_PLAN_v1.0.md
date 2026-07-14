# TEX7 Schema Mapping & Migration Plan v1.0

## Status

DATABASE FOUNDATION — PHASE 3. Execution is disabled.

This document defines a provider-neutral planning layer only. It does not introduce Prisma, SQL, ORM behavior, JSON migration, CMS runtime changes, public UI changes, authentication, production writes, or new dependencies.

## Scope

The Sprint 66 schema layer maps the current Gallery 015 JSON-backed entities into reusable TEX7 schema definitions for future provider implementation. The TypeScript contracts define entities, fields, nullability, uniqueness, defaults, indexes, relations, validation rules, version metadata, and an execution-disabled migration order.

## Entity mapping summary

| Entity | Source | Migration category |
|---|---|---|
| Artist | artists | Depends on Media for optional profile media |
| Artwork | artworks | Depends on Artist and Media |
| Collection | collections | Content entity; relation cleanup required if collection membership is expanded |
| Exhibition | exhibitions | Parent for ExhibitionArtist and ExhibitionArtwork |
| ExhibitionArtist | exhibition_artists | Junction entity |
| ExhibitionArtwork | exhibition_artworks | Junction entity |
| Project | projects | Parent for ProjectArtist and ProjectArtwork |
| ProjectArtist | project_artists | Junction entity |
| ProjectArtwork | project_artworks | Junction entity |
| Service | services | Content entity |
| News | news | Content entity with publication dates |
| Publication | publications | Content entity with publication metadata |
| Media | media | Foundational media entity |
| Settings | settings | Key-value settings entity |
| Certificate | certificates | Depends on CertificateTemplate when template reference exists |
| CertificateTemplate | certificate-templates | Certificate template entity |
| Inquiry | inquiries | PII-bearing operational entity |
| Appointment | appointments | PII-bearing scheduled operational entity |
| NewsletterSubscriber | newsletter-subscribers | PII-bearing subscription entity |
| AIKnowledge | ai-knowledge | Knowledge content entity |
| AILog | ai-logs | Privacy/retention-sensitive log entity |
| AuditLog | audit_logs | System audit entity |

## Migration dependency order

1. Validate source JSON shape, ids, slugs, enum values, timestamps, and relation references.
2. Prepare future provider schema only after a separate Prisma or SQL sprint is approved.
3. Import foundational entities first: Media, Artist, Settings.
4. Import dependent content: Artwork, Collection, Exhibition, Project.
5. Import junction entities: ExhibitionArtist, ExhibitionArtwork, ProjectArtist, ProjectArtwork.
6. Import remaining content and operational entities: Service, News, Publication, CertificateTemplate, Certificate, Inquiry, Appointment, NewsletterSubscriber, AIKnowledge, AILog, AuditLog.
7. Verify relation integrity and record counts.
8. Require explicit cutover approval.
9. Require tested rollback approval.

## Validation rules before import

- Every record must have a stable unique id.
- Every routable entity must have unique slugs where slugs are present.
- Relation targets must exist before dependent records are accepted.
- Junction records must have unique source-target pairs.
- Enum values must be normalized before provider import.
- Date and datetime values must be normalized.
- PII-bearing entities must have retention, consent, and access policies approved.
- Media visibility must be finalized before private or VIP media is moved to a provider-backed system.

## Rollback and idempotency requirements

- Every migration step must be repeatable without duplicating records.
- Every imported entity must preserve source ids or maintain a deterministic source-to-target id map.
- Every batch must support verification before cutover.
- No runtime cutover is allowed until rollback has been tested against the same entity order.
- Production writes must remain disabled until authentication, authorization, repository provider implementation, and schema migration validation are complete.

## Data-cleanup blockers

- Provider schema has not been implemented or approved.
- Prisma and SQL are intentionally absent.
- Authentication and authorization are not production-ready.
- Production write policy remains disabled.
- Media private/VIP visibility policy needs final approval.
- PII retention policy is required for Inquiry, Appointment, NewsletterSubscriber, AILog, and AuditLog.
- Relation references and junction uniqueness must be revalidated immediately before any future import execution.