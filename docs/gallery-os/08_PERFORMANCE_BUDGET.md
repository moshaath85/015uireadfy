# Gallery OS — Performance Budget

**Version:** 1.0  
**Status:** Approved — Enforcement begins V1.0 Alpha

---

## Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor | Gallery OS Target |
|---|---|---|---|---|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | 2.5s – 4.0s | > 4.0s | < 2.0s |
| **INP** (Interaction to Next Paint) | ≤ 200ms | 200ms – 500ms | > 500ms | < 150ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1 – 0.25 | > 0.25 | < 0.05 |
| **TTFB** (Time to First Byte) | ≤ 800ms | 800ms – 1800ms | > 1800ms | < 600ms |

---

## Key User Timings

| Milestone | Target | Measurement |
|---|---|---|
| Arrival — first paint | < 200ms | Performance API |
| Arrival — ritual complete (first visit) | 3.8s ± 100ms | Programmatic |
| Arrival — ritual complete (return visit) | 2.5s ± 100ms | Programmatic |
| Arrival — Room of One visible | Ritual + 1.5s threshold | Programmatic |
| Room — L1 to L2 scroll transition | < 50ms to start, 400ms animation | IntersectionObserver + animation frame |
| Constellation — first interactive | < 3.0s from page load | Performance API |
| Constellation — work node select to Room entry | 2.5s (threshold duration) | Programmatic |
| Threshold — any transition variant | Exactly spec duration ± 50ms | Programmatic |

---

## Bundle Budgets

### JavaScript

| Bundle | Route | Max (minified) | Max (gzipped) |
|---|---|---|---|
| Gallery OS Runtime (shared) | All | 40KB | 15KB |
| Arrival Engine | `/` | 25KB | 10KB |
| Threshold Engine (shared) | All | 12KB | 5KB |
| Room Engine | `/artworks/[slug]` | 35KB | 14KB |
| Constellation Engine | `/constellation` | 60KB | 22KB |
| Curator Engine (server) | Server-only | 30KB | 12KB |
| **Total first load** | `/` | **< 100KB** | **< 40KB** |
| **Total full experience** | All | **< 250KB** | **< 100KB** |

### CSS

| Bundle | Route | Max (minified) | Max (gzipped) |
|---|---|---|---|
| Design tokens | All | 4KB | 1.5KB |
| Gallery OS critical | All | 20KB | 7KB |
| Room Engine styles | `/artworks/[slug]` | 8KB | 3KB |
| Constellation styles | `/constellation` | 6KB | 2KB |
| Legacy compatibility | Non-migrated routes | 15KB | 5KB |
| **Total first load** | `/` | **< 25KB** | **< 10KB** |

### Fonts

| Font | Weights | Max (WOFF2) | Subset |
|---|---|---|---|
| IBM Plex Sans | 400, 500 | 35KB + 30KB | Latin |
| IBM Plex Sans Arabic | 400, 500 | 40KB + 35KB | Arabic |
| Display serif (TBD) | 400 | 30KB | Latin |
| **Total font load** | | **< 170KB** | (loaded progressively) |

### Images

| Image Type | Max Resolution | Max File Size | Format |
|---|---|---|---|
| Artwork thumbnail (L3 Constellation) | 140px shortest edge | 15KB | WebP |
| Artwork thumbnail (L2 Constellation) | 280px shortest edge | 40KB | WebP |
| Artwork display (L1 Constellation, Room L1) | 800px shortest edge | 200KB | WebP |
| Artwork zoom (Room L4 Microscope) | 2400px shortest edge | 2MB | JPEG (tiled) |
| Gigapixel (Room L4, on-demand) | Native resolution | No limit | JPEG tiles |
| Hero image (Arrival background) | 1920px wide | 300KB | WebP |
| Artist portrait (thumbnail) | 200px × 250px | 25KB | WebP |
| Artist portrait (detail) | 600px × 750px | 100KB | WebP |
| Institution monogram | SVG | < 2KB | SVG |

