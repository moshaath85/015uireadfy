# TEX7 Development Database Activation v1.0

## Scope

Sprint 76 activates the Prisma-backed repository runtime for development only while preserving the existing JSON runtime as the default and fallback runtime.

This activation is intentionally narrow:

- Prisma can be selected only when `NODE_ENV=development`.
- Prisma must be explicitly requested with `TEX7_DATABASE_RUNTIME=prisma-development`.
- JSON remains active when Prisma is not explicitly requested.
- JSON remains active outside development.
- Prisma repository writes remain disabled.
- No migrations were executed.
- No `db push` was executed.
- No JSON import was performed.
- No public UI, admin UI, authentication, or production runtime behavior was changed.

## Runtime Selection

The runtime selector is exposed through the TEX7 database barrel exports.

Default resolution:

```ts
resolveTex7DevelopmentRuntime()
```

Resolution outcomes:

| Environment | Requested Runtime | Active Runtime | Notes |
|-------------|-------------------|----------------|-------|
| development | prisma-development | prisma-development | Prisma development runtime is active |
| development | undefined or any other value | json | JSON runtime remains active |
| production | any value | json | JSON runtime remains active |
| test or other | any value | json | JSON runtime remains active |

The selected environment variable name is exported as:

```ts
TEX7_DATABASE_RUNTIME_ENV
```

The development Prisma provider ID is exported as:

```ts
TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID
```

The JSON fallback provider ID is exported as:

```ts
TEX7_JSON_RUNTIME_PROVIDER_ID
```

## Development Provider

The development provider is exported as:

```ts
tex7PrismaDevelopmentProvider
```

Provider metadata:

- Provider ID: `prisma-development`
- Family: `postgresql`
- Product: `gallery-015`
- Provider version label: `sprint-76-development-prisma-runtime`
- Write capability: disabled
- Transaction capability: disabled for Sprint 76
- Repository scope: provider-scoped repositories only

The provider supports a read-oriented health check through Prisma using `SELECT 1` when Prisma is active. When Prisma is inactive, readiness and health report JSON fallback status instead of forcing activation.

## Prisma Repository Access

The development repository resolver is exported as:

```ts
getTex7PrismaDevelopmentRepository(repositoryKey)
```

Available repository keys when Prisma development runtime is active:

- `gallery015.media.prisma`
- `gallery015.artist.prisma`
- `gallery015.collection.prisma`
- `gallery015.artwork.prisma`

Repository keys can also be listed with:

```ts
listTex7PrismaDevelopmentRepositoryKeys()
```

When Prisma development runtime is inactive, the resolver returns `null` successfully. This preserves JSON runtime availability and avoids an implicit cutover.

## Tenant Context

The existing Prisma repositories retain their tenant requirement. Repository reads require a `tenantId` in the TEX7 repository context. Missing tenant context returns the existing tenant-context failure result.

This preserves the Gallery Core organization-as-tenant boundary.

## Write Boundary

Prisma repository writes remain disabled for Sprint 76.

The existing Prisma repository write methods still return controlled failure results for create, update, archive, and restore operations. This keeps contract compatibility without enabling database mutation.

## Validation

Sprint 76 validation completed with a non-mutating local datasource URL supplied only to Prisma CLI and build commands.

Completed checks:

```bash
DATABASE_URL="postgresql://gallery015:gallery015@localhost:5432/gallery015_dev?schema=public" pnpm exec prisma validate
DATABASE_URL="postgresql://gallery015:gallery015@localhost:5432/gallery015_dev?schema=public" pnpm exec prisma generate
DATABASE_URL="postgresql://gallery015:gallery015@localhost:5432/gallery015_dev?schema=public" pnpm run build
```

Results:

- Prisma schema validation passed.
- Prisma Client generation passed.
- Next.js production build passed.
- No migration was applied.
- No schema push was applied.
- No production write path was introduced.