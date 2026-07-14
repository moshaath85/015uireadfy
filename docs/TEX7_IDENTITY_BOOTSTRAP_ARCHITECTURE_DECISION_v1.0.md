# TEX7 Identity Bootstrap Architecture Decision v1.0

## 1. Sprint Scope

This document records the TEX7 Identity Sprint I0 architecture decision for replacing the temporary Gallery 015 environment-variable admin login with a database-backed, multi-tenant identity platform.

Sprint I0 is documentation and architecture decision work only.

No authentication implementation, Prisma schema change, migration, repository change, route change, middleware change, UI change, dependency change, runtime change, environment-variable removal, dependency installation, or build execution is approved in this sprint.

## 2. Tenant Boundary Recommendation

### Decision

TEX7 should use **Organization as the tenant boundary** for the first identity architecture.

A separate `Tenant` model should not be introduced in the first implementation sequence.

`Workspace` should not be introduced.

### Reason

Organization already matches the approved platform boundary and the immediate TEX7/Gallery 015 product requirement:

- Gallery 015 belongs to an Organization.
- Users belong to Organizations through memberships.
- Roles are scoped to Organizations.
- Gallery content and future TEX7 product access can be isolated by Organization.
- A separate Tenant model would duplicate the Organization boundary without an approved operational requirement.
- Workspace would add hierarchy and permission complexity without a confirmed business need.

### Implication

Every identity and authorization decision must be evaluated inside an Organization boundary unless explicitly marked as platform-level runtime configuration.

## 3. Core Identity Model Recommendation

Only models with immediate approved purpose are included.

### 3.1 Organization

Purpose:

- Tenant boundary.
- Owns users through memberships.
- Owns Gallery 015 product data and future TEX7 product access.

Minimum future schema fields:

- `id`
- `name`
- `slug`
- `status`
- `createdAt`
- `updatedAt`

### 3.2 User

Purpose:

- Represents a human identity.
- Stores normalized email and secure password hash.
- Does not store deployment-environment credentials.

Minimum future schema fields:

- `id`
- `email`
- `emailNormalized`
- `passwordHash`
- `status`
- `createdAt`
- `updatedAt`
- `lastLoginAt`

### 3.3 OrganizationMembership

Purpose:

- Connects a User to an Organization.
- Stores organization-scoped activation state.
- Supports one user belonging to multiple organizations later without redefining identity.

Minimum future schema fields:

- `id`
- `organizationId`
- `userId`
- `roleId`
- `status`
- `createdAt`
- `updatedAt`

### 3.4 Role

Purpose:

- Organization-scoped authorization label.
- Supports the approved first roles: Owner, Admin, Editor, Curator, Translator, Viewer.

Minimum future schema fields:

- `id`
- `organizationId`
- `key`
- `name`
- `description`
- `isSystemRole`
- `createdAt`
- `updatedAt`

### 3.5 Permission

Purpose:

- Defines the future permission contract.
- Enables later movement from role checks to permission checks.

Minimum future schema fields:

- `id`
- `key`
- `description`
- `createdAt`
- `updatedAt`

### 3.6 RolePermission

Purpose:

- Maps roles to permissions.
- Enables future granular permissions without changing role assignment structure.

Minimum future schema fields:

- `id`
- `roleId`
- `permissionId`
- `createdAt`

### 3.7 Session

Purpose:

- Stores server-side session state.
- Enables logout, expiration, rotation, and revocation.

Minimum future schema fields:

- `id`
- `userId`
- `organizationId`
- `membershipId`
- `tokenHash`
- `expiresAt`
- `revokedAt`
- `createdAt`
- `lastSeenAt`
- `ipAddressHash`
- `userAgentHash`

### 3.8 IdentityBootstrapState

Purpose:

- Controls one-time first owner bootstrap.
- Prevents repeated or concurrent bootstrap attempts.
- Records completion state after first Organization and Owner creation.

Minimum future schema fields:

- `id`
- `status`
- `startedAt`
- `completedAt`
- `lockedAt`
- `createdOrganizationId`
- `createdOwnerUserId`
- `createdAt`
- `updatedAt`

### 3.9 AuditEvent

Purpose:

- Records security-relevant identity events.
- Required for bootstrap completion, login failures, session revocation, user activation changes, role assignment changes, and password reset events.

Minimum future schema fields:

- `id`
- `organizationId`
- `actorUserId`
- `eventType`
- `targetType`
- `targetId`
- `metadata`
- `createdAt`

## 4. First Owner Bootstrap Decision

### Decision

TEX7 should implement a one-time First Owner Bootstrap flow after the schema and repository contracts are approved.

### Availability Rule

Bootstrap is available only when all of the following are true:

1. No Organization exists.
2. No Owner membership exists.
3. `IdentityBootstrapState` is absent or in an approved initial state.
4. A bootstrap runtime secret or deployment-gated bootstrap authorization check passes.
5. No active bootstrap lock is held by another request.

### Bootstrap Flow

1. Visitor accesses the bootstrap route.
2. System checks bootstrap availability.
3. User submits:
   - Organization name
   - Owner email
   - Owner password
   - Required confirmation fields
4. System normalizes the email.
5. System validates password policy.
6. System opens a transaction.
7. System acquires bootstrap lock.
8. System rechecks that no Organization and no Owner exist inside the transaction.
9. System creates the first Organization.
10. System creates the Owner User with a secure password hash.
11. System creates the Owner Role for the Organization.
12. System creates the Owner OrganizationMembership.
13. System marks bootstrap completed permanently.
14. System writes an audit event.
15. System creates a session.
16. System redirects to the Dashboard.

### Race-Condition Protection

Bootstrap must use a transaction and a database-enforced lock or unique singleton row so that two concurrent requests cannot create two first organizations or two first owners.

### Permanent Disablement

After success, bootstrap must be permanently disabled by persisted database state, not by a front-end condition alone.

## 5. Authentication and Session Decision

### 5.1 Email Normalization

Emails must be normalized before storage and comparison:

- Trim leading and trailing whitespace.
- Convert to lowercase.
- Validate as a syntactically valid email address.
- Store both display email and normalized email if needed.
- Enforce uniqueness on normalized email according to the approved identity boundary.

### 5.2 Password Hashing

Password hashing must use **Argon2id** unless implementation constraints force a separately approved alternative.

Reason:

- Argon2id is purpose-built for password hashing.
- It resists GPU cracking better than plain fast hashes.
- It supports memory-hard configuration.
- It is suitable for enterprise identity storage.

Minimum policy:

- Never store plain-text passwords.
- Never store reversible passwords.
- Never log submitted passwords.
- Use per-password salts through the hashing implementation.
- Store only the resulting password hash string and metadata required by the algorithm.

### 5.3 Credential Validation

Login validation must:

1. Normalize submitted email.
2. Load the active User by normalized email.
3. Confirm User status is active.
4. Confirm OrganizationMembership status is active.
5. Verify submitted password against stored password hash.
6. Apply failed-login rate limits.
7. Create a server-side Session only after all checks pass.
8. Write audit events for security-relevant outcomes.

### 5.4 Session Strategy

TEX7 should use database-backed server-side sessions.

The browser receives only an opaque session token in a secure cookie. The database stores only a hash of that token.

Cookie requirements:

- `HttpOnly`
- `Secure` in production
- `SameSite=Lax` by default
- Scoped path
- No user credentials in the cookie payload

### 5.5 Session Expiration

Initial recommendation:

- Absolute session expiration: 8 hours.
- Optional idle expiration: 2 hours.
- Session renewal or rotation may be added after the first stable implementation.

### 5.6 Logout

Logout must revoke the current session server-side and clear the session cookie.

### 5.7 Failed Login Limits

The first implementation must include rate limiting by normalized email and request source.

Rate limits must avoid disclosing whether an email exists.

### 5.8 Account Activation and Deactivation

