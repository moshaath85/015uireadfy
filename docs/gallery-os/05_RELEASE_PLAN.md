# Gallery OS — Release Plan

**Version:** 1.0  
**Status:** Approved

---

## Release Philosophy

Gallery OS follows a **progressive delivery** model:
- Every release is backward-compatible with the existing Gallery 015 website
- Engines are deployed incrementally — existing routes continue functioning until their Gallery OS replacement is stable
- A/B testing gates every major change
- Rollback is instant (cookie-based feature flag)

---

## Release: Alpha (Week 18)

**Objective:** Internal validation. All V1.0 engines operational in staging.

### Features
- Core Runtime: Event Bus, Engine Registry, Visitor Session
- Institution Engine with Gallery 015 config
- Identity Engine (English only, LTR only)
- Arrival Engine (new visit ritual, return visit variant)
- Threshold Engine (all 4 transition variants)
- Room Engine (Levels 1-3) on `/artworks/[slug]`
- Constellation Engine (basic) on `/constellation`
- Curator Engine (selection + positioning, manual trigger only)
- Rhythm Engine (time-of-day, Monday cron disabled)
- Memory Engine (localStorage, stub)
- Diary Engine (stub — no UI)
- Accessibility Engine (preferences, skip-link, focus-ring)
- Performance Engine (image pipeline, monitoring)

### Testing
- All unit tests pass (> 90% coverage on new code)
- All integration tests pass
- Manual QA: full visitor journey on Chrome desktop
- Lighthouse audit: Performance > 80, Accessibility > 90
- No regression on existing non-migrated routes

### Migration
- `/` routes to Arrival Engine (replaces current homepage)
- `/artworks/[slug]` routes to Room Engine (replaces current artwork detail)
- `/constellation` new route (no existing route to replace)
- All other routes unchanged (artists, exhibitions, collections, projects, news, publications, services, contact, about, visit, verify)
- Existing header/footer remain on non-migrated routes

### Risk
- Arrival ritual may feel slow to returning visitors → A/B test will validate
- Constellation performance on mobile unknown → must test on real devices before Beta

---

## Release: Beta (Week 20)

**Objective:** Limited external validation. 10% of visitors see Gallery OS via A/B test.

### Features
- All Alpha features
- Weekly reinstallation cron enabled (Monday 06:00)
- Room of One changes weekly
- Daily rhythm active (morning/afternoon/evening/night)
- Bug fixes from Alpha QA

### Testing
- A/B test: compare engagement metrics between existing site (90%) and Gallery OS (10%)
- Real visitor monitoring: RUM data for LCP, CLS, INP
- Error tracking: Sentry or equivalent for unhandled exceptions
- Mobile testing: real iPhone and Android devices

### Rollback Criteria
- Page load time > 3s on 4G (Gallery OS variant)
- Error rate > 1% on Gallery OS variant
- Bounce rate increase > 20% on Gallery OS variant
- Any critical bug blocking visitor journey

### Rollback Process
1. Set A/B cookie to 0% Gallery OS (all visitors see existing site)
2. Deploy hotfix if code fix is straightforward
3. Full rollback: revert `src/app/page.tsx` and `src/app/artworks/[slug]/page.tsx` to pre-Gallery OS versions

---

## Release: RC1 (Week 22)

**Objective:** Bug fixes, accessibility polish, performance optimization. 50% A/B.

### Features
- All Beta features
- Accessibility fixes from Beta audit
- Performance optimizations from RUM data
- Constellation: keyboard navigation complete
- Room: screen reader announcements for level changes
- Constellation: text-based alternative view

### Testing
- Full accessibility audit (WCAG 2.2 AA)
- Performance audit (Core Web Vitals)
- Cross-browser: Chrome, Safari, Firefox, Edge (latest 2 versions)
- Mobile: iOS 17+, Android 14+

---

## Release: Version 1.0 GA (Week 24)

**Objective:** Production release. Gallery OS is the default experience.

### Features
- All RC1 features
- A/B test removed (100% Gallery OS)
- Legacy routes begin deprecation (continue functioning, marked as "legacy")
- Full Arabic name rendering (content only, not RTL layout)

### Testing
- Production smoke test: full journey on all supported browsers
- Monitoring: error rate, LCP, bounce rate, journey completion rate
- Rollback plan tested and documented

### Migration
- All visitor traffic routes through Gallery OS
- Non-migrated pages (artists index, exhibitions, collections, projects, news, services, contact, about, visit, verify) continue with existing UI + Gallery OS header (Identity Engine)
- Legacy header/footer CSS remains for non-migrated pages
- No data migration required (Gallery OS reads from existing Prisma repositories)

---

## Release: Version 1.1 (Week 34, Q1 2027)

**Objective:** Editorial depth and scholar features.

### Features
- Room Engine Levels 4-5 (Microscope zoom, Related works strip)
- Scholar Engine (provenance, bibliography, citation tools)
- Ghost Engine (past exhibition overlays on Constellation)
- Publishing Engine (Journal on black ground, article reading experience)
- Journey Engine (basic: The Encounter, The Lecture)
- Collector Engine (basic: contextual inquiry, private virtual wall)

---

## Release: Version 1.2 (Week 44, Q2 2027)

**Objective:** Memory, personalization, and temporal features.

### Features
- Memory Engine (full: cloud sync, encrypted, opt-in)
- Diary Engine (full: personal space, monthly letters, journey suggestions)
- Silence Engine (night mode, separate museum experience)
- Garden Engine (digital rest space, seasonal adaptation)
- Rhythm Engine (seasonal: Ramadan, Eid, National Day configurations)

---

## Release: Version 2.0 (Week 60, Q3-Q4 2027)

**Objective:** Complete digital museum. Arabic RTL. Multi-device.

### Features
- Arabic RTL: full bilingual rendering, language switching, Arabic-first flows
- Constellation advanced: connections, clusters, exhibition regions, time scrub
- Journey Engine advanced: personal journeys, The Meditation, The Survey
- Archive Engine: complete collection search, past installation browser
- Performance Engine advanced: Service Worker offline mode, adaptive quality
- Accessibility Engine advanced: screen reader Constellation, voice commands
- Multi-device: mobile-first gestures, tablet optimization

---

## Release: Version 2.1 (Week 72, Q1-Q2 2028)

### Features
- Institution management dashboard
- Multi-institution identity switching (visitor)
- Cross-institution journeys
- White-label configuration for partner institutions

---

## Release: Version 3.0 (Week 96, Q3-Q4 2028)

### Features
- Self-service institution onboarding
- No-code institution configuration UI
- Multi-tenant data isolation
- Subscription and billing management
- Plugin API for custom engines
- Marketplace for third-party extensions
- Federation: cross-institution content sharing

---

## Release Cadence

| Release Type | Frequency | Example |
|---|---|---|
| Hotfix | As needed (critical bugs only) | V1.0.1 |
| Patch | Bi-weekly (bug fixes) | V1.0.2 |
| Minor | Quarterly (new engines, features) | V1.1, V1.2 |
| Major | 6-12 months (platform changes) | V2.0, V3.0 |

---

## Rollback Protocol (Every Release)

1. A/B test framework remains active until 2 weeks post-GA
2. Rollback trigger: critical bug affecting > 1% of visitors OR complete visitor journey broken
3. Rollback execution: set `gallery-os-enabled` cookie to `false` for all visitors (CloudFront/Edge function)
4. Rollback verification: confirm existing site is serving correctly within 5 minutes
5. Post-rollback: root cause analysis within 24 hours, fix within 48 hours, re-release
