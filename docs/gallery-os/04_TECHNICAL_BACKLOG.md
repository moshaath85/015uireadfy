# Gallery OS — Technical Backlog

**Version:** 1.0  
**Status:** Ready for Sprint Planning

---

## Epic Structure

```
GOS-1: Core Runtime
GOS-2: Institution & Identity
GOS-3: Accessibility & Performance
GOS-4: Arrival & Threshold
GOS-5: Memory & Diary
GOS-6: Rhythm Engine
GOS-7: Curator Engine
GOS-8: Room Engine
GOS-9: Constellation Engine
GOS-10: Integration & Release
```

---

## Epic GOS-1: Core Runtime

**Priority:** P0 — Critical  
**Labels:** `gallery-os`, `core`, `infrastructure`  
**Milestone:** V1.0 M1 (Week 4)

### Story GOS-1.1: Event Bus
**Owner:** FE-Infra  
**Points:** 8  
**Definition of Done:**
- [ ] EventBus class with publish/subscribe/unsubscribe
- [ ] Priority queue (CRITICAL, HIGH, MEDIUM, LOW)
- [ ] Error isolation (subscriber failure doesn't block other subscribers)
- [ ] Unit tests: 100% coverage on EventBus
- [ ] Performance: CRITICAL events delivered in < 16ms

**Subtasks:**
1. Define `GalleryOSEvent<T>` type
2. Implement `EventBus` class
3. Implement priority dispatch queue
4. Implement error boundary for subscriber failures
5. Write unit tests
6. Benchmark: 100 subscribers, 1000 events/sec

### Story GOS-1.2: Engine Registry
**Owner:** FE-Infra  
**Points:** 5  

**Definition of Done:**
- [ ] `Engine` interface defined (`init`, `start`, `stop`, `handleEvent`)
- [ ] `EngineRegistry` with register/get/unregister
- [ ] Lifecycle: init all → start all → event loop → stop all
- [ ] Unit tests

### Story GOS-1.3: Visitor Session
**Owner:** FE-Infra  
**Points:** 5  

**Definition of Done:**
- [ ] Anonymous session ID generation (UUID v4)
- [ ] localStorage persistence
- [ ] Session start/end timestamps
- [ ] Preferred language detection
- [ ] Reduced-motion preference detection
- [ ] Unit tests

### Story GOS-1.4: Gallery OS Bootstrap
**Owner:** FE-Infra  
**Points:** 3  

**Definition of Done:**
- [ ] `bootstrap()` function: init engines in dependency order
- [ ] `start()` function: begin event loop
- [ ] `teardown()` function: stop all engines, clean up
- [ ] Integration test: bootstrap → register 3 mock engines → start → handle event → stop

---

## Epic GOS-2: Institution & Identity

**Priority:** P0 — Critical  
**Labels:** `gallery-os`, `configuration`  
**Milestone:** V1.0 M1 (Week 4)

### Story GOS-2.1: Institution Config Schema
**Owner:** FE-Arch  
**Points:** 3  

**Definition of Done:**
- [ ] TypeScript type for `InstitutionConfig`
- [ ] JSON Schema for validation
- [ ] Gallery 015 config file complete
- [ ] Unit test: config loading and validation

### Story GOS-2.2: Institution Engine
**Owner:** FE-Arch  
**Points:** 5  

**Definition of Done:**
- [ ] Config loaded at runtime
- [ ] Reactive store (engines subscribe to config changes)
- [ ] Feature flags per engine
- [ ] Unit tests

### Story GOS-2.3: Identity Engine — Language
**Owner:** FE-Arch  
**Points:** 5  

**Definition of Done:**
- [ ] Language detection: browser → session → default
- [ ] `language.switched` event
- [ ] Direction: `dir="rtl"` / `dir="ltr"` on `<html>`
- [ ] Unit tests

### Story GOS-2.4: Identity Engine — Typography
**Owner:** FE-Arch  
**Points:** 3  

**Definition of Done:**
- [ ] Typography token resolution
- [ ] Font loading (next/font integration)
- [ ] Arabic font loading
- [ ] Unit tests

---

## Epic GOS-3: Accessibility & Performance

**Priority:** P1 — High  
**Labels:** `gallery-os`, `a11y`, `performance`  
**Milestone:** V1.0 M1 (Week 4, ongoing)

### Story GOS-3.1: Accessibility Engine — Preferences
**Owner:** FE  
**Points:** 3  

**Definition of Done:**
- [ ] Detect `prefers-reduced-motion`
- [ ] Detect `prefers-contrast`
- [ ] Font size preference storage
- [ ] Reactive store for all engines
- [ ] Unit tests

### Story GOS-3.2: Accessibility Engine — Keyboard
**Owner:** FE  
**Points:** 5  

**Definition of Done:**
- [ ] Skip-link component
- [ ] Focus-ring system (2px solid, high contrast)
- [ ] Focus trapping utility (for overlays)
- [ ] Tab order audit on all Gallery OS routes
- [ ] Manual keyboard test pass

### Story GOS-3.3: Accessibility Engine — Screen Reader
**Owner:** FE  
**Points:** 8  

**Definition of Done:**
- [ ] ARIA live region manager
- [ ] Alt text for all artwork images (en/ar)
- [ ] Role attributes on all interactive elements
- [ ] VoiceOver pass on Arrival, Room, Constellation
- [ ] NVDA pass (if Windows available)

### Story GOS-3.4: Performance Engine — Image Pipeline
**Owner:** FE-Perf  
**Points:** 8  

**Definition of Done:**
- [ ] Multi-resolution image generation (280px, 800px, 2400px)
- [ ] Progressive blur-up loading
- [ ] WebP with JPEG fallback
- [ ] Adaptive quality based on connection speed
- [ ] Unit tests + visual regression

### Story GOS-3.5: Performance Engine — Monitoring
**Owner:** FE-Perf  
**Points:** 5  

**Definition of Done:**
- [ ] Custom RUM: LCP, CLS, INP tracking
- [ ] Bundle size monitoring in CI
- [ ] Console warnings if bundles exceed targets
- [ ] Lighthouse CI integration

---

## Epic GOS-4: Arrival & Threshold

**Priority:** P0 — Critical  
**Labels:** `gallery-os`, `experience`  
**Milestone:** V1.0 M2 (Week 8)

### Story GOS-4.1: Threshold Engine
**Owner:** FE-Exp  
**Points:** 8  

**Definition of Done:**
- [ ] Transition state machine (4 variants)
- [ ] Animation sequence with correct durations
- [ ] Navigation history stack
- [ ] Preloading: threshold.started triggers destination preload
- [ ] Reduced-motion: instant 0ms transition
- [ ] Unit tests + visual regression

### Story GOS-4.2: Arrival Engine — Ritual
**Owner:** FE-Exp  
**Points:** 8  

**Definition of Done:**
- [ ] New visit ritual: black → monogram → hairline → fade
- [ ] Return visit variant (abbreviated)
- [ ] Reduced-motion variant (instant)
- [ ] Monogram from institution config
- [ ] Unit tests + visual regression

### Story GOS-4.3: Arrival → Room of One Flow
**Owner:** FE-Exp  
**Points:** 5  

**Definition of Done:**
- [ ] Arrival completes → Threshold → Room of One displays
- [ ] Room of One work from Curator Engine
- [ ] Navigation: after 30s, auto-transition or visitor choice
- [ ] Integration test: full Arrival → Room flow

---

## Epic GOS-5: Memory & Diary

**Priority:** P1 — High  
**Labels:** `gallery-os`, `data`  
**Milestone:** V1.0 M1 (Week 4)

### Story GOS-5.1: Memory Engine — Core
**Owner:** FE  
**Points:** 5  

**Definition of Done:**
- [ ] Encounter data model
- [ ] localStorage CRUD operations
- [ ] Query by visitor, work, date range
- [ ] Anonymized aggregate queries
- [ ] Unit tests

### Story GOS-5.2: Diary Engine — Stub
**Owner:** FE  
**Points:** 3  

**Definition of Done:**
- [ ] Visit log recording
- [ ] Stub UI: "Your diary will be available in a future update."
- [ ] Data persistence across sessions
- [ ] Unit tests

---

## Epic GOS-6: Rhythm Engine

**Priority:** P1 — High  
**Labels:** `gallery-os`, `temporal`  
**Milestone:** V1.0 M4 (Week 16)

### Story GOS-6.1: Time-of-Day Detection
**Owner:** FE  
**Points:** 5  

**Definition of Done:**
- [ ] Period detection in institution timezone
- [ ] `rhythm.time.changed` event
- [ ] Configurable period boundaries
- [ ] Unit tests

### Story GOS-6.2: Weekly Scheduler
**Owner:** FE  
**Points:** 5  

**Definition of Done:**
- [ ] Monday 06:00 cron fires `installation.change`
- [ ] Scheduler persists across server restarts
- [ ] Manual trigger endpoint for testing
- [ ] Unit tests + integration test

---

## Epic GOS-7: Curator Engine

**Priority:** P0 — Critical  
**Labels:** `gallery-os`, `curation`  
**Milestone:** V1.0 M4 (Week 16)

### Story GOS-7.1: Data Source Adapter
**Owner:** FE-BE  
**Points:** 5  

**Definition of Done:**
- [ ] Wrap existing Prisma repositories
- [ ] Unified interface for Curator Engine
- [ ] Works, artists, exhibitions, collections
- [ ] Unit tests with mock data

### Story GOS-7.2: Selection Algorithm
**Owner:** FE-BE  
**Points:** 13  

**Definition of Done:**
- [ ] Filter: visibility, rotation cooldown, availability
- [ ] Score: significance + diversity + novelty - fatigue
- [ ] Select top 100 with constraints
- [ ] Validation: at least 15 artists, max 5/artist, 3+/decade, 20% new
- [ ] Unit tests with real collection data
- [ ] Performance: selection completes in < 5 seconds

### Story GOS-7.3: Positioning Algorithm
**Owner:** FE-BE  
**Points:** 8  

**Definition of Done:**
- [ ] X-position: year → canvas coordinate
- [ ] Y-position: affinity clustering
- [ ] Z-scale: significance → node size
- [ ] No overlapping works (80px minimum separation)
- [ ] Unit tests: validate positions are within canvas bounds

### Story GOS-7.4: Reinstallation Integration
**Owner:** FE-BE  
**Points:** 5  

**Definition of Done:**
- [ ] Consume `installation.change` from Rhythm Engine
- [ ] Run selection + positioning
- [ ] Archive current installation
- [ ] Publish new installation
- [ ] Integration test: trigger cron → new installation deployed

---

## Epic GOS-8: Room Engine

**Priority:** P0 — Critical  
**Labels:** `gallery-os`, `experience`  
**Milestone:** V1.0 M2 (Week 8)

### Story GOS-8.1: Level 1 — The Encounter
**Owner:** FE-Exp  
**Points:** 13  

**Definition of Done:**
- [ ] Full-screen artwork with hairline frame
- [ ] Title, artist, year display
- [ ] Museum shadow on artwork plate
- [ ] Auto-advance timer (journey mode)
- [ ] Mouse parallax (subtle, disabled on reduced motion)
- [ ] Unit tests + visual regression

### Story GOS-8.2: Level 2 — The Story
**Owner:** FE-Exp  
**Points:** 8  

**Definition of Done:**
- [ ] Work shifts left 60%, text right 40%
- [ ] Scroll-driven transition from L1
- [ ] Curatorial text rendering (14px serif, 62ch measure, 1.6 leading)
- [ ] Bilingual text (visitor's language)
- [ ] Unit tests

### Story GOS-8.3: Level 3 — The Record
**Owner:** FE-Exp  
**Points:** 8  

**Definition of Done:**
- [ ] Museum-label format
- [ ] Fields: medium, dimensions, provenance, exhibition history, bibliography
- [ ] Scroll-driven transition from L2
- [ ] Collapsible sections for long data
- [ ] Unit tests

### Story GOS-8.4: Room Navigation
**Owner:** FE-Exp  
**Points:** 5  

**Definition of Done:**
- [ ] Swipe left/right (sequence)
- [ ] Double-tap (return to Constellation)
- [ ] Long-press (Witness — stub)
- [ ] Keyboard: arrow keys for level navigation
- [ ] Unit tests + manual gesture test

### Story GOS-8.5: Room → Constellation Integration
**Owner:** FE-Exp  
**Points:** 5  

**Definition of Done:**
- [ ] Double-tap → Threshold → Constellation (at correct position)
- [ ] Constellation at position of selected work
- [ ] Integration test

---

## Epic GOS-9: Constellation Engine

**Priority:** P0 — Critical  
**Labels:** `gallery-os`, `experience`, `performance`  
**Milestone:** V1.0 M3 (Week 12)

### Story GOS-9.1: Canvas Rendering Engine
**Owner:** FE-Gfx  
**Points:** 13  

**Definition of Done:**
- [ ] WebGL rendering (Canvas 2D fallback)
- [ ] Work nodes as thumbnail plates with hairline frames
- [ ] Z-scale sizing
- [ ] Viewport culling
- [ ] Progressive loading (L1/L2/L3)
- [ ] Performance: 60fps desktop, 30fps mobile

### Story GOS-9.2: Physics — Pan and Zoom
**Owner:** FE-Gfx  
**Points:** 13  

**Definition of Done:**
- [ ] Inertia on pan (friction 0.92)
- [ ] Pinch zoom (mobile), scroll zoom (desktop)
- [ ] Zoom to cursor position
- [ ] Zoom boundaries (0.5× min, 10× max)
- [ ] Smooth zoom animation (800ms)
- [ ] Unit tests for physics model

### Story GOS-9.3: Work Node Interaction
**Owner:** FE-Gfx  
**Points:** 8  

**Definition of Done:**
- [ ] Tap/click → Threshold → Room Engine
- [ ] Hover: slight scale increase, title tooltip
- [ ] Cluster: 3+ works same artist → group visual
- [ ] Artist name label above cluster
- [ ] Unit tests + manual interaction test

### Story GOS-9.4: Controls + Accessibility
**Owner:** FE-Gfx  
**Points:** 8  

**Definition of Done:**
- [ ] Zoom in/out buttons
- [ ] Reset view button
- [ ] Keyboard control: arrow keys pan, +/- zoom, Enter select
- [ ] Text-based alternative view (list toggle)
- [ ] Screen reader: spatial navigation announcements

### Story GOS-9.5: Constellation → Room → Constellation Flow
**Owner:** FE-Gfx  
**Points:** 5  

**Definition of Done:**
- [ ] Select work → Threshold → Room
- [ ] Double-tap in Room → Threshold → Constellation (at original position)
- [ ] Position remembered correctly
- [ ] Integration test

---

## Epic GOS-10: Integration & Release

**Priority:** P0 — Critical  
**Labels:** `gallery-os`, `release`  
**Milestone:** V1.0 M5-M8 (Weeks 18-24)

### Story GOS-10.1: Bootstrap & Routing
**Owner:** FE-Arch  
**Points:** 8  

**Definition of Done:**
- [ ] Gallery OS initializes on app load
- [ ] Route migration: `/` → Arrival, `/artworks/[slug]` → Room
- [ ] `/constellation` → Constellation
- [ ] Existing non-migrated routes continue to work
- [ ] Integration test: full journey

### Story GOS-10.2: A/B Test Framework
**Owner:** FE-Arch  
**Points:** 5  

**Definition of Done:**
- [ ] Cookie-based A/B test (50/50)
- [ ] Variant A: existing site
- [ ] Variant B: Gallery OS
- [ ] No visible difference for Variant A visitors
- [ ] Toggle: instant rollback to Variant A for all visitors

### Story GOS-10.3: End-to-End Testing
**Owner:** QA  
**Points:** 8  

**Definition of Done:**
- [ ] E2E test: Arrival → Room of One → Constellation → select work → Room L1→L2→L3 → return
- [ ] Cross-browser: Chrome, Safari, Firefox, Edge
- [ ] Mobile: iOS Safari, Chrome Android
- [ ] Tablet: iPad Safari
- [ ] All tests pass

### Story GOS-10.4: Performance Audit
**Owner:** FE-Perf  
**Points:** 5  

**Definition of Done:**
- [ ] Lighthouse score > 85 Performance, > 95 Accessibility
- [ ] Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1
- [ ] 4G simulation: complete journey in < 8s total load
- [ ] Bundle size: < 200KB total first load

### Story GOS-10.5: Accessibility Audit
**Owner:** QA  
**Points:** 8  

**Definition of Done:**
- [ ] WCAG 2.2 AA checklist: all items pass
- [ ] Screen reader: VoiceOver pass on full journey
- [ ] Keyboard: full journey without mouse
- [ ] 200% zoom: no content loss
- [ ] Color contrast: all text meets ratio requirements

### Story GOS-10.6: Release
**Owner:** FE-Arch  
**Points:** 5  

**Definition of Done:**
- [ ] V1.0 release notes
- [ ] Migration guide for existing visitors
- [ ] Rollback plan documented and tested
- [ ] Monitoring dashboard configured
- [ ] On-call rotation established
