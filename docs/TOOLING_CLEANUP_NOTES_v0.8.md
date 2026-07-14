# Gallery 015 — Tooling Cleanup Notes v0.8

Sprint: 63.1  
Scope: Engineering corrections documentation  
Date: 2026-07-09  
Change policy: Documentation only for tooling; no dependency, lockfile, framework, or lint configuration changes.

## Summary

The Sprint 63 audit identified two tooling cleanup items that should remain documented until an approved maintenance or quality sprint addresses them:

1. Both npm and pnpm lockfiles are present.
2. `npm run lint` maps to `next lint`, but no non-interactive ESLint configuration is present.

No tooling files were changed in Sprint 63.1. This preserves the submitted foundation and avoids dependency churn outside an approved tooling maintenance patch.

## Package Manager Status

Current repository state:

- `package.json` is present.
- `package-lock.json` is present.
- `pnpm-lock.yaml` is present.

Risk:

- Multiple lockfiles can create package-manager ambiguity across local, CI, and deployment environments.

Current decision:

- Keep both lockfiles unchanged in this sprint.
- Do not remove either lockfile without an explicit maintenance approval.
- Continue using the existing installed dependency state for validation commands.

Recommended future maintenance patch:

1. Choose the official package manager.
2. Document the package-manager decision in the project README or release notes.
3. Remove or freeze the non-authoritative lockfile only after approval.
4. Re-run dependency installation and production build validation.

## Lint Configuration Status

Current repository state:

- `package.json` defines `"lint": "next lint"`.
- No dedicated non-interactive ESLint configuration was found during the Sprint 63 audit.
- Standalone lint execution may become interactive or unsuitable as an automated quality gate.

Risk:

- Lint cannot yet be treated as a stable CI gate.
- Current validation should rely on production build, TypeScript validation, JSON validation, route/import checks, and targeted static scans.

Current decision:

- Do not add ESLint configuration in Sprint 63.1.
- Keep lint tooling documented as technical debt until an approved quality sprint.

Recommended future quality patch:

1. Add a non-interactive ESLint configuration aligned with Next.js 14 and TypeScript.
2. Confirm `npm run lint` exits deterministically in CI.
3. Re-run production build and TypeScript validation after lint configuration is introduced.
4. Update the technical debt register status for the lint finding.

## Sprint 63.1 Status

Tooling cleanup is documented only. No source, dependency, lockfile, or configuration changes were made for this item.
