# Gallery OS — Test Plan

**Version:** 1.0  
**Status:** Approved

---

## Testing Philosophy

Gallery OS is tested at six levels:
1. **Unit** — Every engine function, algorithm, and utility in isolation
2. **Integration** — Engine-to-engine communication, event flow, data pipeline
3. **UX** — Visual regression, interaction fidelity, animation smoothness
4. **Accessibility** — WCAG 2.2 AA, screen reader, keyboard, zoom, contrast
5. **Performance** — Core Web Vitals, Lighthouse, real device benchmarks
6. **Museum Experience** — Emotional and curatorial validation by domain experts

---

## 1. Unit Testing

### Framework
- **Runner:** Vitest (fast, Vite-native, compatible with Next.js)
- **Coverage target:** > 90% on all engine code
- **Mocking:** MSW for API calls, jsdom for DOM-dependent code

### Per-Engine Unit Tests

| Engine | Tests | Key Test Areas |
|---|---|---|
| **EventBus** | 15 | Publish/subscribe, priority ordering, error isolation, 1000 events/sec benchmark |
| **EngineRegistry** | 8 | Register, init, start, stop, dependency order, duplicate registration |
| **VisitorSession** | 10 | Session creation, persistence, reload, language detection, motion preference |
| **Institution** | 6 | Config load, validation, defaults, feature flag toggles |
| **Identity** | 8 | Language detection chain, switch event, direction change, token resolution |
| **Accessibility** | 8 | Preference detection, focus trapping, reduced-motion flag |
| **Performance** | 6 | Image resolution selection, connection speed detection, bundle budget |
| **Arrival** | 10 | Ritual state machine, first visit, return visit, reduced motion, Ramadan variant |
| **Threshold** | 12 | 4 transition variants, timing, history stack, preloading trigger |
| **Memory** | 10 | CRUD operations, query, aggregate, localStorage persistence |
| **Diary** | 5 | Visit log, persistence, stub content |
| **Rhythm** | 8 | Time-of-day, period transitions, scheduler, timezone |
| **Curator** | 20 | Selection algorithm (constraints), positioning (no overlaps), scoring, reinstallation |
| **Room** | 18 | Level transitions, navigation (swipe, double-tap, keyboard), bilingual content |
| **Constellation** | 22 | Node positioning, physics, viewport culling, zoom bounds, progressive loading |

**Total estimated unit tests:** ~166 test cases

---

## 2. Integration Testing

### Framework
- **Runner:** Playwright (browser-based integration)
- **Scope:** Full visitor journeys across engine boundaries

### Integration Test Scenarios

| Scenario | Engines | Steps |
|---|---|---|
| **Arrival → Room of One** | Arrival, Threshold, Room, Curator | Arrival ritual completes → Threshold → Room displays correct work |
| **Room → Constellation** | Room, Threshold, Constellation | Double-tap in Room → Threshold → Constellation opens at correct position |
| **Constellation → Room** | Constellation, Threshold, Room | Tap work in Constellation → Threshold → Room displays selected work |
| **Room depth L1→L2→L3** | Room, Memory | Scroll down → L2 displays → scroll further → L3 displays → depth recorded |
| **Weekly reinstallation** | Rhythm, Curator, Memory | Monday 06:00 → selection runs → new Hundred deployed → old archived |
| **Language switch** | Identity, all visual engines | Toggle EN→AR → all engines re-render → direction changes |
| **Reduced motion** | Accessibility, all visual engines | Enable reduced motion → Arrival instant → transitions 0ms → Constellation no inertia |
| **Offline mode (V2.0)** | Performance, Memory | Go offline → previous works still viewable → Diary persists → sync on reconnect |

---

## 3. UX Testing

### Visual Regression
- **Tool:** Percy or Chromatic
- **Snapshots:** Every engine state, every level, every transition frame
- **Baseline:** V1.0 Alpha snapshots become the baseline
- **CI:** Every PR triggers visual diff; human reviews any changes

### Animation Smoothness
- **Tool:** Chrome DevTools Performance panel, Frame Rendering Stats
- **Metric:** FPS during all animation sequences
- **Target:** 60fps on desktop, 30fps minimum on mobile
- **Test cases:**
  - Arrival ritual (black → monogram → hairline → fade)
  - Constellation pan at 1×, 4×, 10× zoom
  - Room level transitions (L1→L2, L2→L3)

### Interaction Fidelity
- **Test cases:**
  - Constellation: flick gesture → inertia decay matches physics model
  - Constellation: pinch zoom → zoom to cursor position, not center
  - Room: swipe → correct navigation direction
  - Room: double-tap → return to Constellation at correct position
  - Room: long-press → Witness appears (V1.1)
  - Threshold: transition timing matches spec (±50ms tolerance)

---

## 4. Accessibility Testing

### Automated
- **Tool:** axe-core (integrated in Playwright tests)
- **Scope:** Every Gallery OS route, every engine state
- **CI:** axe checks in CI pipeline; fail build on violations

### Manual
- **Checklist:** WCAG 2.2 AA criteria
- **Performed by:** Accessibility specialist
- **Scope:**
  - All interactive elements keyboard-reachable
  - Focus order matches visual order
  - Focus visible on all interactive elements
  - All images have alt text (en + ar)
  - All form inputs have labels
  - All dynamic content has ARIA live announcements
  - Color contrast: all text > 4.5:1 (body), > 3:1 (large text)
  - Content functional at 200% zoom
  - No content flashes > 3 times/second

