# Gallery OS — Implementation Plan (V1.0)

**Version:** 1.0  
**Author:** TEX7 Engineering  
**Status:** Approved

---

## Task Breakdown

---

### TASK 1: Core Runtime — Event Bus + Engine Registry + Visitor Session

**Objective:** Build the communication backbone and lifecycle management for all Gallery OS engines.

**Files Affected:**
- `src/lib/gallery-os/runtime/event-bus.ts` (NEW)
- `src/lib/gallery-os/runtime/engine-registry.ts` (NEW)
- `src/lib/gallery-os/runtime/visitor-session.ts` (NEW)
- `src/lib/gallery-os/runtime/types.ts` (NEW)
- `src/lib/gallery-os/index.ts` (NEW)

**Complexity:** Medium  
**Estimated Hours:** 24

**Dependencies:** None (leaf node)  
**Blocks:** All engines

**Implementation Steps:**
1. Define `GalleryOSEvent` type with payload, priority, timestamp
2. Implement `EventBus`: publish, subscribe, unsubscribe. Priority-aware dispatch queue.
3. Define `Engine` interface: `init()`, `start()`, `stop()`, `handleEvent(event)`
4. Implement `EngineRegistry`: register engine, get engine by name, lifecycle management
5. Implement `VisitorSession`: anonymous session ID generation, localStorage persistence, session start/end timestamps, preferred language detection, reduced-motion preference detection
6. Unit tests for EventBus pub/sub, priority ordering, error isolation (one subscriber failure doesn't block others)
7. Unit tests for EngineRegistry lifecycle (init → start → handle events → stop)

**Acceptance Criteria:**
- EventBus delivers events to all subscribers within priority latency targets
- EngineRegistry can register, initialize, start, and stop 20 engines without conflict
- VisitorSession persists across page reloads
- All tests pass with > 90% coverage on runtime code

**Rollback:** New code. No existing code modified. Remove `src/lib/gallery-os/` directory.

---

### TASK 2: Institution Engine

**Objective:** Load and serve institution configuration. Single source of truth for all engine settings.

**Files Affected:**
- `src/lib/gallery-os/engines/institution/institution-engine.ts` (NEW)
- `src/lib/gallery-os/engines/institution/config.ts` (NEW)
- `src/lib/gallery-os/engines/institution/types.ts` (NEW)
- `config/gallery-015.json` (NEW — institution config file)

**Complexity:** Low  
**Estimated Hours:** 12

**Dependencies:** Core Runtime (TASK 1)  
**Blocks:** All engines (soft — many can use stubs)

**Implementation Steps:**
1. Define InstitutionConfig type: name (en/ar), monogram SVG paths, founding year, location, mission statement, voice guide, visual tokens (paper, ink, accent, hairline strength, typography), ritual config (arrival duration, threshold style), calendar (timezone, cultural holidays), feature flags (enable/disable each engine)
2. Load config from JSON at runtime
3. Provide config as a reactive store (engines subscribe to config changes)
4. Create Gallery 015 config file with all current design tokens and identity values
5. Unit tests for config loading, defaults, override behavior

**Acceptance Criteria:**
- All engines can access institution config via `institution.getConfig()`
- Changing config file and restarting applies new values
- Gallery 015 config is complete and validated

**Rollback:** New code. Remove config directory and institution engine files.

---

### TASK 3: Identity Engine

**Objective:** Manage language, direction, typography, and cultural identity tokens.

**Files Affected:**
- `src/lib/gallery-os/engines/identity/identity-engine.ts` (NEW)
- `src/lib/gallery-os/engines/identity/language-detector.ts` (NEW)
- `src/lib/gallery-os/engines/identity/types.ts` (NEW)

**Complexity:** Low  
**Estimated Hours:** 10

**Dependencies:** Core Runtime (TASK 1), Institution Engine (TASK 2)  
**Blocks:** All visual engines

**Implementation Steps:**
1. Language detection: browser preference → session preference → institution default
2. Language switching: `language.switched` event → all engines re-render
3. Direction management: `dir="rtl"` / `dir="ltr"` on `<html>` dynamically
4. Typography token resolution: serif family, sans family, Arabic family, all sizes/tracking/leading
5. Unit tests for language detection priority chain, direction switching

**Acceptance Criteria:**
- Language switching triggers re-render across all active engines
- RTL layout mirrors correctly: header, footer, Constellation, Room, Journey
- Typography tokens resolve correctly for all supported languages

**Rollback:** New code. Remove identity engine directory.

---

### TASK 4: Accessibility Engine

**Objective:** Ensure WCAG 2.2 AA compliance across all engines. Provide accessibility configuration consumed by all engines.

**Files Affected:**
- `src/lib/gallery-os/engines/accessibility/accessibility-engine.ts` (NEW)
- `src/lib/gallery-os/engines/accessibility/types.ts` (NEW)
- `src/styles/accessibility.css` (NEW — skip-link, focus-ring, reduced-motion)

**Complexity:** Medium  
**Estimated Hours:** 20

**Dependencies:** Core Runtime (TASK 1)

**Implementation Steps:**
1. Detect visitor accessibility preferences: `prefers-reduced-motion`, `prefers-contrast`, font size preference
2. Provide reactive store consumed by all engine renderers
3. Implement skip-link component (already exists in current Header, migrate to Gallery OS)
4. Implement focus-ring system (2px solid, high contrast, consistent across engines)
5. Implement reduced-motion override (all animations → 0ms)
6. Implement font-size scaling (±30% from default)
7. Keyboard navigation: focus trapping in overlays, tab order audit
8. ARIA live region manager for dynamic content announcements
9. Unit tests for preference detection, focus management
10. Manual accessibility audit: keyboard-only navigation, VoiceOver, 200% zoom

**Acceptance Criteria:**
- Lighthouse Accessibility score > 95
- All interactive elements reachable via keyboard
- All dynamic content has ARIA live region announcements
- All animations disabled when `prefers-reduced-motion: reduce`

**Rollback:** New code + small CSS additions. Remove files, revert CSS.

---

### TASK 5: Performance Engine

**Objective:** Manage loading strategy, image pipeline, bundle budgets, and performance monitoring.

**Files Affected:**
- `src/lib/gallery-os/engines/performance/performance-engine.ts` (NEW)
- `src/lib/gallery-os/engines/performance/image-pipeline.ts` (NEW)
- `src/lib/gallery-os/engines/performance/bundle-tracker.ts` (NEW)
- `src/lib/gallery-os/engines/performance/types.ts` (NEW)

**Complexity:** Medium  
**Estimated Hours:** 18

**Dependencies:** Core Runtime (TASK 1)

**Implementation Steps:**
1. Image resolution pipeline: generate thumbnail (280px), display (800px), zoom (2400px) from source
2. Progressive image loading: low-res blur → full resolution (blur-up)
3. Bundle budget enforcement: console warnings during dev if bundles exceed targets
4. Performance monitoring: custom RUM events for LCP, CLS, INP
5. Adaptive quality: detect connection speed, serve lower resolution on slow connections
6. Preloading strategy: next work in journey preloaded during current work display
7. Unit tests for image resolution selection, connection speed detection

**Acceptance Criteria:**
- Homepage LCP < 2.5s on 4G
- Constellation canvas maintains 60fps on desktop, 30fps on mobile
- Image pipeline serves correct resolution per viewport and connection

**Rollback:** New code. Remove performance engine directory.

---

### TASK 6: Arrival Engine

**Objective:** The gateway experience. Visitors enter the museum through a designed ritual — not a page load.

**Files Affected:**
- `src/lib/gallery-os/engines/arrival/arrival-engine.ts` (NEW)
- `src/components/gallery-os/arrival/ArrivalExperience.tsx` (NEW)
- `src/components/gallery-os/arrival/ArrivalRitual.tsx` (NEW)
- `src/app/page.tsx` (EDIT — route to Arrival Experience instead of current homepage)

**Complexity:** Medium  
**Estimated Hours:** 16

**Dependencies:** Core Runtime (TASK 1), Threshold Engine (TASK 7), Institution Engine (TASK 2), Identity Engine (TASK 3)

**Implementation Steps:**
1. New visit detection: check Diary for previous session
2. Ritual animation: black screen (2.0s) → monogram fade-in (0.8s, cubic-bezier) → hairline draws across (1.5s, stroke-dasharray animation) → monogram fades (0.6s) → dissolve to Threshold
3. Return visit variant: reduced durations, "Welcome back" text
4. Accessibility variant: instant transition (no animation) for reduced-motion
5. Ramadan variant: green hairline, extended black duration
6. Unit tests for ritual state machine
7. Visual regression tests for ritual animation frames

**Acceptance Criteria:**
- First visit: full ritual. Return visit (within 7 days): abbreviated ritual.
- Ritual completes in exactly 3.8s (first visit) or 2.5s (return visit).
- Reduced-motion preference skips all animation.
- Monogram draws from institution config.

**Rollback:** Revert `src/app/page.tsx` to current homepage. Remove Arrival components.

---

### TASK 7: Threshold Engine

**Objective:** Manage transitions between all spaces in the museum. The between-space ceremony.

**Files Affected:**
- `src/lib/gallery-os/engines/threshold/threshold-engine.ts` (NEW)
- `src/components/gallery-os/threshold/ThresholdTransition.tsx` (NEW)

**Complexity:** Medium  
**Estimated Hours:** 14

**Dependencies:** Core Runtime (TASK 1), Identity Engine (TASK 3), Accessibility Engine (TASK 4)

**Implementation Steps:**
1. Transition variants: Room-to-Room (3.0s), Room-to-Work (2.5s), Work-to-Atlas (1.1s), Rapid (0.2s)
2. Animation sequence: current space fade-out → black hold → hairline draw → new space fade-in
3. Navigation history stack: back-traversal uses reverse transitions
4. Preloading: destination engine resources begin loading when threshold.started event fires
5. Accessibility: reduced-motion → instant 0ms transition
6. Unit tests for transition timing, history stack

**Acceptance Criteria:**
- All four transition variants execute with correct timing
- Navigation back through history works correctly
- Reduced-motion visitors experience instant transitions

**Rollback:** New code. Remove threshold components.

---

### TASK 8: Memory Engine (Stub)

**Objective:** Record and serve visitor encounter data. V1.0 is a stub — localStorage only, no cloud sync, no letters.

**Files Affected:**
- `src/lib/gallery-os/engines/memory/memory-engine.ts` (NEW)
- `src/lib/gallery-os/engines/memory/types.ts` (NEW)

**Complexity:** Low  
**Estimated Hours:** 10

**Dependencies:** Core Runtime (TASK 1)

**Implementation Steps:**
1. Visitor memory: record encounters (work ID, duration, depth, timestamp, source)
2. localStorage persistence with JSON serialization
3. Query interface: get encounters by visitor, by work, by date range
4. Anonymized aggregate queries (for Curator: "which works are most engaged with")
5. Unit tests for CRUD operations, query performance

**Acceptance Criteria:**
- Encounter data persists across page reloads
- Aggregate queries complete in < 50ms for 1000 encounters
- No personally identifiable information stored

**Rollback:** New code. Remove memory engine directory. No data loss (all in localStorage).

---

### TASK 9: Diary Engine (Stub)

**Objective:** Visitor's personal space. V1.0 stub — records visits, no letters yet.

**Files Affected:**
- `src/lib/gallery-os/engines/diary/diary-engine.ts` (NEW)
- `src/lib/gallery-os/engines/diary/types.ts` (NEW)

**Complexity:** Low  
**Estimated Hours:** 8

**Dependencies:** Core Runtime (TASK 1), Memory Engine (TASK 8)

**Implementation Steps:**
1. Diary data structure: visit log, bookmarked works, preferred artists
2. Stub: record visit start/end, works viewed, total duration
3. Stub: "no letters yet" placeholder UI (text only: "Your diary will be available in a future update.")
4. Unit tests for data persistence

**Acceptance Criteria:**
- Visit logs are recorded and persisted
- Diary is accessible but shows stub content
- No errors when Memory Engine is unavailable

**Rollback:** New code. Remove diary engine directory.

---

### TASK 10: Rhythm Engine (Basic)

**Objective:** Manage time-of-day behavior and weekly reinstallation trigger. V1.0: daily rhythm only (morning/afternoon/evening/night). Weekly cron for Monday reinstallation.

**Files Affected:**
- `src/lib/gallery-os/engines/rhythm/rhythm-engine.ts` (NEW)
- `src/lib/gallery-os/engines/rhythm/scheduler.ts` (NEW)
- `src/lib/gallery-os/engines/rhythm/types.ts` (NEW)

**Complexity:** Medium  
**Estimated Hours:** 14

**Dependencies:** Core Runtime (TASK 1), Institution Engine (TASK 2 — timezone, calendar)

**Implementation Steps:**
1. Time-of-day detection: morning (06-12), afternoon (12-18), evening (18-22), night (22-06) in institution timezone
2. `rhythm.time.changed` event when period transitions
3. Weekly scheduler: Monday 06:00 fires `installation.change` trigger
4. Config-driven: institution can override period boundaries, add custom periods
5. Unit tests for timezone handling, period transitions, scheduler reliability

**Acceptance Criteria:**
- Time-of-day correctly detected in institution timezone (Riyadh, UTC+3)
- Period transitions fire correct events
- Monday cron fires at exactly 06:00 Riyadh time
- Scheduler survives server restart (persistent state or re-evaluates on boot)

**Rollback:** New code. Remove rhythm engine directory. Scheduler cron is server-side only.

---

### TASK 11: Curator Engine (Basic)

**Objective:** Select works, arrange Constellation, generate journeys. V1.0: selection algorithm + weekly reinstallation. Static data (no ML, no personalization).

**Files Affected:**
- `src/lib/gallery-os/engines/curator/curator-engine.ts` (NEW)
- `src/lib/gallery-os/engines/curator/selection-algorithm.ts` (NEW)
- `src/lib/gallery-os/engines/curator/positioning.ts` (NEW)
- `src/lib/gallery-os/engines/curator/types.ts` (NEW)
- `src/lib/gallery-os/engines/curator/data-source.ts` (NEW — adapter for existing Prisma repositories)

**Complexity:** High  
**Estimated Hours:** 32

**Dependencies:** Core Runtime (TASK 1), Memory Engine (TASK 8), Institution Engine (TASK 2)

**Implementation Steps:**
1. Data source adapter: wrap existing `artistsRepository`, `artworksRepository`, `exhibitionsRepository`, `collectionsRepository`
2. Selection algorithm: filter × score × select top 100 (per Gallery OS spec)
3. Positioning algorithm: X from year, Y from affinity (same artist → cluster, same exhibition → proximity), Z from significance
4. Room of One selection: highest significance work, rotated weekly, never repeat in 4 weeks
5. Weekly cron integration: consume `installation.change` from Rhythm Engine
6. Human curator override: `curator.override` event → pin/unpin specific works, override positions
7. Unit tests for selection algorithm with mock data
8. Integration test: run selection on real collection data, validate constraints (15+ artists, max 5 per artist, 3+ per decade, 20% new)

**Acceptance Criteria:**
- Selection produces 100 works meeting all constraints
- Positioning creates visually coherent Constellation (validated by human curator)
- Room of One changes every Monday
- Override system works for pinning/reordering works
- Reinstallation completes in < 30 seconds

**Rollback:** New code + adapter wrapping existing repos. Remove curator engine directory.

---

### TASK 12: Room Engine (Levels 1-3)

**Objective:** Display a single artwork with editorial depth. V1.0: Levels 1-3. Levels 4-5 in V1.1.

**Files Affected:**
- `src/lib/gallery-os/engines/room/room-engine.ts` (NEW)
- `src/components/gallery-os/room/RoomExperience.tsx` (NEW)
- `src/components/gallery-os/room/LevelOneEncounter.tsx` (NEW)
- `src/components/gallery-os/room/LevelTwoStory.tsx` (NEW)
- `src/components/gallery-os/room/LevelThreeRecord.tsx` (NEW)
- `src/app/artworks/[slug]/page.tsx` (EDIT — route through Room Engine)

**Complexity:** High  
**Estimated Hours:** 40

**Dependencies:** Core Runtime (TASK 1), Threshold Engine (TASK 7), Identity Engine (TASK 3), Accessibility Engine (TASK 4), Performance Engine (TASK 5), Memory Engine (TASK 8), Institution Engine (TASK 2)

**Implementation Steps:**
1. Level 1 — The Encounter: work full-screen, hairline frame, title/artist/year below, 20-35s auto-advance (journey mode) or infinite (standalone mode)
2. Level 2 — The Story: work shifts left 60%, curatorial text right 40%, smooth scroll transition between L1 and L2
3. Level 3 — The Record: museum-label format, medium, dimensions, provenance, exhibition history, bibliography
4. Scroll-driven level transitions (IntersectionObserver)
5. Navigation: swipe left/right (sequence), double-tap (return to Constellation), long-press (Witness)
6. Bilingual: work title in both languages, description in visitor's language
7. Mouse parallax: subtle work shift on mouse movement (disabled for reduced motion)
8. Unit tests for level transitions, navigation gestures
9. Visual regression tests for each level
10. Accessibility: keyboard navigation, screen reader announcements for level changes

**Acceptance Criteria:**
- All three levels render correctly with real artwork data
- Level transitions are smooth (60fps) on desktop
- Swipe navigation works on mobile
- Keyboard navigation works for all levels
- Screen reader announces level changes

**Rollback:** Revert artwork detail page route. Remove Room components.

---

### TASK 13: Constellation Engine (Basic)

**Objective:** Spatial collection browser. V1.0: Canvas rendering, pan, zoom, select. Connections, clusters, exhibition regions in V2.0.

**Files Affected:**
- `src/lib/gallery-os/engines/constellation/constellation-engine.ts` (NEW)
- `src/components/gallery-os/constellation/ConstellationCanvas.tsx` (NEW)
- `src/components/gallery-os/constellation/WorkNode.tsx` (NEW)
- `src/components/gallery-os/constellation/controls/ZoomControls.tsx` (NEW)
- `src/app/constellation/page.tsx` (NEW)

**Complexity:** Very High  
**Estimated Hours:** 56

**Dependencies:** Core Runtime (TASK 1), Curator Engine (TASK 11), Threshold Engine (TASK 7), Performance Engine (TASK 5), Accessibility Engine (TASK 4), Identity Engine (TASK 3)

**Implementation Steps:**
1. Canvas rendering engine: WebGL (primary) or Canvas 2D (fallback)
2. Work nodes: rendered as thumbnail plates with hairline frames, scaled by Z (significance)
3. Physics: inertia on pan, friction 0.92, momentum preserved on release
4. Zoom: pinch (mobile), scroll (desktop), smooth zoom to cursor position
5. Progressive loading: L1 (immediate, 2× viewport), L2 (100ms, 4×), L3 (500ms, 8×), beyond (nothing)
6. Viewport culling: only render works in/near viewport
7. Select: tap/click work → Room Engine (via Threshold)
8. Controls: zoom in/out buttons (accessibility), "Reset view" button
9. Performance: 60fps target desktop, 30fps minimum mobile, frame budget 16ms
10. Accessibility: keyboard pan/zoom, text-based alternative view, screen reader "you are in a spatial browser"
11. Unit tests for physics, viewport culling, coordinate transformations
12. Performance benchmarks: 100 works, 60fps pan at 1× zoom, 30fps pan at 4× zoom

**Acceptance Criteria:**
- 100 works render as nodes with correct positions
- Pan and zoom are smooth at 60fps (desktop)
- Progressive loading shows nearby works first
- Tapping a work opens Room Engine
- Keyboard accessible alternative exists
- Works correctly positioned: X by year, Y by affinity, Z by significance

**Rollback:** New code. Remove Constellation components and route.

---

### TASK 14: Integration, Testing, and Release

**Objective:** Wire all engines together. End-to-end testing. Performance validation. Accessibility audit. Ship V1.0.

**Files Affected:**
- `src/lib/gallery-os/bootstrap.ts` (NEW — engine initialization and wiring)
- `src/app/layout.tsx` (EDIT — load Gallery OS runtime)
- `src/app/page.tsx` (EDIT — Arrival → Room of One → Constellation flow)
- Various existing route files (EDIT — progressive migration to Gallery OS)

**Complexity:** High  
**Estimated Hours:** 40

**Dependencies:** All V1.0 tasks complete

**Implementation Steps:**
1. Bootstrap: initialize EventBus → register all engines → start engines in dependency order
2. Route migration: progressively replace existing routes with Gallery OS equivalents
3. A/B test: serve existing site to 50% of visitors, Gallery OS to 50% (via cookie)
4. End-to-end test: complete visitor journey (Arrival → Room of One → Constellation → select work → Room L1→L2→L3 → return to Constellation)
5. Performance audit: Lighthouse, Core Web Vitals, 4G simulation
6. Accessibility audit: WCAG 2.2 AA checklist, screen reader pass, keyboard pass
7. Cross-browser: Chrome, Safari, Firefox, Edge
8. Mobile: iOS Safari, Chrome Android
9. Tablet: iPad Safari, Android tablet Chrome

**Acceptance Criteria:**
- Complete visitor journey works end-to-end
- Lighthouse Performance > 85, Accessibility > 95
- All Core Web Vitals pass (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- No console errors in any browser
- Existing routes continue to function (non-migrated routes)

**Rollback:** A/B test framework allows instant rollback to existing site. Gallery OS code isolated in `src/lib/gallery-os/` and `src/components/gallery-os/`.

---

## Total Estimated Effort (V1.0)

| Task | Hours |
|---|---|
| T1: Core Runtime | 24 |
| T2: Institution Engine | 12 |
| T3: Identity Engine | 10 |
| T4: Accessibility Engine | 20 |
| T5: Performance Engine | 18 |
| T6: Arrival Engine | 16 |
| T7: Threshold Engine | 14 |
| T8: Memory Engine (stub) | 10 |
| T9: Diary Engine (stub) | 8 |
| T10: Rhythm Engine (basic) | 14 |
| T11: Curator Engine (basic) | 32 |
| T12: Room Engine (L1-L3) | 40 |
| T13: Constellation Engine (basic) | 56 |
| T14: Integration + Release | 40 |
| **TOTAL** | **314 hours** |

**Team sizing:** 4 FE engineers × 24 weeks = 960 available hours.  
**Buffer:** 314 / 960 = 33% utilization. Adequate for testing, bug fixes, design iteration, and unknowns.
