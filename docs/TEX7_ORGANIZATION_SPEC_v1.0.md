# TEX7 Organization Specification v1.0

## Status

DATABASE FOUNDATION — PHASE 6

Specification sprint only.

This document fully specifies the approved Organization platform core model before any Prisma implementation begins. It does not introduce Prisma models, SQL, migrations, repositories, runtime behavior, authentication, production writes, or implementation changes.

Approved platform model covered in this document:

- Organization

No additional platform model is introduced.

## Decision outcome

GO WITH CONDITIONS

Organization is approved as the TEX7 tenant boundary and minimum platform ownership root, subject to the open architectural questions listed in this document being resolved before Prisma implementation.

## 1. Business purpose

Organization represents the operating account, institution, gallery, client, or business entity that owns platform data.

Its business purpose is to provide a single readable ownership boundary for:

- tenant isolation
- gallery or client account identity
- future staff membership
- future billing alignment
- future API ownership
- future AI usage ownership
- future integration ownership
- tenant-scoped configuration
- tenant-scoped Gallery 015 product records

Organization exists because TEX7 needs one durable business entity that can own reusable platform state and product-domain data without introducing a separate Tenant abstraction.

## 2. Ownership

### Platform ownership

TEX7 owns:

- Organization model architecture
- tenant boundary semantics
- isolation rules
- platform field definitions
- lifecycle requirements
- uniqueness and indexing policy
- archive and delete policy
- future relationship boundaries

### Business ownership

The operating client owns:

- organization display name
- public or administrative naming choices
- operating status
- future billing account values
- future membership assignments
- future integration enablement
- future product data under the organization

### Relation ownership

Organization owns future tenant-scoped platform and product records.

Any future record related to Organization must document whether Organization is:

- the data owner
- the billing owner
- the configuration owner
- the access-control owner
- only a reporting or attribution reference

A relation must not be added only because enterprise systems usually relate everything to an account.

## 3. Lifecycle

### Creation

An Organization is created when a new operating account or gallery tenant is provisioned.

Business reason:

- TEX7 needs a tenant root before provider-backed data can be safely isolated.

Creation must not imply:

- billing activation
- user membership creation
- public site publication
- API access activation
- production write enablement

Those concerns require separate future approvals.

### Active operation

An active Organization may own:

- configuration overrides
- future staff memberships
- future Gallery 015 records
- future API credentials or API ownership references
- future AI usage records
- future integration references

### Suspension

An Organization may be suspended when access should be temporarily disabled without deleting owned data.

Business reason:

- operational or billing issues may require temporary access restrictions while preserving auditability and rollback.

### Archive

An Organization may be archived when it is no longer operational but must remain retained for historical integrity, audit, billing reconciliation, or content provenance.

### Deletion

Hard deletion is not approved by default.

Organization deletion requires a future approved data-retention and cascade policy because Organization is the tenant root for product records, configuration, audit history, billing history, and future identity relationships.

## 4. Tenant boundary

Organization is the tenant boundary.

Approved rule:

- every tenant-scoped platform or Gallery 015 product record must belong to exactly one Organization unless a future shared-data model is explicitly approved.

Rejected rule:

- no separate Tenant model
- no Workspace model
- no cross-organization product relations by default
- no global product slugs when tenant-scoped uniqueness is sufficient

Business reason:

- Gallery 015 and future TEX7 products need clean data isolation without adding an extra Tenant abstraction that has no independent lifecycle.

## 5. Required fields

The following fields are specified for future Prisma design. They are not implemented in this sprint.

| Field | Type concept | Required | Business reason |
|---|---|---:|---|
| id | durable internal identifier | Yes | Stable primary reference for tenant-scoped records and future relations |
| name | human-readable organization name | Yes | Administrators, support, billing, and future identity workflows need a readable account label |
| slug | tenant/account slug | Yes | Provides stable readable organization addressing for administration, future URLs, support workflows, and tenant-scoped references |
| status | controlled lifecycle status | Yes | Required to distinguish active, suspended, and archived organizations without deleting data |
| createdAt | timestamp | Yes | Required for auditability, provisioning history, and operational reporting |
| updatedAt | timestamp | Yes | Required to track account metadata changes and support synchronization policies |