### Screen Reader
- **Tools:** VoiceOver (macOS), NVDA (Windows), TalkBack (Android)
- **Test journeys:**
  1. Complete Arrival → Room of One → Constellation exploration → Room L1→L3 → Return
  2. Language switch (EN→AR) with screen reader
  3. Keyboard-only Constellation navigation (arrow keys, +/- zoom, Enter select)
  4. Room depth navigation (headings announced at each level)

### Keyboard
- **Test journey:** Complete visitor journey using only keyboard
- **Requirements:**
  - Tab: navigate through all interactive elements
  - Enter/Space: activate buttons and links
  - Arrow keys: Constellation pan, Room level navigation
  - Escape: close overlays, return to Constellation
  - Skip-link: first Tab focuses "Skip to main content"

---

## 5. Performance Testing

### Core Web Vitals Targets
| Metric | Target | Measurement |
|---|---|---|
| **LCP** (Largest Contentful Paint) | < 2.5s | Lighthouse, RUM |
| **INP** (Interaction to Next Paint) | < 200ms | RUM, Chrome UX Report |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Lighthouse, RUM |
| **TTFB** (Time to First Byte) | < 800ms | Lighthouse |

### Lighthouse Targets
| Category | Target |
|---|---|
| Performance | > 85 |
| Accessibility | > 95 |
| Best Practices | > 90 |
| SEO | > 90 |

### Real Device Benchmarks
| Device | Constellation FPS (1× zoom, pan) | First Load (4G) | Journey Load |
|---|---|---|---|
| MacBook Pro M1 | > 55fps | < 2s | < 4s |
| iPhone 14 | > 45fps | < 3s | < 6s |
| iPhone SE (2022) | > 30fps | < 4s | < 8s |
| iPad Air | > 50fps | < 2.5s | < 5s |
| Samsung Galaxy S23 | > 40fps | < 3s | < 6s |
| Mid-range Android | > 30fps | < 5s | < 10s |

### Bundle Budgets (V1.0)
| Resource | Max Size (gzipped) |
|---|---|
| Total first-load JS | < 150KB |
| Total first-load CSS | < 30KB |
| Critical CSS (above fold) | < 15KB |
| Font files (WOFF2) | < 50KB per weight |
| Constellation worker (WebGL) | < 40KB |

### Load Testing
- **Scenario:** 1000 concurrent visitors browsing Constellation simultaneously
- **Metric:** Server response time < 200ms (95th percentile)
- **Tool:** k6 or Artillery

---

## 6. Museum Experience Validation

This is the most important testing layer — and the hardest to automate. It validates that Gallery OS achieves its emotional and curatorial goals.

### Method
- **Participants:** 20 representative visitors across all personas
- **Format:** Moderated sessions (60 min) — observe, don't instruct
- **Recording:** Screen + webcam + audio

### Persona Coverage
| Persona | Count |
|---|---|
| International tourist (first-time visitor) | 3 |
| Saudi visitor (Arabic-preferring) | 3 |
| Artist | 2 |
| Curator / Museum professional | 2 |
| Collector | 2 |
| Student / Researcher | 2 |
| Architect / Designer | 2 |
| Elderly visitor (65+) | 2 |
| Mobile-only visitor | 2 |

### Evaluation Criteria
| Criterion | Question | Scale |
|---|---|---|
| **Awe** | Did the visitor pause at arrival? | 1-5 |
| **Calm** | Did the visitor seem relaxed while browsing? | 1-5 |
| **Curiosity** | Did the visitor explore unprompted? | 1-5 |
| **Understanding** | Could the visitor explain what the museum is? | 1-5 |
| **Discovery** | Did the visitor find something unexpected? | 1-5 |
| **Memory** | Would the visitor remember a specific work the next day? | 1-5 |
| **Return intent** | Would the visitor return? | 1-5 |
| **Emotion** | Did the visitor express emotion (verbally or visibly)? | 1-5 |
| **Confusion** | Did the visitor ever seem lost or frustrated? | 1-5 (inverse) |
| **Identity** | Did the visitor perceive the museum as Saudi? | 1-5 |

### Pass Threshold
- Average score across all criteria: > 4.0/5
- Confusion score: < 2.0/5
- No single participant rates any criterion < 2/5

### Curatorial Review
- **Participants:** 3 professional curators (not affiliated with Gallery 015)
- **Task:** Review the weekly Hundred selection, Constellation positioning, and Room editorial content
- **Criteria:**
  - Selection: Are the 100 works representative? Is diversity adequate?
  - Positioning: Do spatial relationships create meaningful juxtapositions?
  - Editorial: Is the curatorial text accurate, insightful, and well-written?
  - Rotation: Does the weekly reinstallation feel fresh?

---

## Test Environment

| Environment | URL | Purpose |
|---|---|---|
| Local | `localhost:3001` | Development |
| Preview | Vercel preview URL | PR review |
| Staging | `staging.gallery015.com` | Integration, QA |
| Production | `gallery015.com` | Live site |

---

## CI/CD Pipeline

```
PR Open
  → Lint + TypeCheck
  → Unit Tests
  → Integration Tests (Playwright)
  → Visual Regression (Percy)
  → Accessibility (axe-core)
  → Bundle Size Check
  → Deploy Preview

Merge to Main
  → All PR checks
  → E2E Tests (full journeys)
  → Deploy Staging
  → Manual QA sign-off
  → Deploy Production (with A/B test gating)
```
