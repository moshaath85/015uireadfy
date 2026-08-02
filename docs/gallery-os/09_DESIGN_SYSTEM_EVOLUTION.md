# Gallery OS — Design System Evolution

**Version:** 1.0  
**Status:** Approved

---

## Overview

The Design System evolves from the current Gallery 015 implementation (`design-tokens.css` + `globals.css` + `site-2026.css` + `home-2026.css`) into the Gallery OS Design Language — a comprehensive token system that powers Gallery 015 today and any cultural institution tomorrow.

---

## Design System Versions

### DS v1.0 — Current (Gallery 015 production baseline)

**Status:** Active, frozen for Gallery OS migration period

**Artifacts:**
- `src/styles/design-tokens.css` (122 lines, CSS custom properties)
- `src/styles/globals.css` (2240 lines, monolithic — contains legacy, admin, public, experience, and nav styles)
- `src/styles/site-2026.css` (97 lines, public experience system)
- `src/styles/home-2026.css` (318 lines, homepage scoped under `.hp`)
- `src/types/design-system.ts` (TypeScript types for tokens)

**Scope:** Gallery 015 only. No multi-institution support. Tokens are global CSS custom properties.

**Known Issues:**
- `globals.css` is monolithic and contains ~1200 lines of dead code
- No scoping mechanism — all styles are global
- No typography scale system (tokens defined but not systematically applied)
- No motion token enforcement (ease defined, not universally used)
- No Arabic typography integration
- No institution-specific token overrides

---

### DS v2.0 — Gallery OS Design Language (V1.0 Launch)

**Status:** In design. Implementation begins Week 1 of Gallery OS V1.0.

**Artifacts:**
- `src/lib/gallery-os/design-language/tokens.ts` — TypeScript token definitions (source of truth)
- `src/lib/gallery-os/design-language/tokens.css` — Generated CSS custom properties
- `src/lib/gallery-os/design-language/institution-override.ts` — Per-institution token overrides
- `src/lib/gallery-os/design-language/types.ts` — Token type system
- `src/styles/gallery-os.css` — Engine-specific styles, scoped by engine

**Key Changes from DS v1.0:**

1. **Single Source of Truth:** Tokens are defined in TypeScript, not CSS. CSS is generated at build time. This enables type-safe token usage in components, institution-specific overrides, and programmatic token manipulation.

2. **Institution Override System:**
```
Base Tokens (Gallery OS defaults)
  └── Institution Override (Gallery 015 config)
       └── Component Override (per-engine, per-component)
```

3. **Scoped Styles:** No more monolithic `globals.css`. Each engine has its own CSS file, loaded only when the engine is active. Legacy styles are extracted and loaded only on non-migrated routes.

4. **Token Categories:**
```
TOKEN SYSTEM
├── Color
│   ├── paper, ink, ink-60, ink-40
│   ├── hairline, hairline-strong
│   ├── surface-dark, surface-dark-text
│   └── accent (institution-specific, optional)
├── Typography
│   ├── Family (serif-display, sans-body, sans-arabic, mono)
│   ├── Scale (12 sizes, clamp-based fluid)
│   ├── Weight (light, regular, medium, semibold)
│   ├── Leading (display, heading, body, label, arabic)
│   └── Tracking (display, heading, body, label)
├── Spatial
│   ├── Space (xs → 4xl)
│   ├── Page (gutter, content-max, header-height)
│   └── Measure (body, intro, label)
├── Motion
│   ├── Duration (fast, base, slow, ritual, arrival)
│   ├── Easing (institutional, standard)
│   └── Reduced (all → 0ms)
├── Visual
│   ├── Border (hairline, hairline-strong)
│   ├── Shadow (museum — artwork plates only)
│   └── Radius (0 everywhere — architectural)
├── Component
│   ├── Touch (minimum 44px)
│   ├── Image (plate-min, plate-padding)
│   └── Constellation (node-min-size, node-max-size, cluster-radius)
├── Breakpoint
│   └── sm, md, lg, xl (content-based, not device-based)
└── Institution
    ├── Name (en, ar)
    ├── Monogram (SVG paths)
    ├── Calendar (timezone, holidays)
    └── Voice (tone guide)
```