No required field is included only for generic enterprise completeness.

## 6. Optional fields

The following optional fields are approved for specification but require final implementation review before Prisma model creation.

| Field | Type concept | Optional reason | Business reason |
|---|---|---|---|
| legalName | text | Not every operating account requires legal-name capture at provisioning | Supports future billing, contracts, invoices, and compliance without forcing incomplete values |
| description | text | Many organizations do not need an internal description | Supports internal support and administrative context |
| websiteUrl | URL text | Some organizations may not have or disclose a website | Supports account identification and future public/admin references |
| contactEmail | email text | Contact ownership may later belong to identity or billing models | Supports operational contact before dedicated billing or membership models are approved |
| locale | locale code | Default can be inherited | Supports future formatting, localization, and content defaults |
| timezone | timezone identifier | Default can be inherited | Supports future scheduling, publishing, billing windows, and audit display |
| archivedAt | timestamp | Null while not archived | Records archive transition without deleting data |
| suspendedAt | timestamp | Null while not suspended | Records suspension transition without deleting data |
| metadata | constrained JSON object | Not required for core operation; must remain governed | Allows limited non-secret operational annotations only if validation policy is approved |

## 7. Nullable fields

Every nullable field must have a business justification.

| Field | Nullable | Justification |
|---|---:|---|
| legalName | Yes | Legal billing identity may be unknown before billing is approved |
| description | Yes | Internal notes are not required for tenant isolation |
| websiteUrl | Yes | Some clients may not have an approved website URL |
| contactEmail | Yes | Future identity or billing models may become the authoritative contact source |
| locale | Yes | Platform default may apply |
| timezone | Yes | Platform default may apply |
| archivedAt | Yes | Only populated after archive |
| suspendedAt | Yes | Only populated after suspension |
| metadata | Yes | Optional governed annotations should not be mandatory |

Non-null tenant identity is carried by id, name, slug, status, createdAt, and updatedAt.

## 8. Default values

| Field | Default | Business reason |
|---|---|---|
| status | active at creation unless provisioning policy sets otherwise | Newly provisioned organizations normally enter active setup state |
| createdAt | creation timestamp | Required audit baseline |
| updatedAt | creation timestamp, then update timestamp | Required change tracking |
| locale | platform default if unset | Avoids forcing locale decisions during provisioning |
| timezone | platform default if unset | Avoids forcing timezone decisions during provisioning |

No default should silently grant billing, API, AI, integration, or production-write privileges.

## 9. Unique constraints

| Constraint | Decision | Justification |
|---|---|---|
| id unique | Required | Primary durable identity |
| slug unique | Required for Organization | Organization is the tenant root; duplicate organization slugs would create administrative ambiguity |
| contactEmail unique | Not approved | One email may represent multiple organizations, agencies, galleries, or billing contacts |
| name unique | Not approved | Multiple organizations may share legal or display names |

Organization slug uniqueness is platform-wide because Organization itself is the tenant namespace root.

Product-domain slugs must remain organization-scoped in future product models.

## 10. Indexes

| Index | Decision | Justification |
|---|---|---|
| id primary lookup | Required | All relations and administrative lookups depend on stable identity |
| slug lookup | Required | Administration, support, and future routing may resolve by organization slug |
| status index | Approved | Operational dashboards and access gates may filter active, suspended, and archived organizations |
| createdAt index | Approved with conditions | Useful for provisioning reports and operational ordering; may be deferred if not queried |
| updatedAt index | Approved with conditions | Useful for synchronization or operational review; may be deferred if not queried |
| contactEmail index | Deferred | Only justified if support or search workflows require it |
| legalName index | Deferred | Only justified if billing or compliance workflows require it |