### Image Budget per Page Load

| Page | Max Image Bytes (before lazy load) |
|---|---|
| Arrival + Room of One | < 350KB (1 hero image + 1 artwork display) |
| Constellation (initial view) | < 200KB (near-viewport works only) |
| Room (all levels) | < 500KB (L1 display + L4 preload + related thumbnails) |

---

## Lighthouse Targets

| Category | Gallery OS V1.0 Target | Current Baseline |
|---|---|---|
| Performance | > 85 | ~82 |
| Accessibility | > 95 | ~71 |
| Best Practices | > 90 | Not tested |
| SEO | > 90 | Not tested |

---

## Device Performance Tiers

### Tier 1 — High Performance (Desktop, flagship mobile)
**Target:** 60fps Constellation, all animations, full-resolution images
**Devices:** MacBook Pro M1+, iPhone 14 Pro+, iPad Pro, high-end Android, Windows desktop with dedicated GPU

### Tier 2 — Standard Performance (Mid-range mobile, older desktop)
**Target:** 45fps Constellation, all animations, adaptive resolution
**Devices:** iPhone 12-13, iPad Air, mid-range Android, MacBook Air, 3-year-old Windows laptop

### Tier 3 — Low Performance (Budget mobile, very old devices)
**Target:** 30fps Constellation, reduced animations, lower resolution images, Canvas 2D fallback
**Devices:** iPhone SE (2020), budget Android, 5+ year old laptops

**Detection:** `navigator.hardwareConcurrency`, `navigator.deviceMemory`, and frame rate sampling on first Constellation render.

---

## Network Performance Tiers

| Tier | Connection | Image Resolution | Constellation Detail | Preloading |
|---|---|---|---|---|
| Fast | > 10 Mbps | Full (800px display) | L1+L2 nearby | Next work preloaded |
| Medium | 3-10 Mbps | Medium (400px display) | L1 only nearby | No preloading |
| Slow | < 3 Mbps | Low (280px display) | L1 only immediate viewport | No preloading |
| Offline | 0 Mbps | Cached only | Cached only | Service Worker cache |

**Detection:** Network Information API (`navigator.connection.effectiveType`) with download speed sampling.

---

## CI Enforcement

| Check | Trigger | Action on Failure |
|---|---|---|
| Bundle size | Every PR | Block merge if exceeds budget by > 5% |
| Lighthouse Performance | Every PR | Warning if < 80. Block merge if < 70. |
| Lighthouse Accessibility | Every PR | Block merge if < 90 |
| Core Web Vitals (LCP) | Every PR (staging) | Warning if > 3.0s. Block merge if > 4.0s. |
| Core Web Vitals (CLS) | Every PR (staging) | Block merge if > 0.15 |
| Image size budget | Every PR | Block merge if any image exceeds per-page budget |
| FPS benchmark | Weekly (staging) | Warning if Constellation < 50fps desktop. Block release if < 30fps. |

---

## Monitoring (Production)

| Metric | Tool | Alert Threshold |
|---|---|---|
| LCP (p75) | Vercel Analytics / RUM | > 3.0s over 1 hour |
| INP (p75) | Vercel Analytics / RUM | > 300ms over 1 hour |
| CLS (p75) | Vercel Analytics / RUM | > 0.15 over 1 hour |
| Error rate | Sentry / Vercel | > 1% of sessions |
| 404 rate | Vercel / CloudFront | > 5% of requests |
| Constellation FPS (p50) | Custom RUM | < 30fps on mobile over 1 hour |
| Reinstallation status | Custom health check | Installation > 24h old |
| Bundle size | Bundle analyzer in CI | > 110% of budget |

---

## Budget Review Cadence

- **Weekly:** Review RUM dashboard. Adjust image quality or preloading if Core Web Vitals regress.
- **Per Release:** Full performance audit. Lighthouse, WebPageTest, real device benchmarks.
- **Quarterly:** Re-evaluate budgets. Can images be larger now that average bandwidth has increased? Can budgets be tightened?
