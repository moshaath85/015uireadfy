# TEX7 Platform Core Model Decision v1.0

## Status

DATABASE FOUNDATION — PHASE 5

Architecture decision sprint only.

This document approves the minimum TEX7 platform core data model boundary before any Prisma models are implemented. It does not introduce Prisma models, SQL, migrations, JSON imports, CMS runtime changes, repository behavior changes, authentication changes, business logic changes, public UI changes, dashboard changes, production writes, or implementation work.

## Decision outcome

GO WITH CONDITIONS

The platform core may proceed to a future schema-design sprint only after CTO approval of this document. The approved minimum platform slice is:

- Organization
- SystemConfiguration

No additional platform model is approved in this sprint.

## 1. Platform boundary decision

### Boundary summary

| Area | TEX7 ownership | Gallery 015 ownership | Decision |
|---|---|---|---|
| Infrastructure | Deployment architecture, database provider strategy, storage provider strategy, environment policy, operational boundaries | Gallery-specific deployment values and content assets | TEX7 owns reusable infrastructure patterns; Gallery 015 supplies project-specific configuration values |
| Persistence | Platform tenancy boundary, provider-neutral schema rules, migration governance, production-write policy | Gallery domain records and content lifecycle | TEX7 owns persistence foundation; Gallery 015 owns product data meaning |
| Repository | Repository interfaces, provider-switching rules, migration compatibility contracts | Gallery-specific repository modules and domain query behavior | TEX7 owns repository architecture; Gallery 015 owns domain repositories |
| Identity | Authentication integration policy, user/role boundary, authorization requirements | Gallery staff membership and role assignment policies | TEX7 owns identity architecture; Gallery 015 owns authorized users and operational access rules |
| Configuration | Platform-level configuration shape, override hierarchy, auditability, non-secret configuration storage | Gallery-specific site, CMS, feature, and content settings | TEX7 owns configuration model; Gallery 015 owns configuration values |
| Audit | Audit requirements, event integrity, actor attribution rules, retention policy requirements | Gallery operational event interpretation | TEX7 owns audit architecture; Gallery 015 owns domain event semantics |
| Media infrastructure | Storage policy, media visibility rules, private/public boundary, provider abstraction | Gallery media records, captions, artwork associations, collection usage | TEX7 owns media infrastructure; Gallery 015 owns media domain meaning |
| Product domains | None unless shared across products | Artists, artworks, collections, exhibitions, projects, services, news, publications, inquiries, appointments, certificates, AI knowledge | Gallery 015 owns all gallery product domains |

### Formal boundary approval

TEX7 owns reusable platform primitives that can support Gallery 015 and future products without embedding Gallery-specific domain assumptions.

Gallery 015 owns the art-gallery domain model, content lifecycle, editorial meaning, public route semantics, CMS behavior, and domain-specific relationships.

A model belongs to TEX7 only when it is needed to operate the platform independently of any one product domain. A model belongs to Gallery 015 when its purpose is to describe gallery content, gallery operations, gallery media relationships, gallery publishing, or gallery-specific workflows.

## 2. Organization / Tenant decision

### Approved decision

Organization is the tenant boundary.

Do not create a separate Tenant model.

### Business justification

Gallery 015 needs a clear ownership container for content, configuration, media, users, billing alignment, and future data isolation. Organization is the business-readable entity that maps naturally to a gallery, institution, client, or operating account.

A separate Tenant model would introduce a second abstraction with no independently approved business lifecycle. There is no current requirement for multiple tenant records under one organization, tenant reselling, infrastructure-level tenant partitioning separate from business ownership, or cross-organization tenant federation.

### Technical justification

Organization can provide the required tenant isolation key for future provider-backed records. Product records can reference organization ownership when schema implementation is later approved. This keeps the initial schema understandable and avoids unnecessary joins between Tenant and Organization.

### Future scalability

Organization can support future multi-organization operation. If a future product requires multiple isolation containers under one legal organization, a separate Tenant model may be reconsidered with documented lifecycle and billing rules. It is not approved now.

### Billing implications

Organization is the future billing/account boundary. Billing can be attached to Organization when payment or subscription architecture is formally approved. No billing model is approved in this sprint.

### Isolation implications

Organization is the isolation root for platform configuration and Gallery 015 domain records. Future schemas should ensure tenant-scoped unique constraints use organization ownership where appropriate.

### Rejected alternative

Tenant + Organization as separate models is rejected for this phase because the two entities do not yet have independently justified ownership, lifecycle, or operational responsibilities.

## 3. Workspace decision

### Approved decision

Workspace is rejected for this phase.

### Rationale

Workspace must not be introduced only because it is common in SaaS systems. Gallery 015 currently has no approved requirement for multiple workspaces under one organization, separate editorial environments, independent content partitions, project-level permissions, per-workspace billing, or workspace-specific schema versions.

Organization is sufficient as the current tenant boundary.

### Reconsideration trigger

Workspace may be reconsidered only if a future approved requirement needs independently isolated collaboration spaces within a single organization, with distinct permissions, configuration overrides, billing scopes, or domain partitions.

## 4. System configuration decision

### Approved model

SystemConfiguration is approved.

PlatformConfiguration and PlatformMetadata are not approved as separate models in this phase.

### Purpose