Every implemented index must correspond to a known query path. Indexes must not be added only because similar systems commonly have them.

## 11. Audit requirements

Organization changes must be auditable in future implementation.

Required audit coverage:

- creation
- name change
- slug change
- status change
- suspension
- reactivation
- archive
- contact metadata changes
- billing relationship changes when billing is approved
- integration ownership changes when integrations are approved

Audit must capture:

- organization id
- changed field or event type
- actor reference when identity is implemented
- previous value metadata where safe
- new value metadata where safe
- timestamp
- reason when the operation is high impact

No AuditLog model is approved in this sprint. Audit requirements are specified only.

## 12. Delete policy

Hard delete is rejected as the default.

Organization hard delete may be considered only after a future sprint defines:

- cascade ownership
- retained audit policy
- billing history policy
- identity relationship policy
- media retention policy
- Gallery 015 product data retention policy
- backup and restore implications
- legal or contractual deletion requirements

Until then, archive or suspension must be used.

## 13. Archive policy

Archive is the preferred non-operational lifecycle endpoint.

Archive policy:

- archived organizations should remain queryable for administrative and audit purposes
- archived organizations should not accept normal production writes unless a restoration policy permits it
- archived organizations should not appear in active tenant selectors by default
- archivedAt must be populated when status becomes archived
- reactivation from archived state requires explicit future governance

Business reason:

- tenant-root deletion risks breaking product records and historical accountability.

## 14. Isolation rules

Required future implementation rules:

- Organization is the root isolation key.
- Product models must include organization ownership.
- Tenant-scoped uniqueness must use organization ownership.
- Repository queries must filter by organization before production cutover.
- Cross-organization joins are not allowed unless a future sharing model is approved.
- Configuration overrides must be resolved within Organization scope unless a platform default is explicitly used.
- Media visibility must not bypass Organization ownership.
- Future API credentials must resolve to exactly one Organization unless a future federation policy exists.

## 15. Future identity relationship

Identity is outside this sprint.

Future relationship:

- Organization will be the ownership and access boundary for users, members, roles, or invitations if an identity model is approved later.

Rules:

- do not add membership fields directly to Organization in the first model
- do not embed user lists in Organization metadata
- do not create custom authentication in Organization
- do not infer role semantics from Organization status alone

Business reason:

- authentication and authorization require separate ownership, lifecycle, and security approval.

## 16. Future billing relationship

Billing is outside this sprint.

Future relationship:

- Organization is the expected billing/account boundary.

Rules:

- do not add subscription fields directly unless a billing sprint approves them
- do not store payment secrets or payment provider tokens in Organization
- do not infer access entitlement solely from status unless billing policy is approved

Business reason:

- billing has provider, entitlement, invoice, tax, and lifecycle responsibilities that require a separate model or integration decision.

## 17. Future API relationship

API access is outside this sprint.

Future relationship:

- API keys, clients, quotas, or service accounts should belong to Organization if approved later.

Rules:

- Organization may own API access records
- raw API secrets must not be stored on Organization
- usage and rate limits require separate policy

Business reason:

- API access is tenant-scoped but has independent credential and security lifecycle.

## 18. Future AI relationship

AI usage is outside this sprint.

Future relationship:

- AI usage limits, model access policy, or generated asset ownership may be scoped to Organization if approved later.

Rules:

- do not add AI quota fields directly to Organization now
- do not store prompts, model outputs, or billing usage directly on Organization without a future data model
- AI configuration should use SystemConfiguration only for non-secret governed settings when approved

Business reason:

- AI policy has privacy, billing, usage, and moderation implications that need separate approval.

## 19. Future integration relationship

Integrations are outside this sprint.

Future relationship:

- third-party integrations may be owned by Organization in a future integration model.

Rules:

- do not store integration secrets in Organization
- do not use Organization metadata as an unstructured integration registry
- integration enablement must have an owner, lifecycle, audit policy, and secret-handling policy

Business reason:

