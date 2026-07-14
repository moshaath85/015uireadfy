# Gallery 015 — CMS & Experience Rescue

This release adds a production-oriented visual system over the existing Gallery 015 platform without changing Prisma models, repository contracts, routes, or CMS data flows.

## Included

- Rebuilt CMS shell with permanent institutional navigation and active-route state.
- New responsive CMS workspace for desktop, tablet, and mobile.
- Rebuilt administration overview with collection statistics, recent activity, and quick actions.
- Unified forms, tables, toolbars, controls, focus states, and loading treatment.
- White Cube-inspired public spacing and interaction polish.
- Shared motion tokens with restrained transitions.
- Reduced-motion accessibility support.
- Mobile fixes for public hero, index grids, details, related content, and CMS tables.
- Public header/footer hidden while operating inside the CMS.

## Files changed

- `src/components/admin/AdminShell.tsx`
- `src/components/admin/AdminHeader.tsx`
- `src/components/admin/AdminNav.tsx`
- `src/app/admin/page.tsx`
- `src/styles/globals.css`

## Validation

- `npm ci --ignore-scripts`: PASS
- `npm audit`: 0 vulnerabilities
- Source-file and CSS integrity checks: PASS
- Full TypeScript/build validation remains blocked until Prisma Client can be generated. The current environment could not resolve `binaries.prisma.sh`.
- Existing bulk-import implicit-any errors remain outside this UI rescue scope.
