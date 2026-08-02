# Gallery OS — Risk Register

**Version:** 1.0  
**Status:** Active

---

## Risk Matrix

| Probability / Impact | Low Impact | Medium Impact | High Impact | Critical Impact |
|---|---|---|---|---|
| **Very Likely (>70%)** | R12: CSS bloat | R7: Arabic delay | R2: Constellation perf | — |
| **Likely (40-70%)** | R14: Font loading flash | R3: EventBus latency | R1: Visitor rejection | — |
| **Possible (15-40%)** | R15: SEO temporary dip | R8: Cron failure | R4: Browser compat | R11: Data loss |
| **Unlikely (5-15%)** | — | R10: Route conflicts | R5: A11y lawsuit | — |
| **Rare (<5%)** | — | R9: Team attrition | R6: Next.js upgrade | — |

---

## Risk Details

---

### R1: Visitors Reject the New Experience

**ID:** GOS-RISK-001  
**Category:** UX / Business  
**Probability:** Likely (50%)  
**Impact:** Critical (bounce rate spike, brand damage)

**Description:** The Arrival ritual, removal of traditional navigation, and spatial Constellation model are radically different from the existing website. Visitors may find it disorienting, slow, or pretentious. They may bounce immediately, unable to find what they're looking for.

**Trigger:** Beta A/B test shows > 30% bounce rate increase on Gallery OS variant OR visitor feedback indicates confusion/frustration.

**Mitigation:**
1. A/B test at 10% before scaling to 50% before 100%
2. "Skip ritual" option: tap/click during Arrival to jump directly to Constellation
3. "Classic view" toggle: visitors can switch back to a list-based index of works (Constellation text alternative)
4. Progressive enhancement: first-time visitors get full ritual; returning visitors get abbreviated version
5. User testing with 10 representative personas before Beta

**Contingency:** If bounce rate increases > 30% and cannot be resolved within 2 weeks, roll back Gallery OS and revert to existing website. Re-evaluate creative direction.

**Owner:** Creative Director + UX Research Lead

---

### R2: Constellation Engine Cannot Maintain 60fps

**ID:** GOS-RISK-002  
**Category:** Technical / Performance  
**Probability:** Very Likely (60%)  
**Impact:** High (core experience degrades, mobile unusable)

**Description:** Rendering 100+ artwork thumbnails with hairline frames in a WebGL/Canvas spatial field with physics-based pan/zoom may not achieve 60fps on average devices — especially mobile. The Constellation is the centerpiece of the V1.0 experience.

**Trigger:** Frame rate drops below 30fps on iPhone 14 or equivalent Android device while panning at 1× zoom with all 100 works visible.

**Mitigation:**
1. Viewport culling: only render works within viewport + buffer
2. Level-of-detail: distant works render as simple colored rectangles, not thumbnails
3. Progressive loading: L1 (near) = full thumbnails, L2 (mid) = half-res, L3 (far) = dots only
4. WebGL primary with Canvas 2D fallback
5. RequestAnimationFrame with frame budget of 16ms — skip frames if budget exceeded rather than dropping below 30fps
6. Mobile: cap at 50 visible works, larger minimum node size for touch targets, simplified physics (no inertia on low-power devices)

**Contingency:** If 60fps cannot be achieved on desktop or 30fps on mobile after 2 weeks of optimization: (a) reduce default visible works to 50, (b) simplify node rendering (no hairline frames on mobile), (c) as last resort, implement paginated Constellation view (tiled spatial grid) while retaining pan/zoom for desktop.

**Owner:** FE-Gfx Lead + Performance Engineer

---

### R3: Event Bus Latency Causes Animation Stutter

**ID:** GOS-RISK-003  
**Category:** Technical / Architecture  
**Probability:** Likely (45%)  
**Impact:** Medium (Arrival and Threshold animations jank, perceived as unpolished)

**Description:** If event propagation through multiple subscribers takes longer than 16ms (one frame at 60fps), animations in Arrival and Threshold engines will stutter. The museum's first impression will feel unpolished.

**Trigger:** CRITICAL-priority events take > 16ms to deliver to all subscribers.

