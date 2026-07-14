# TEX7 SystemConfiguration Specification v1.0

## Status

DATABASE FOUNDATION — PHASE 6

Specification sprint only.

This document fully specifies the approved SystemConfiguration platform core model before any Prisma implementation begins. It does not introduce Prisma models, SQL, migrations, repositories, runtime behavior, authentication, production writes, or implementation changes.

Approved platform model covered in this document:

- SystemConfiguration

No additional platform model is introduced.

## Decision outcome

GO WITH CONDITIONS

SystemConfiguration is approved as the governed non-secret platform and organization configuration model, subject to open architectural questions being resolved before Prisma implementation.

## 1. Purpose

SystemConfiguration stores governed, non-secret configuration values that need provider-backed persistence, tenant scoping, validation, auditability, and controlled override behavior.

Its purpose is to replace scattered or ungoverned configuration storage only when a setting has:

- a business owner
- a defined key
- a validation policy
- a scope
- a non-secret value
- a lifecycle
- a reason to be stored in the database rather than code, JSON, or environment variables

SystemConfiguration must not become a dumping ground for arbitrary metadata.

## 2. Ownership

### Platform ownership

TEX7 owns:

- SystemConfiguration model architecture
- scope strategy
- key strategy
- value typing rules
- validation policy
- inheritance policy
- secret-handling rules
- audit requirements
- index strategy
- deletion and archive policy

### Business value ownership

The operating organization owns:

- organization-specific setting values
- approved product configuration choices
- operational change reasons
- future admin-entered overrides

### Product interpretation ownership

Gallery 015 owns:

- Gallery-specific meaning of approved Gallery 015 configuration keys
- public-site behavior associated with those keys after a future runtime sprint
- CMS behavior associated with those keys after a future runtime sprint

SystemConfiguration itself remains a TEX7 platform model.

## 3. Scope

Approved conceptual scopes:

| Scope | Decision | Business reason |
|---|---|---|
| platform default | Approved conceptually | Provides baseline values shared by all organizations when no override exists |
| organization override | Approved | Allows tenant-specific configuration without creating Workspace |
| workspace override | Rejected | Workspace is not approved |
| user override | Rejected for this model | User preferences require identity model approval |
| product-record override | Rejected for this model | Product records should store their own domain fields |

Future implementation must ensure every configuration record has an explicit scope.

## 4. Global vs Organization override

Approved hierarchy:

1. Platform default
2. Organization override
3. Product-domain interpretation

A platform-default configuration defines the fallback value.

An organization override replaces the platform default for one Organization only.

Rules:

- Organization override must not affect other organizations.
- Platform default must not contain tenant-specific values.
- Product-domain interpretation must not change the underlying scope rules.
- Workspace override is not allowed.
- Runtime resolution is not implemented in this sprint.

## 5. Required fields

The following fields are specified for future Prisma design. They are not implemented in this sprint.

| Field | Type concept | Required | Business reason |
|---|---|---:|---|
| id | durable internal identifier | Yes | Stable primary reference for configuration record management |
| key | controlled configuration key | Yes | Required to identify which setting is being configured |
| scope | controlled scope enum | Yes | Required to distinguish platform default from organization override |
| valueType | controlled value type enum | Yes | Required for safe validation and parsing |
| value | typed non-secret value container | Yes | Required to store the approved configuration value |
| createdAt | timestamp | Yes | Required for auditability and provisioning history |
| updatedAt | timestamp | Yes | Required for configuration change tracking |

## 6. Conditional fields

| Field | Required condition | Business reason |
|---|---|---|
| organizationId | Required when scope is organization | Ties organization override to the tenant boundary |
| description | Optional | Gives administrative context for the configured setting |
| validationSchema | Conditional | Required only when the key uses structured values needing schema validation |
| isActive | Optional or defaulted | Allows superseding a config without hard deletion |
| archivedAt | Optional | Records retirement of obsolete overrides or deprecated keys |
| reason | Conditional | Required for high-impact configuration changes if future policy approves it |

## 7. Configuration key strategy

SystemConfiguration keys must be controlled, namespaced, and documented.

Approved key format concept:

- lower-case namespace segments
- dot-separated categories
- stable semantic names
- examples: platform.locale.default, gallery.publication.defaultStatus, gallery.media.visibilityDefault

Rules:

- every key must have an owner
- every key must have a business reason
- every key must have a value type
- every key must have validation rules
- every key must define allowed scopes
- every key must define whether override is permitted
- every key must define whether it is public, admin-only, operational, or internal
- keys must not contain organization-specific private information
- keys must not be generated dynamically by arbitrary user input

Rejected key strategy:

- arbitrary key-value storage
- broad metadata keys
- secret-bearing keys
- unbounded product settings without owner approval
- Workspace-scoped keys

## 8. Configuration value typing

Approved value type concepts:

| Value type | Use | Notes |
|---|---|---|
| string | short textual values | Must have length and allowed-content validation when possible |
| number | numeric thresholds or limits | Must define min, max, integer/decimal policy |
| boolean | feature or behavior flags | Must not replace authorization or billing entitlement logic |
| json | structured non-secret values | Must have schema validation |
| enum | controlled choices | Must define allowed values |
| url | external public URL values | Must validate URL format and safety |
| email | operational contact values | Must validate email format |
| locale | locale defaults | Must validate locale format |
| timezone | scheduling defaults | Must validate timezone identifier |

Rejected value typing:

- untyped string for every value
- raw JSON without schema
- binary blobs
- secrets
- credentials
- access tokens
- passwords
- private keys
- payment tokens
- webhook signing secrets

## 9. Secrets handling

SystemConfiguration must not store raw secrets.

Rejected values:

- API keys
- OAuth refresh tokens
- passwords
- private keys
- database credentials
- payment provider secrets
- webhook signing secrets
- storage credentials
- AI provider credentials

Allowed non-secret references may be considered later:

- secret reference name
- integration enabled flag
- provider identifier
- non-sensitive public client id if approved
- last configured timestamp
- redacted display metadata

Rules:

- secret values must remain in approved secret-management infrastructure or environment controls
- secret references must not reveal secret contents
- secret-adjacent metadata must be audited
- no implementation is approved in this sprint

## 10. Encryption policy

SystemConfiguration should not rely on encryption as a reason to store secrets.

Policy:

- non-secret values may use normal database encryption-at-rest provided by infrastructure
- sensitive values must not be stored even if encrypted
- if future requirements approve secret references, references may be stored but raw secrets must remain outside SystemConfiguration
- field-level encryption may be considered only for approved sensitive non-secret metadata, not as a bypass for secret storage rules

Business reason:

- configuration governance must prevent unsafe storage patterns rather than hiding them behind encryption.

## 11. Validation policy

Every configuration key must define validation before it can be used.

Validation requirements:

- key exists in approved registry
- scope is allowed for key
- valueType matches key definition
- value matches valueType
- value passes key-specific rules
- organizationId is present only when required by scope
- organizationId is absent for platform defaults unless a future design explicitly allows otherwise
- JSON values pass schema validation
- URL and email values pass format validation
- enum values are in the approved set
- boolean values are not used to bypass authorization or billing policy
- archived records are not treated as active overrides

No setting may be added because enterprise systems usually have configurable settings.

## 12. Audit policy

SystemConfiguration changes must be auditable in future implementation.

Required audit coverage:

- creation of configuration record
- value change
- activation or deactivation
- archive
- key deprecation
- scope change if ever allowed
- organization override creation
- organization override removal
- validation schema change if stored

Audit must capture:

- configuration id
- key
- scope
- organization id when applicable
- actor reference when identity is implemented
- previous value metadata where safe
- new value metadata where safe
- timestamp
- reason when required
- whether a change affects public behavior, admin behavior, operational behavior, or internal behavior

No AuditLog model is approved in this sprint. Audit requirements are specified only.

## 13. Versioning policy

Application-level SchemaVersion is rejected.

SystemConfiguration versioning policy:

- structural schema versioning belongs to Prisma migration history when migrations are introduced
- configuration value history belongs to future audit/change-history design
- configuration key registry versioning may be documented outside runtime data unless a future need justifies a model
- current active configuration should be resolved from active records, not from a SchemaVersion model

Allowed future concepts:

- archivedAt for retired records
- isActive for current override selection
- audit history for changes
- key deprecation documentation

Rejected concepts:

- SystemConfiguration as schema migration tracker
- application-level SchemaVersion model
- storing arbitrary version blobs without owner and lifecycle

## 14. Inheritance policy

Approved inheritance concept:

1. Resolve platform default for key.
2. If organization override exists and is active, use organization override.
3. Product domain interprets the resolved value according to approved runtime policy.

Rules:

- inheritance must be explicit
- organization override cannot inherit from another organization
- platform default cannot depend on organization state
- no Workspace level exists
- missing required platform default must be treated as a configuration error for keys that require default behavior
- runtime inheritance implementation is deferred

## 15. Delete policy

Hard delete is rejected as the default.

SystemConfiguration records should not be hard-deleted when they affect auditability, operational history, or public behavior.

Hard delete may be considered only for:

- records created in error before production use
- records with no audit impact
- approved cleanup under future data-retention policy

Business reason:

- configuration changes can alter public, administrative, operational, or security-adjacent behavior and must remain traceable.

## 16. Archive policy

Archive is the preferred retirement mechanism.

Archive policy:

- archived configuration records should not be selected during active resolution
- archivedAt should record retirement time
- key deprecation should be documented
- replacement key should be documented if applicable
- organization override archive should fall back to platform default only if inheritance policy permits it
- archive must be audited in future implementation