- integrations have credentials, webhooks, scopes, refresh tokens, and operational status that require governed models.

## 20. Validation rules

Future validation rules:

- name must be present and trimmed
- name must meet a defined length range
- slug must be present, normalized, and unique
- slug must use approved characters only
- status must be one of the approved lifecycle statuses
- websiteUrl must be a valid URL when present
- contactEmail must be a valid email when present
- locale must match an approved locale format when present
- timezone must match an approved timezone identifier when present
- archivedAt may be present only when status is archived
- suspendedAt may be present only when status is suspended or when historical suspension tracking is explicitly supported
- metadata must be non-secret and schema-governed if allowed

Rejected validation approach:

- do not allow arbitrary enterprise metadata without a business owner and validation policy.

## 21. Slug policy

Organization slug policy:

- required
- platform-wide unique
- lowercase
- stable after creation
- generated from name only at provisioning time if not manually supplied
- must not contain private information
- must not be reused after archive until reuse policy is approved
- changes must be audited
- slug redirect behavior is deferred to future routing policy if slugs are ever public-facing

Business reason:

- slug supports readable tenant identification and future administrative addressing while avoiding ambiguous tenant roots.

## 22. Naming policy

Organization name policy:

- required
- human-readable
- may contain capitalization and punctuation appropriate to the official operating name
- does not need to be unique
- should not encode status, plan, environment, or billing state
- changes must be audited

Business reason:

- name is for human recognition, not technical uniqueness.

## 23. Field validation checklist

| Field | Business reason present | Nullable justified | Constraint justified | Index justified |
|---|---:|---:|---:|---:|
| id | Yes | Not nullable | Yes | Yes |
| name | Yes | Not nullable | Name uniqueness rejected | Search index deferred |
| slug | Yes | Not nullable | Yes | Yes |
| status | Yes | Not nullable | Controlled values required | Yes |
| legalName | Yes | Yes | Uniqueness rejected | Deferred |
| description | Yes | Yes | No uniqueness needed | No index approved |
| websiteUrl | Yes | Yes | No uniqueness needed | No index approved |
| contactEmail | Yes | Yes | Uniqueness rejected | Deferred |
| locale | Yes | Yes | Format validation required | No index approved |
| timezone | Yes | Yes | Format validation required | No index approved |
| archivedAt | Yes | Yes | Status consistency required | Deferred |
| suspendedAt | Yes | Yes | Status consistency required | Deferred |
| metadata | Conditional | Yes | Schema governance required | No index approved |
| createdAt | Yes | Not nullable | Timestamp required | Conditional |
| updatedAt | Yes | Not nullable | Timestamp required | Conditional |

## 24. Open architectural questions

| Question | Status | Why it remains open |
|---|---|---|
| Final status enum names | Open | Must align with future admin and access policy |
| Whether legalName belongs in Organization or future BillingAccount | Open | Billing model is not approved |
| Whether contactEmail belongs in Organization, Membership, or BillingAccount | Open | Identity and billing models are not approved |
| Metadata allowance | Open | Requires strict validation policy to avoid becoming PlatformMetadata |
| Slug reuse after archive | Open | Requires governance and routing policy |
| Organization restoration workflow | Open | Requires operational approval |
| Audit implementation model | Open | Audit is required conceptually, but no AuditLog model is approved |
| Default locale/timezone source | Open | Must align with SystemConfiguration default strategy |

## 25. Database recommendation

GO WITH CONDITIONS

Organization may proceed to a future Prisma implementation sprint only after:

1. CTO approval of this specification.
2. Final field list approval.
3. Final status enum approval.
4. Decision on legalName and contactEmail ownership.
5. Decision on metadata allowance or rejection.
6. Audit implementation strategy approval.
7. Confirmation that only Organization and SystemConfiguration are being implemented.

Do not add Prisma models, SQL, migrations, runtime changes, repositories, auth, dashboard behavior, public UI changes, JSON import, or production writes in this sprint.