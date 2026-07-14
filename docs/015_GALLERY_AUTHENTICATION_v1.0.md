# 015 Gallery Authentication v1.0

## Scope

Sprint 77 introduces production-ready administrative authentication and authorization boundaries without changing Gallery domain models, Prisma schema, repository contracts, public website routes, migrations, database push behavior, JSON import behavior, or unauthenticated production writes.

## Files

- `src/lib/auth/admin-auth-runtime.ts`
- `middleware.ts`
- `src/app/admin/login/page.tsx`
- `src/app/admin/logout/route.ts`
- `docs/015_GALLERY_AUTHENTICATION_v1.0.md`

## Authentication

Admin authentication is environment-backed and does not introduce a new database model. The runtime requires:

- `GALLERY015_ADMIN_EMAIL`
- `GALLERY015_ADMIN_PASSWORD`
- `GALLERY015_ADMIN_SESSION_SECRET`
- `GALLERY015_ADMIN_ORGANIZATION_ID`
- `GALLERY015_ADMIN_ROLE` optional, defaults to `owner`
- `GALLERY015_ADMIN_NAME` optional

Successful login creates an HMAC SHA-256 signed, HTTP-only, same-site admin session cookie scoped to `/admin`. The session has an eight-hour lifetime and uses secure cookies in production.

## Authorization

All `/admin` routes are protected by middleware except `/admin/login`. Anonymous users are redirected to `/admin/login` with a safe `next` path. Authenticated users with one of the minimum required admin roles may access admin routes:

- `owner`
- `director`
- `editor`
- `viewer`

Invalid signatures, expired sessions, inactive users, unknown roles, missing configuration, or organization mismatches deny access.

## Organization Isolation

The signed admin session includes the configured organization identifier. Middleware accepts a session only when the session organization matches `GALLERY015_ADMIN_ORGANIZATION_ID`. This preserves the existing tenant-aware repository isolation while preventing cross-organization session reuse.

## Public Routes

The middleware matcher is restricted to `/admin/:path*`, so public Gallery pages remain accessible without authentication.

## Writes

This sprint does not enable production writes outside authenticated admin. Existing JSON and Prisma write guards remain unchanged.

## Verification

Required validation commands:

```bash
npx prisma validate
npx prisma generate
npm run build
```

## Operational Notes

- Configure a high-entropy `GALLERY015_ADMIN_SESSION_SECRET` in production.
- Rotate `GALLERY015_ADMIN_PASSWORD` and `GALLERY015_ADMIN_SESSION_SECRET` through deployment secrets, not source files.
- Apply the approved Prisma migration separately through the release process; this sprint does not run migrations or `prisma db push`.