**Mitigation:**
1. Synchronous delivery for CRITICAL events (no async dispatch)
2. Limit CRITICAL subscribers to essential engines only (Threshold, Room, Performance)
3. Non-critical event processing (Memory writes, Diary updates) deferred via requestIdleCallback
4. EventBus benchmark in CI: fail build if CRITICAL event delivery exceeds 10ms
5. Bundle splitting: each engine is lazy-loaded; only active engines subscribe

**Contingency:** If latency cannot be resolved: implement direct function calls for animation-critical paths (bypass EventBus for Arrival→Threshold→Room transitions). Keep EventBus for non-realtime events.

**Owner:** FE-Infra Lead

---

### R4: Browser Compatibility Issues

**ID:** GOS-RISK-004  
**Category:** Technical  
**Probability:** Possible (30%)  
**Impact:** High (significant portion of visitors cannot use Gallery OS)

**Description:** WebGL rendering for Constellation, Canvas fallback, CSS animations for Arrival/Threshold, IntersectionObserver for Room level transitions, and Service Worker for offline mode may not work consistently across all target browsers — especially Safari on older iOS devices.

**Trigger:** Any V1.0 feature fails on Safari 17+, Chrome 120+, Firefox 125+, or Edge 120+.

**Mitigation:**
1. Browser compatibility matrix defined in Test Plan
2. Feature detection: WebGL → Canvas 2D fallback, Service Worker → online-only mode
3. Polyfill strategy: IntersectionObserver polyfill for older browsers
4. Cross-browser testing in CI (Playwright on all target browsers)
5. Manual testing on real devices: iPhone 14, iPhone SE, iPad, Samsung Galaxy, MacBook, Windows laptop

**Contingency:** If a critical feature cannot be made compatible within 1 week: (a) disable feature for affected browser, serve existing website instead, (b) add browser-specific workaround, (c) as last resort, delay V1.0 until compatibility achieved.

**Owner:** QA Lead + FE-Perf Lead

---

### R5: Accessibility Lawsuit or Regulatory Action

**ID:** GOS-RISK-005  
**Category:** Legal / Accessibility  
**Probability:** Unlikely (10%)  
**Impact:** Critical (legal costs, brand damage, forced takedown)

**Description:** Gallery OS may not meet WCAG 2.2 AA standards at launch. The spatial Constellation and gesture-based navigation present novel accessibility challenges. A lawsuit or regulatory complaint could force the museum offline.

**Trigger:** Formal accessibility complaint received OR independent audit finds WCAG 2.2 AA violations.

**Mitigation:**
1. WCAG 2.2 AA compliance as launch blocker (cannot ship V1.0 without it)
2. Independent accessibility audit before Beta
3. Text-based alternative for every spatial/gesture interaction
4. Keyboard-navigable alternative for every gesture
5. Screen reader testing: VoiceOver (macOS/iOS), NVDA (Windows), TalkBack (Android)
6. Accessibility statement published on the site
7. Legal review of compliance before GA

**Contingency:** If AA compliance cannot be achieved, delay V1.0. Serve existing website (which has basic accessibility) until Gallery OS is compliant.

**Owner:** Accessibility Lead + Legal

---

### R6: Next.js Major Version Upgrade Breaks Gallery OS

**ID:** GOS-RISK-006  
**Category:** Technical / Dependency  
**Probability:** Rare (5%)  
**Impact:** High (migration effort, potential downtime)

**Description:** Gallery OS is built on Next.js 16 (App Router). A future major version upgrade (17, 18) could introduce breaking changes to the App Router, Turbopack, or `next/font` that Gallery OS depends on.

**Trigger:** Next.js 17 released with breaking changes to App Router or Turbopack.

