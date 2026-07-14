# TEX7 Localization Governance Decision v1.0

## Decision

Sprint L1.1 introduces provider-independent localization governance contracts for the TEX7 Localization Platform Module.

This sprint is contract-only. It does not implement runtime behavior, persistence, authentication, CMS workflows, public routes, dashboard screens, Prisma models, migrations, repositories, or dependency changes.

Gallery 015 remains only the first consumer of these reusable TEX7 localization contracts.

## Scope

The governance layer defines contracts for:

- Translation ownership
- Translation permissions
- Translation review
- Translation locking
- Translation audit
- Editorial governance and publication readiness

The contracts are intentionally reusable across TEX7 products and do not reference Gallery-specific entities.

## Files Created

- `src/lib/tex7/localization/localization-governance.ts`
- `src/lib/tex7/localization/localization-permissions.ts`
- `src/lib/tex7/localization/localization-review.ts`
- `src/lib/tex7/localization/localization-locking.ts`
- `src/lib/tex7/localization/localization-audit.ts`
- `docs/TEX7_LOCALIZATION_GOVERNANCE_DECISION_v1.0.md`

The localization barrel export was updated so downstream TEX7 modules can import the approved governance contracts through the existing localization module boundary.

## Governance Contracts Summary

The governance contracts define ownership roles, actor identity, ownership transfers, ownership history, editorial readiness, review readiness, publication readiness, governance status, translation health, and governance provider boundaries.

The governance layer integrates conceptually with the approved localization completeness model by referencing completeness outcomes when describing editorial and publication readiness.

## Permission Model Summary

The permission contracts define provider-independent authorization decisions for:

- read
- edit
- review
- approve
- publish
- archive
- restore
- lock
- unlock

Permission principals are authentication-provider agnostic. The contracts do not assume a specific identity provider, session model, role backend, database table, or dashboard implementation.

Permission rules can express ownership requirements, reviewer requirements, approver requirements, publisher requirements, and lock-aware access decisions without implementing enforcement.

## Review Workflow Summary

The review contracts define a translation review lifecycle covering:

- reviewer assignment
- review requested
- review started
- review completed
- review rejected
- review approved
- review comments
- review history

The review provider boundary exposes read-only review state, history, and comment retrieval contracts only. No workflow execution, persistence, notifications, or UI behavior is implemented in this sprint.

## Locking Model Summary

The locking contracts define collaborative editing states and policy boundaries, including:

- unlocked
- locked
- expired
- locked by
- locked at
- lock expiration
- force unlock policy
- single-lock policy

The lock provider boundary exposes lock state and active-lock retrieval contracts only. No locking runtime, storage implementation, or conflict-resolution behavior is implemented.

## Audit Model Summary

The audit contracts define provider-independent audit entries for localization events including:

- created
- updated
- translated
- reviewed
- approved
- published
- archived
- restored
- owner assigned
- ownership transferred
- locked
- unlocked

Audit entries include actor information, timestamps, lifecycle status transitions, localized field changes, reasons, and correlation identifiers. No audit storage, write pipeline, event bus, or repository integration is implemented.

## Build Status

Patch 1 production build completed successfully after restoring the existing locked dependencies. Next.js reported the existing Turbopack tracing warning related to the Exhibitions JSON adapter import trace; this warning is unchanged and outside the L1.1 governance scope.

Patch 2 requires the same validation command:

```bash
npm run build
```

## Remaining Implementation Phases

Future implementation phases remain separate from this contract sprint:

1. Choose a governance persistence provider.
2. Map authentication principals to governance actors.
3. Implement permission evaluation against the selected identity provider.
4. Implement review workflow transitions.
5. Implement lock acquisition, expiration, and unlock behavior.
6. Implement audit event recording and retrieval.
7. Connect governance readiness to future CMS editorial workflows.
8. Expose governance controls through future dashboard UI after approval.

## Remaining Architectural Risks

- Permission semantics must stay independent from the eventual authentication provider.
- Lock expiration and force-unlock behavior require careful audit integration before runtime activation.
- Review workflow transitions need explicit guardrails before CMS wiring.
- Audit storage must be append-oriented and tamper-resistant in a future implementation sprint.
- Publication readiness must remain aligned with localization completeness without coupling governance contracts to Gallery-specific content types.
- Future UI implementation must not bypass provider-level governance decisions.