SystemConfiguration stores non-secret platform and product configuration values that must be tenant-scoped, auditable, and provider-backed in a future schema. It provides a controlled structure for settings that should not remain only in JSON or environment variables after database adoption.

### Owner

TEX7 owns the SystemConfiguration architecture, fields, auditability requirements, secret-handling rules, and override hierarchy.

Gallery 015 owns the values for Gallery-specific configuration keys.

### Scope

SystemConfiguration is scoped to Organization for tenant-level configuration.

A future implementation may also allow platform-default configuration, but only as a controlled hierarchy. No global runtime behavior is implemented in this sprint.

### Override hierarchy

Approved conceptual hierarchy:

1. Platform default
2. Organization override
3. Product-domain interpretation

No Workspace override exists because Workspace is rejected.

### Audit requirements

Configuration changes must be auditable in future implementation. Audit must capture:

- organization ownership
- configuration key
- previous value metadata where safe
- new value metadata where safe
- actor reference when identity is implemented
- timestamp
- change reason when required by operational policy

### Secret handling

SystemConfiguration must not store raw secrets.

Secrets must remain in approved secret-management infrastructure or environment-level controls. SystemConfiguration may store secret references, flags, or non-sensitive metadata only if a future sprint approves the exact handling.

### Lifecycle

SystemConfiguration records are created when an Organization requires a non-default configuration value. Records may be updated through approved administrative workflows after authorization exists. Records may be archived or superseded when configuration keys are deprecated.

### Rejected structures

| Proposal | Decision | Rationale |
|---|---|---|
| PlatformConfiguration | Rejected for this phase | Its responsibilities are covered by SystemConfiguration with platform-default hierarchy; separate model is not independently justified |
| PlatformMetadata | Rejected for this phase | Metadata is too broad and risks becoming an ungoverned key-value dumping ground |
| WorkspaceConfiguration | Rejected for this phase | Workspace itself is rejected |
| Product-specific global settings as platform core | Rejected for this phase | Gallery-specific settings belong to Gallery 015 product domain interpretation |

## 5. Schema version decision

### Approved decision

Do not create an application-level SchemaVersion model in the platform core.

### Comparison against Prisma migration history

Prisma migration history already tracks provider schema evolution once migrations are introduced. Duplicating schema version responsibility in an application table would create two sources of truth for structural database state.

### What Prisma covers

Prisma migration history covers:

- migration ordering
- applied migration tracking
- schema evolution records
- database structural history

### What Prisma does not replace

Prisma migration history does not replace:

- application release notes
- product content versioning
- imported source-data batch metadata
- future domain-level content revisions
- audit logs

Those concerns may be handled by separate approved models later if their lifecycle is justified.

### Decision

No SchemaVersion platform model is approved now.

## 6. Platform core slice approval

### Approved minimum slice

| Model | Approved | Purpose | Owner | Lifecycle |
|---|---:|---|---|---|
| Organization | Yes | Tenant, ownership, billing-alignment, isolation root | TEX7 platform architecture; business values owned by operating client | Created for each operating account; updated for account metadata; archived/deactivated under governance |
| SystemConfiguration | Yes | Tenant-scoped non-secret configuration with auditable governance | TEX7 architecture; Gallery 015 values | Created for overrides; updated through authorized admin flows; archived when superseded |

### Explicitly not approved

| Model | Decision |
|---|---|
| Tenant | Rejected for this phase |
| Workspace | Rejected for this phase |
| PlatformConfiguration | Rejected for this phase |
| PlatformMetadata | Rejected for this phase |
| SchemaVersion | Rejected for this phase |
| BillingAccount | Not approved; no billing sprint has been authorized |
| UserRole / Membership | Not approved in this sprint; identity architecture requires separate approval |
| AuditLog as platform core | Not approved in this sprint; audit requirements are documented but implementation model is deferred |
| MediaAsset as platform core | Not approved in this sprint; Gallery 015 first slice should validate domain media needs first |

## 7. Ownership and lifecycle requirements for future implementation

Any future Prisma model must document:

- owner
- business purpose
- technical purpose
- lifecycle
- tenant isolation rule
- unique constraints
- nullable relations
- audit requirements
- deletion/archive behavior
- repository compatibility
- migration and rollback expectations

No future model should be added merely because it is common in enterprise software.

## 8. Open decisions

| Decision | Status | Reason |
|---|---|---|
| Exact Organization fields | Open | Must be defined in a future schema implementation sprint |
| Exact SystemConfiguration key/value typing | Open | Requires implementation design and validation policy |
| AuditLog model shape | Open | Audit is required conceptually, but model approval is deferred |
| Identity membership model | Open | Authentication and authorization are outside this sprint |
| Billing model | Open | Billing is outside this sprint |
| Media infrastructure model | Open | Needs first Gallery 015 schema slice validation and visibility policy approval |

## 9. Database recommendation

GO WITH CONDITIONS

Proceed only to the next architecture-approved schema design step. The recommended future database direction is:

1. Keep Prisma bootstrap empty until CTO approves this decision.
2. In the next approved implementation sprint, add only Organization and SystemConfiguration first.
3. Do not add Tenant, Workspace, PlatformMetadata, PlatformConfiguration, or SchemaVersion.
4. Do not introduce Gallery 015 domain models until the first product slice is approved.
5. Do not run migrations, db push, JSON import, production writes, runtime changes, repository changes, or auth changes until explicitly authorized.