## 17. Index strategy

| Index | Decision | Justification |
|---|---|---|
| id primary lookup | Required | Stable configuration record identity |
| key lookup | Required | Configuration resolution and admin management depend on key lookup |
| scope + key | Required | Platform default resolution depends on finding a key at a given scope |
| organizationId + key | Required for organization overrides | Tenant override resolution requires fast organization-key lookup |
| organizationId + scope + key | Approved | Prevents ambiguous organization override resolution |
| isActive + key | Conditional | Useful only if inactive records remain in same table |
| updatedAt | Conditional | Useful for synchronization or operational review |
| archivedAt | Conditional | Useful for cleanup or archive review |

No index should be implemented without a query path or constraint requirement.

## 18. Unique constraints

| Constraint | Decision | Justification |
|---|---|---|
| id unique | Required | Primary durable identity |
| platform default key uniqueness | Required | Only one active platform default should exist per key |
| organization override key uniqueness | Required | Only one active override per organization/key should exist |
| key global uniqueness | Rejected | Same key may exist at platform default and organization override scopes |
| organizationId alone unique | Rejected | One organization may have many configuration overrides |

Conceptual uniqueness:

- one active platform-default record per key
- one active organization-override record per organization and key

If archived or inactive records remain in the same table, uniqueness must account for active-state semantics without losing history.

## 19. Field validation checklist

| Field | Business reason present | Nullable justified | Constraint justified | Index justified |
|---|---:|---:|---:|---:|
| id | Yes | Not nullable | Yes | Yes |
| key | Yes | Not nullable | Yes by scope | Yes |
| scope | Yes | Not nullable | Yes by key rules | Yes |
| organizationId | Yes | Nullable only for platform defaults | Yes for organization override uniqueness | Yes |
| valueType | Yes | Not nullable | Must match key registry | No standalone index |
| value | Yes | Not nullable for active config | Validated by valueType and key | No standalone index |
| description | Yes | Nullable | No uniqueness needed | No index |
| validationSchema | Conditional | Nullable when not needed | Must be governed | No index |
| isActive | Yes | Defaultable | Used for active uniqueness if implemented | Conditional |
| archivedAt | Yes | Nullable | Archive consistency required | Conditional |
| reason | Conditional | Nullable unless high-impact change | No uniqueness needed | No index |
| createdAt | Yes | Not nullable | Timestamp required | No standalone index unless query exists |
| updatedAt | Yes | Not nullable | Timestamp required | Conditional |

## 20. Relationship ownership

Approved relation:

| Relation | Owner | Reason |
|---|---|---|
| Organization → SystemConfiguration | TEX7 owns architecture; Organization owns override value | Organization-scoped overrides require tenant ownership |

Rejected relations:

| Relation | Decision | Reason |
|---|---|---|
| Workspace → SystemConfiguration | Rejected | Workspace is not approved |
| User → SystemConfiguration | Rejected for this model | User preferences require identity approval |
| BillingAccount → SystemConfiguration | Deferred | Billing model is not approved |
| Integration → SystemConfiguration | Deferred | Integration model is not approved |
| Product record → SystemConfiguration | Rejected | Product records should own domain-specific fields |

Every future relation must have a lifecycle owner and must not be added for generic enterprise completeness.

## 21. Open architectural questions

| Question | Status | Why it remains open |
|---|---|---|
| Exact key registry location | Open | Could be code-owned, documentation-owned, or future governed registry |
| Exact value storage representation | Open | Prisma implementation must choose typed columns, JSON, or hybrid after review |
| Active uniqueness strategy with archived records | Open | Requires implementation-specific constraint design |
| Whether reason is stored on config or only audit event | Open | Audit model is deferred |
| Whether validationSchema belongs in database or code registry | Open | Needs governance decision |
| Whether platform defaults are stored in DB or code | Open | Requires operational bootstrap policy |
| Whether organization overrides can be disabled without archive | Open | Requires admin workflow policy |
| Public vs internal key classification | Open | Requires runtime and security review |
| Secret reference metadata allowance | Open | Requires integration and secret-management policy |

## 22. Database recommendation

GO WITH CONDITIONS

SystemConfiguration may proceed to a future Prisma implementation sprint only after:

1. CTO approval of this specification.
2. Final key registry governance approval.
3. Final value storage strategy approval.
4. Final scope enum approval.
5. Final active/archive uniqueness strategy approval.
6. Final decision on validationSchema storage.
7. Final audit implementation strategy approval.
8. Confirmation that SystemConfiguration stores no raw secrets.
9. Confirmation that only Organization and SystemConfiguration are being implemented.

Do not add Prisma models, SQL, migrations, runtime changes, repositories, auth, dashboard behavior, public UI changes, JSON import, or production writes in this sprint.