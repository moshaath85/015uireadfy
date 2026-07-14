# Gallery 015 — Production Candidate Status

This package is prepared as a production deployment candidate.

## Completed in this production preparation

- npm is the single package manager.
- Node.js 20 and npm 10 are pinned for Netlify.
- Netlify Next.js plugin is configured.
- Security and immutable asset cache headers are configured.
- Runtime pages are forced dynamic to avoid database reads during static export assumptions.
- Object-storage image host configuration is read from the environment.
- Dynamic `robots.txt` prevents indexing outside production.
- Dynamic PostgreSQL-backed sitemap is included.
- Production scripts for Prisma validation, migration deployment, type checking, and verification are included.
- Deployment and environment instructions are documented.
- Build caches, local dependencies, secrets, and generated files are excluded from release packaging.

## Verification limitation in this environment

`npm ci --ignore-scripts` passed with zero reported vulnerabilities. Full Prisma Client generation could not complete because this environment could not resolve `binaries.prisma.sh`. Therefore the final Prisma generation, TypeScript check, database migration, and Next.js build must be run on the Mac or Netlify using the documented commands.