5. **CSS Architecture:**
```
styles/
├── gallery-os/
│   ├── tokens.css              (generated from TypeScript)
│   ├── reset.css               (minimal reset)
│   ├── accessibility.css       (skip-link, focus-ring, reduced-motion)
│   ├── engines/
│   │   ├── arrival.css
│   │   ├── threshold.css
│   │   ├── room.css
│   │   ├── constellation.css
│   │   ├── diary.css
│   │   ├── garden.css
│   │   ├── silence.css
│   │   ├── publishing.css
│   │   └── collector.css
│   └── shared/
│       ├── image-plate.css     (universal artwork plate component)
│       ├── hairline-rule.css   (universal divider)
│       └── typography.css      (universal type utilities)
├── legacy/
│   ├── globals.css             (extracted legacy styles)
│   ├── admin.css               (admin CMS styles — unchanged)
│   └── experience.css          (existing experience styles — phased out)
└── design-tokens.css           (DS v1.0 — frozen, loaded as fallback)
```

6. **Typographic System:**
- **DS v1.0:** One typeface (IBM Plex Sans) with serif variable mapped to sans. This was a design regression — removing serif cost editorial warmth.
- **DS v2.0:** Two-typeface system:
  - **Display Serif** — For hero titles, exhibition names, section heads, editorial body. Warmth, gravitas, editorial authority.
  - **Body Sans** — For navigation, labels, metadata, UI elements. Clarity, legibility, functional communication.
  - **Arabic Sans** — IBM Plex Sans Arabic for both display and body in Arabic mode.
  - Font selection is institution-configurable. Gallery 015 defaults: Display Serif (Tiempos Text or equivalent), Body Sans (IBM Plex Sans).

---

### DS v3.0 — Multi-Institution System (V2.0-V3.0)

**Status:** Planned. Design begins Q4 2027.

**New Capabilities:**
- Institution Design Studio: visual configuration UI (no-code)
- Design token sharing between federated institutions
- White-label: institution provides logo, colors, typography, ritual config → Gallery OS generates complete visual identity
- Brand expression: each institution can define a "Signature" — a unique interaction that only their museum has (e.g., Gallery 015's Hairline, another museum's stained-glass dissolve, another's architectural flyover)
- Accessibility-first defaults: every institution starts WCAG 2.2 AA compliant out of the box

---

## Deprecation & Migration

### Deprecated in DS v2.0
| Artifact | Reason | Migration |
|---|---|---|
| `globals.css` monolithic file | Decomposed into per-engine CSS | CSS extracted to `legacy/` directory for non-migrated routes |
| `--color-black`, `--color-white` aliases | Replaced by `--g-ink`, `--g-paper` | Token aliases preserved for backward compatibility during migration |
| Hardcoded `font-family: Georgia` references | Replaced by `var(--font-serif-display)` | Already partially migrated in DS v1.0 |
| `--hp-*` scoped homepage tokens | Replaced by Gallery OS tokens with institution override | Homepage redesign handled by Arrival + Constellation engines |
| Inline `style` attributes on components | Replaced by design token consumption | Gradual migration per engine |

### Deprecated in DS v3.0
| Artifact | Reason | Migration |
|---|---|---|
| CSS custom properties as source of truth | Replaced by TypeScript token system | Generated CSS from TS, backward compatible |
| Hardcoded Gallery 015 identity in tokens | Replaced by institution override system | Extract identity values to config file |
| `design-tokens.css` (DS v1.0) | Fully replaced by DS v2.0 token system | Remove once all routes migrated to Gallery OS |

---

## Compatibility

- **DS v1.0 → DS v2.0:** Backward compatible. DS v2.0 generates the same CSS custom properties as DS v1.0 during migration. Non-migrated routes continue using DS v1.0.
- **DS v2.0 → DS v3.0:** Backward compatible. DS v3.0's institution override system has sensible defaults that match DS v2.0 for Gallery 015.
- **Breaking changes:** None planned. DS versions are additive. Old tokens persist; new tokens are added. Deprecation happens over multiple releases.

---

## Governance

| Decision | Authority | Process |
|---|---|---|
| New token | Design Lead proposes, FE-Arch approves | PR with rationale + usage examples |
| Token value change | Design Lead | Visual regression test required |
| Token deprecation | FE-Arch | 2-release deprecation notice before removal |
| New typography scale | Creative Director + Design Lead | Museum Experience Validation test required |
| New animation duration | Creative Director + FE-Perf | FPS benchmark required |
| Breaking change | CTO | Requires DS major version bump + migration guide |