User and OrganizationMembership status must be checked during login and route authorization.

Deactivated users or memberships cannot create new sessions.

Existing sessions for deactivated users or memberships must be revocable.

### 5.9 Password Reset Boundary

Password reset is part of the identity architecture but should not be implemented before the first secure login and session runtime exists.

No public self-registration is approved.

Password reset must eventually use expiring, single-use, hashed reset tokens and audit events.

### 5.10 Runtime Secret Requirements

Environment variables may contain runtime secrets only, never administrator email or password.

Approved runtime secret categories:

- Session signing or encryption secret if required by the chosen runtime.
- Password reset token secret if required later.
- CSRF secret if required by the chosen implementation.
- Bootstrap protection secret if used for the one-time bootstrap route.
- Database connection secret.

Disallowed as long-term identity configuration:

- Administrator email in deployment environment variables.
- Administrator password in deployment environment variables.
- Organization owner credentials in deployment environment variables.

## 6. Authorization Decision

### Decision

Roles are Organization-scoped.

TEX7 should define these first roles:

1. Owner
2. Admin
3. Editor
4. Curator
5. Translator
6. Viewer

### Role Meanings

#### Owner

- Highest organization-scoped authority.
- Can manage organization identity settings.
- Can manage users and roles.
- Can deactivate users.
- Can initiate reset access workflows.
- Cannot bypass platform-level security controls.

#### Admin

- Can manage most organization content and users.
- Cannot remove the final Owner.
- Cannot perform destructive platform-level ownership actions unless explicitly granted later.

#### Editor

- Can create and edit approved content areas.
- Cannot manage users or roles.

#### Curator

- Can manage curatorial content such as artworks, artists, collections, exhibitions, and projects according to future permissions.

#### Translator

- Can work on localization content and translation workflow according to future permissions.

#### Viewer

- Can view protected dashboard content.
- Cannot create, update, delete, publish, or manage users.

### Permission Contract

Permissions should be modeled as stable keys and mapped to roles through `RolePermission`.

First-phase behavior may use role checks while preserving the contract for later permission checks.

No speculative permission matrix is implemented in Sprint I0.

## 7. User Management Decision

Future dashboard flow:

Owner/Admin
→ Users
→ Add User
→ Assign Role
→ Activate/Deactivate
→ Reset Access

Rules:

- No public registration.
- Users are created by authorized Owner/Admin users.
- User role assignment is organization-scoped.
- Activation and deactivation must affect login and authorization.
- Reset access must use secure token-based flow when implemented.
- All user-management security events must be audited.

## 8. Temporary Admin Retirement Plan

The current Gallery 015 environment-variable admin login must remain unchanged until the database-backed replacement is validated.

Temporary values and logic to retire later:

- `GALLERY015_ADMIN_EMAIL`
- `GALLERY015_ADMIN_PASSWORD`
- `GALLERY015_ADMIN_ORGANIZATION_ID`
- Related temporary environment-backed login validation.
- Related temporary session or authorization assumptions tied to the environment-backed admin identity.

Retirement sequence:

1. Keep current temporary admin login unchanged during I0.
2. Approve identity schema in I1.
3. Add repository contracts and provider mapping in I2.
4. Build First Owner Bootstrap service in I3.
5. Build secure database-backed login and sessions in I4.
6. Enforce admin routes through database-backed sessions in I5.
7. Add user and membership management in I6.
8. Add roles and permissions in I7.
9. Run migration and parity validation.
10. Disable temporary admin login only after the database-backed path is validated.
11. Remove temporary environment credential requirements in the retirement sprint.
12. Confirm no administrator credentials remain in deployment environment variables.

No destructive removal is approved in I0.

## 9. Security Requirements

Required controls:

- Use Argon2id password hashing unless a justified alternative is formally approved.
- Do not store plain-text passwords.
- Do not store credentials in Git.
- Do not store administrator email or password in deployment environment variables as the long-term design.
- Do not log passwords or password hashes.
- Do not log secrets.
- Use secure, HttpOnly, SameSite cookies for sessions.
- Store only hashed opaque session tokens server-side.
- Support logout and session revocation.
- Enforce session expiration.
- Apply failed-login rate limiting.
- Avoid login responses that disclose whether an email exists.
- Add CSRF protection where state-changing browser requests require it.
- Audit bootstrap, login, logout, failed login, session revocation, user changes, role changes, and reset access events.
- Enforce tenant isolation through Organization-scoped memberships and authorization checks.
- Protect bootstrap from repeated and concurrent execution.
- Prevent removal or deactivation of the final Owner unless a safe ownership transfer exists.

## 10. Database Dependency and Implementation Prerequisites

Before implementation begins, all of the following must be completed:

1. Approved Organization-as-tenant decision.
2. Approved Prisma identity schema.
3. Database provider availability.
4. Migration validation plan.
5. Repository binding plan.
6. Secure production secret configuration.
7. Session storage strategy approval.
8. Bootstrap transaction and lock strategy approval.
9. Audit event schema approval.
10. Rollback plan for each implementation sprint.

## 11. Implementation Sprint Sequence

### I0 — Identity Architecture Decision

Documentation and architecture decision only.

Output:

- This decision document.

No implementation.

### I1 — Identity Schema Slice

Define the minimum Prisma schema for:

- User
- OrganizationMembership
- Role
- Permission
- RolePermission
- Session
- IdentityBootstrapState
- AuditEvent

No runtime behavior change until validated.

### I2 — Identity Repository Contracts and Provider Mapping

Define provider-neutral identity repository contracts and Prisma provider mapping.

No route or UI change.

### I3 — First Owner Bootstrap Service

Implement the transaction-safe bootstrap service.

Include bootstrap availability checks, locking, password hashing, first organization creation, first owner creation, owner role creation, membership creation, bootstrap completion state, and audit event.

### I4 — Secure Login and Session Runtime

Implement database-backed credential validation, session creation, session cookie issuance, session expiration, logout, and failed-login handling.

### I5 — Admin Route Enforcement

Switch admin route protection to database-backed sessions only after I4 is validated.

Temporary admin login remains available only as approved during transition.

### I6 — Users and Membership Management

Add dashboard user-management workflows:

Owner/Admin
→ Users
→ Add User
→ Assign Role
→ Activate/Deactivate
→ Reset Access

### I7 — Roles and Permissions

Activate permission-backed authorization checks behind the approved role contract.

### I8 — Temporary Admin Migration and Retirement

Safely retire:

- `GALLERY015_ADMIN_EMAIL`
- `GALLERY015_ADMIN_PASSWORD`
- `GALLERY015_ADMIN_ORGANIZATION_ID`
- Related temporary login logic

Only after database-backed identity is validated.

### I9 — Security and Tenant Isolation Validation

Validate:

- Tenant isolation.
- Session revocation.
- Bootstrap race-condition protection.
- Failed login handling.
- Role enforcement.
- Audit completeness.
- Absence of credentials in runtime logs and deployment environment variables.

## 12. Security Risks

Known risks to control during future implementation:

1. Bootstrap race conditions can create multiple first owners if not transaction-protected.
2. Weak password hashing can expose credentials after database compromise.
3. Environment-stored administrator credentials can leak through deployment tooling.
4. Missing tenant checks can expose one Organization's data to another.
5. Long-lived sessions without revocation can preserve access after deactivation.
6. Login error details can leak account existence.
7. Missing CSRF protection can allow unauthorized state-changing requests.
8. Logging credentials, hashes, or tokens can compromise accounts.
9. Removing temporary admin login too early can lock out administrators.
10. Keeping temporary admin login too long can preserve an insecure access path.

## 13. I0 Confirmation

This sprint performs no implementation work.

This document does not modify source code, Prisma, migrations, repositories, runtime behavior, routes, middleware, CMS behavior, dashboard UI, dependencies, deployment configuration, environment variables, or current admin authentication.