**Mitigation:**
1. Pin Next.js version in package.json (exact version, not range)
2. Test against Next.js canary releases monthly
3. Keep Gallery OS engine code framework-agnostic where possible (engines don't import from `next/*`)
4. Only React components depend on Next.js — engines are pure TypeScript

**Contingency:** If Next.js upgrade is required: (a) allocate 2-week migration sprint, (b) if migration is infeasible, evaluate alternative frameworks (Remix, Astro) while preserving Gallery OS engine code.

**Owner:** FE-Arch Lead

---

### R7: Arabic RTL Delayed Beyond V2.0

**ID:** GOS-RISK-007  
**Category:** Content / Cultural  
**Probability:** Very Likely (65%)  
**Impact:** Medium (Saudi audience underserved, institutional credibility damaged)

**Description:** Arabic RTL support is deferred to V2.0 (Week 60). This means the museum operates English-only for ~18 months after V1.0 launch. For a Saudi institution, this is a significant cultural gap.

**Trigger:** V1.0 launches without Arabic rendering. Saudi media or cultural authorities note the absence.

**Mitigation:**
1. Arabic content rendering (not RTL layout) included in V1.0: artist names, artwork titles in Arabic display alongside English
2. Arabic name rendering uses `dir="rtl"` spans within LTR layout
3. Arabic metadata fields populated from existing `_ar` database fields
4. "Arabic experience coming 2027" message visible to Arabic-language visitors
5. Accelerate Arabic RTL to V1.2 (Week 44) if resources permit

**Contingency:** If Arabic absence causes significant reputational damage: (a) add Arabic static landing page as hotfix, (b) prioritize Arabic RTL to V1.1 (Week 34), trade off Scholar or Ghost Engine features.

**Owner:** Institution Lead + Product Manager

---

### R8: Weekly Reinstallation Cron Fails Silently

**ID:** GOS-RISK-008  
**Category:** Technical / Operations  
**Probability:** Possible (25%)  
**Impact:** Medium (museum shows stale installation, appears unmaintained)

**Description:** The Monday 06:00 cron job that runs the Curator Engine selection algorithm fails silently — the museum shows last week's Hundred. Visitors perceive the museum as abandoned or broken. "Reinstalled every Monday" is a core value proposition.

**Trigger:** Installation unchanged for > 24 hours past Monday 06:00.

**Mitigation:**
1. Health check endpoint: `/api/gallery-os/installation-status` returns current installation ID and timestamp
2. Monitoring alert: if installation timestamp > 8 hours old, page on-call engineer
3. Manual trigger: admin can trigger reinstallation via `/admin` panel
4. Atomic deployment: new installation is fully computed before old one is replaced
5. Fallback: if reinstallation fails, keep current installation (never show empty museum)

**Contingency:** If cron fails repeatedly: (a) move from cron to a managed scheduler (e.g., Vercel Cron Jobs, AWS EventBridge), (b) implement redundant trigger (two independent systems fire the event), (c) manual trigger as emergency fallback.

**Owner:** Infra Lead

---

### R9: Key Engineer Attrition

**ID:** GOS-RISK-009  
**Category:** Team / Project  
**Probability:** Unlikely (10%)  
**Impact:** Medium (schedule delay, knowledge loss)

**Description:** Gallery OS is a complex system. If the lead Constellation or Room engineer leaves, replacement requires significant ramp-up time.

**Trigger:** Any core engineer departs during V1.0 development.

**Mitigation:**
1. All engine code is documented (JSDoc on every public method)
2. Architecture Decision Records (ADRs) for all significant design choices
3. Pair programming on Constellation and Room engines (no single-point-of-failure knowledge)
4. Code review: at least one other engineer must understand every engine
5. Onboarding guide: new engineer can make their first commit within 3 days

**Contingency:** If lead engineer departs: (a) re-assign from parallel track, (b) extend timeline by 2-4 weeks, (c) reduce V1.0 scope (defer lowest-priority engine to V1.1).

**Owner:** Engineering Manager

---

### R10: Route Conflicts — Existing Pages vs. Gallery OS

**ID:** GOS-RISK-010  
**Category:** Technical / Migration  
**Probability:** Unlikely (15%)  
**Impact:** Medium (broken links, 404s, SEO impact)

**Description:** As Gallery OS progressively replaces existing routes, conflicts may arise. A Gallery OS route may shadow an existing Next.js route. Redirects may break. Legacy links from external sites may 404.

**Trigger:** Any route returns 404 after Gallery OS migration.

**Mitigation:**
1. Incremental route migration: one route at a time, verified in staging
2. Redirect map: all legacy routes that change are 301 redirected
3. Route audit before each release: curl all routes, verify 200
4. A/B test: Gallery OS routes only served to A/B test group initially
5. Monitoring: 404 rate tracked; alert if rate increases > 5%

**Contingency:** If route conflicts discovered in production: (a) immediate rollback of affected route, (b) add redirect, (c) re-deploy.

**Owner:** FE-Arch Lead

---

### R11: Visitor Data Loss (Memory/Diary Engines)

**ID:** GOS-RISK-011  
**Category:** Technical / Data  
**Probability:** Possible (15%)  
**Impact:** Critical (loss of visitor trust, potential GDPR/data-protection issues)

**Description:** Memory Engine stores encounter data in localStorage (V1.0) and encrypted cloud sync (V1.2). Data loss — through localStorage clearing, sync failure, or corruption — would lose a visitor's Diary, encounter history, and bookmarks. For returning visitors who have built a relationship with the museum, this is devastating.

**Trigger:** Any incident where visitor data is lost or corrupted.

**Mitigation:**
1. V1.0: localStorage only. No cloud sync. Risk is limited to browser data clearing (expected behavior).
2. V1.2: encrypted cloud sync with conflict resolution. Local data is source of truth. Cloud is backup.
3. Export feature: visitors can download their Diary as JSON
4. Data integrity checks: validate data on read, repair if possible
5. Privacy: no PII stored. All data is anonymous session ID only.

**Contingency:** If data loss occurs: (a) notify affected visitors via next visit (in-museum notification), (b) offer to regenerate suggestions from anonymized aggregate data, (c) root cause analysis and fix within 48 hours.

**Owner:** FE-Infra Lead + Security Lead

---

### R12: CSS Bundle Bloat from Legacy Styles

**ID:** GOS-RISK-012  
**Category:** Technical / Performance  
**Probability:** Very Likely (80%)  
**Impact:** Low (slightly larger CSS bundle, no functional impact)

**Description:** `globals.css` contains ~1200 lines of legacy CSS (`.home-hero`, `.homepage-showcase`, etc.) that are no longer referenced by any markup. These increase the CSS bundle size by ~15-20KB. Not critical, but wasteful.

**Trigger:** CSS bundle exceeds 50KB (gzipped).

**Mitigation:**
1. CSS audit: identify all unused selectors (PurgeCSS or manual review)
2. Legacy styles extracted to `legacy.css`, loaded only on non-migrated routes
3. New Gallery OS styles kept minimal and scoped
4. CSS bundle budget: 30KB gzipped for Gallery OS critical CSS

**Contingency:** Not a blocking issue. Address during V1.1 cleanup sprint.

**Owner:** FE-Perf Lead

---

### R13: Serverside Rendering (SSR) Conflicts with Client-Only Engines

**ID:** GOS-RISK-013  
**Category:** Technical / Architecture  
**Probability:** Possible (20%)  
**Impact:** Medium (hydration mismatches, visual flicker, SEO impact)

**Description:** Several Gallery OS engines (Arrival, Constellation, Room L4 Microscope) are inherently client-side — they depend on Canvas, WebGL, animations, and browser APIs. Next.js App Router defaults to Server Components. Hydration mismatches may occur if server-rendered HTML differs from client-rendered output.

**Trigger:** React hydration warning in console OR visible layout shift on page load.

**Mitigation:**
1. Gallery OS engine components are explicitly Client Components (`'use client'`)
2. Server Components handle data fetching only — pass data as props to Client Components
3. Constellation: server-renders a static placeholder (loading state), client hydrates with interactive canvas
4. Arrival: server-renders initial black screen, client runs ritual animation
5. Hydration test: verify no hydration warnings in any route

**Contingency:** If hydration issues persist: (a) use `dynamic(() => import(...), { ssr: false })` for Constellation, (b) serve static fallback for non-JS visitors, (c) progressive enhancement: basic HTML works without JS, Gallery OS enhances with JS.

**Owner:** FE-Arch Lead

---

### R14: Font Loading Flash (FOUT/FOIT)

**ID:** GOS-RISK-014  
**Category:** Technical / Typography  
**Probability:** Likely (50%)  
**Impact:** Low (brief visual glitch, resolved within 1-2 seconds)

**Description:** IBM Plex Sans loaded via `next/font` uses `font-display: swap`. Visitors may briefly see the fallback system font before IBM Plex Sans loads. For a typography-driven experience, this flash undermines the luxury perception.

**Trigger:** Visible font change during page load.

**Mitigation:**
1. `next/font` with `display: 'swap'` is optimal — better to show text in fallback font than hide text
2. Font subsetting: latin + Arabic subsets only (no Cyrillic, Greek, etc.)
3. Font preloading: `<link rel="preload">` for critical font weights (400, 500)
4. Fallback font tuning: adjust `size-adjust` and `ascent-override` in `@font-face` to minimize layout shift

**Contingency:** Not a blocking issue. FOUT is preferable to FOIT (Flash of Invisible Text). Accept as trade-off.

**Owner:** FE-Perf Lead

---

### R15: Temporary SEO Impact During Migration

**ID:** GOS-RISK-015  
**Category:** Business / SEO  
**Probability:** Possible (35%)  
**Impact:** Low (temporary ranking dip, recovers within weeks)

**Description:** Gallery OS replaces static pages with client-rendered experiences. Search engine crawlers may not execute JavaScript or may index partial content. Organic traffic may dip temporarily.

**Trigger:** > 10% drop in organic search traffic within 4 weeks of V1.0 launch.

**Mitigation:**
1. Server-side rendering for all content (SSR via Next.js)
2. Static generation for key pages (Arrival, Room of One)
3. Sitemap updated with Gallery OS routes
4. Structured data (Schema.org Museum, VisualArtwork) on all work pages
5. Canonical URLs maintained (route paths unchanged)
6. Google Search Console monitoring

**Contingency:** If organic traffic drops > 20%: (a) audit rendered HTML for crawlability, (b) add static fallback pages for search engines, (c) request re-indexing via Search Console.

**Owner:** FE-Arch Lead + SEO Specialist

---

## Risk Summary

| ID | Risk | Probability | Impact | Severity | Mitigation Status |
|---|---|---|---|---|---|
| R1 | Visitor rejection | Likely (50%) | Critical | HIGH | Mitigated: A/B test + skip ritual + classic view |
| R2 | Constellation performance | Very Likely (60%) | High | HIGH | Mitigated: Viewport culling + LOD + frame budget |
| R3 | EventBus latency | Likely (45%) | Medium | MEDIUM | Mitigated: Synchronous critical path |
| R4 | Browser compatibility | Possible (30%) | High | MEDIUM | Mitigated: Cross-browser CI + feature detection |
| R5 | Accessibility lawsuit | Unlikely (10%) | Critical | MEDIUM | Mitigated: AA compliance as launch blocker |
| R6 | Next.js upgrade | Rare (5%) | High | LOW | Mitigated: Version pinning + framework-agnostic engines |
| R7 | Arabic RTL delay | Very Likely (65%) | Medium | MEDIUM | Mitigated: Arabic content in V1.0, RTL in V2.0 |
| R8 | Cron failure | Possible (25%) | Medium | MEDIUM | Mitigated: Health check + alert + manual trigger |
| R9 | Engineer attrition | Unlikely (10%) | Medium | LOW | Mitigated: Documentation + pair programming |
| R10 | Route conflicts | Unlikely (15%) | Medium | LOW | Mitigated: Incremental migration + redirects |
| R11 | Data loss | Possible (15%) | Critical | HIGH | Mitigated: Export feature + data integrity checks |
| R12 | CSS bloat | Very Likely (80%) | Low | LOW | Accepted: addressed in V1.1 |
| R13 | SSR conflicts | Possible (20%) | Medium | MEDIUM | Mitigated: Client Components + hydration testing |
| R14 | Font flash | Likely (50%) | Low | LOW | Accepted: FOUT is preferable to FOIT |
| R15 | SEO dip | Possible (35%) | Low | LOW | Mitigated: SSR + structured data + sitemap |
