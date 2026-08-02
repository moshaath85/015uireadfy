# Gallery OS — Engine Dependency Graph

**Version:** 1.0  
**Author:** TEX7 Architecture  
**Status:** Approved

---

## Dependency Matrix

### Legend
- **HARD** — Cannot function without this dependency. Must be built first or in parallel with stubs.
- **SOFT** — Enhanced by this dependency. Can function with degraded capability.
- **NONE** — No dependency.

| Engine | Arrival | Thresh. | Journey | Room | Constell. | Memory | Diary | Garden | Curator | Scholar | Collector | Publish | Archive | Ghost | Silence | Rhythm | Institut. | Access. | Perform. | Identity |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Arrival** | - | SOFT | NONE | SOFT | NONE | SOFT | HARD | NONE | NONE | NONE | NONE | NONE | NONE | NONE | NONE | HARD | HARD | HARD | HARD | HARD |
| **Threshold** | NONE | - | SOFT | SOFT | SOFT | NONE | NONE | NONE | NONE | NONE | NONE | NONE | NONE | NONE | NONE | NONE | SOFT | HARD | HARD | SOFT |
| **Journey** | NONE | HARD | - | HARD | SOFT | SOFT | SOFT | NONE | HARD | NONE | NONE | NONE | NONE | NONE | NONE | SOFT | SOFT | HARD | HARD | SOFT |
| **Room** | NONE | HARD | SOFT | - | SOFT | SOFT | SOFT | NONE | SOFT | SOFT | SOFT | NONE | NONE | NONE | NONE | SOFT | SOFT | HARD | HARD | SOFT |
| **Constellation** | NONE | HARD | SOFT | HARD | - | SOFT | SOFT | NONE | HARD | NONE | SOFT | NONE | NONE | HARD | NONE | SOFT | SOFT | HARD | HARD | SOFT |
| **Memory** | SOFT | NONE | SOFT | SOFT | SOFT | - | HARD | SOFT | SOFT | SOFT | SOFT | SOFT | SOFT | SOFT | SOFT | SOFT | SOFT | NONE | SOFT | SOFT |
| **Diary** | SOFT | NONE | SOFT | SOFT | SOFT | HARD | - | SOFT | SOFT | NONE | NONE | NONE | SOFT | NONE | SOFT | SOFT | SOFT | NONE | NONE | SOFT |
| **Garden** | NONE | NONE | NONE | NONE | NONE | SOFT | NONE | - | NONE | NONE | NONE | NONE | NONE | NONE | NONE | HARD | SOFT | HARD | SOFT | SOFT |
| **Curator** | NONE | NONE | HARD | SOFT | HARD | HARD | HARD | NONE | - | SOFT | NONE | NONE | HARD | HARD | NONE | HARD | HARD | NONE | NONE | SOFT |
| **Scholar** | NONE | NONE | NONE | HARD | NONE | HARD | NONE | NONE | HARD | - | NONE | NONE | HARD | NONE | NONE | NONE | NONE | NONE | NONE | NONE |
| **Collector** | NONE | NONE | NONE | HARD | SOFT | HARD | SOFT | NONE | NONE | NONE | - | NONE | NONE | NONE | NONE | NONE | HARD | NONE | NONE | SOFT |
| **Publishing** | NONE | NONE | NONE | NONE | NONE | SOFT | SOFT | NONE | SOFT | SOFT | NONE | - | HARD | NONE | NONE | NONE | HARD | HARD | HARD | HARD |
| **Archive** | NONE | NONE | NONE | NONE | SOFT | HARD | NONE | NONE | SOFT | HARD | NONE | SOFT | - | HARD | NONE | NONE | SOFT | HARD | HARD | NONE |
| **Ghost** | NONE | NONE | NONE | NONE | HARD | HARD | NONE | NONE | HARD | NONE | NONE | NONE | HARD | - | NONE | NONE | SOFT | NONE | HARD | NONE |
| **Silence** | NONE | NONE | NONE | HARD | NONE | SOFT | SOFT | NONE | NONE | NONE | NONE | NONE | NONE | NONE | - | HARD | SOFT | HARD | HARD | HARD |
| **Rhythm** | SOFT | SOFT | SOFT | SOFT | SOFT | SOFT | SOFT | HARD | HARD | NONE | NONE | NONE | NONE | NONE | HARD | - | HARD | NONE | NONE | SOFT |
| **Institution** | HARD | HARD | HARD | HARD | HARD | HARD | HARD | HARD | HARD | HARD | HARD | HARD | HARD | HARD | HARD | HARD | - | NONE | NONE | HARD |
| **Accessibility** | HARD | HARD | HARD | HARD | HARD | SOFT | NONE | HARD | NONE | NONE | NONE | HARD | HARD | NONE | HARD | NONE | NONE | - | SOFT | NONE |
| **Performance** | HARD | HARD | HARD | HARD | HARD | SOFT | NONE | SOFT | NONE | NONE | NONE | HARD | HARD | HARD | HARD | NONE | NONE | SOFT | - | NONE |
| **Identity** | HARD | HARD | HARD | HARD | HARD | SOFT | HARD | HARD | HARD | HARD | HARD | HARD | SOFT | SOFT | HARD | HARD | HARD | HARD | HARD | - |

---

## Critical Path (V1.0)

```
WEEK 1-2
  Institution Engine ──┐
  Identity Engine ─────┤
  Accessibility Engine ─┼──→ Core Runtime (Event Bus + Engine Registry + Session)
  Performance Engine ───┘

WEEK 3-4
  Core Runtime ──→ Memory Engine (stub) ──→ Diary Engine (stub)
                ──→ Rhythm Engine (basic: time-of-day only)
                ──→ Arrival Engine
                ──→ Threshold Engine

WEEK 5-8
  Threshold Engine ──→ Room Engine (L1-L3)
  Curator Engine (stub: static data)
  Arrival Engine ──→ Room of One integration

WEEK 9-12
  Room Engine ──→ Constellation Engine (basic: render, pan, zoom, select)
  Curator Engine (real: selection algorithm, weekly cron)

WEEK 13-16
  Curator Engine ──→ Weekly reinstallation
  Rhythm Engine ──→ Daily behavior integration
  All engines ──→ Integration testing

WEEK 17-24
  Integration ──→ Alpha ──→ Beta ──→ RC1 ──→ V1.0 GA
```

## Parallel Work Opportunities (V1.0)

### Track A — Core Infrastructure (Weeks 1-4)
- Institution Engine
- Identity Engine
- Accessibility Engine
- Performance Engine
- Event Bus
- Engine Registry
- Visitor Session

### Track B — Experience Engines (Weeks 3-12)
**After Track A completes Event Bus:**
- Arrival Engine + Threshold Engine (weeks 3-6)
- Room Engine L1-L3 (weeks 5-10)
- Constellation Engine basic (weeks 9-14)

### Track C — Intelligence Engines (Weeks 5-16)
**After Track A completes, in parallel with Track B:**
- Curator Engine selection algorithm (weeks 5-10)
- Rhythm Engine daily/weekly (weeks 7-12)
- Memory Engine stub (weeks 3-4)
- Diary Engine stub (weeks 4-5)

### Track D — Existing Site Maintenance (Weeks 1-24, ongoing)
- Keep existing Gallery 015 running
- Progressive route replacement
- A/B test framework
- Rollback infrastructure

---

## Blocked Work

| Work | Blocked By | Unblock Date (est.) | Mitigation |
|---|---|---|---|
| Room Engine L4-L5 | Room Engine L1-L3 complete | Week 10 | L4-L5 designed but not implemented until V1.1 |
| Journey Engine | Room + Constellation + Curator | Week 16 | Journeys designed, V1.0 ships without (V1.1) |
| Silence Engine | Room Engine + Rhythm | Week 16 | Silence designed, V1.0 ships without (V1.2) |
| Garden Engine | Rhythm Engine | Week 16 | Garden designed, V1.0 ships without (V1.2) |
| Ghost Engine | Constellation + Memory + Archive | Week 16+ | Ghost designed, V1.0 ships without (V1.1) |
| Arabic RTL full | Identity + all engines | Week 24+ | Bilingual data model exists. RTL deferred to V2.0. |
| Collector Engine | Room + Memory + Institution | Week 16+ | Collector designed, V1.0 ships without (V1.1) |
| Publishing Engine | Institution + Accessibility + Performance | Week 16+ | Publishing designed, V1.0 ships without (V1.1) |
| Archive Engine | Memory + Curator | Week 16+ | Archive designed, V1.0 ships without (V2.0) |

---

## Risk Hotspots

### HIGH: Constellation Engine Performance
**Risk:** Spatial canvas with 100+ works might not maintain 60fps on mobile devices.
**Dependency impact:** Blocks Room (select work), Journey (visual path), Ghost (overlay).
**Mitigation:** Progressive loading, viewport culling, WebGL fallback to Canvas, 30fps minimum target. Prototype in Week 8 before full commitment.

### HIGH: Event Bus Latency
**Risk:** If event propagation exceeds 16ms, Arrival and Threshold animations will stutter.
**Dependency impact:** Blocks all experience engines.
**Mitigation:** Synchronous critical-path events (Arrival, Threshold). Asynchronous non-critical (Memory writes, Diary updates). Benchmark Week 2.

### MEDIUM: Institution Engine Configuration Complexity
**Risk:** Too many configuration options make Gallery 015 feel like a platform rather than a museum.
**Dependency impact:** All engines depend on Institution config.
**Mitigation:** Sensible defaults. Gallery 015 config is the reference. Other institutions override only what they need. No configuration UI in V1.0 — config is a JSON file.

### MEDIUM: Weekly Reinstallation Cron Reliability
**Risk:** Cron job fails silently. Museum shows stale installation.
**Dependency impact:** Constellation and Room of One would show old data.
**Mitigation:** Health check endpoint. Monitoring alert. Fallback: manual trigger. Installation is atomic (old installation stays live until new one is fully deployed).

### LOW: Next.js App Router Compatibility
**Risk:** Existing App Router conventions may conflict with Gallery OS spatial navigation model.
**Dependency impact:** Route design.
**Mitigation:** Gallery OS engines render as client components within Next.js. App Router handles data fetching; Engine runtime handles spatial logic. Clear separation.

---

## Engine Build Order (V1.0)

```
1. Institution Engine          (Week 1)
2. Identity Engine             (Week 1)
3. Event Bus + Engine Registry (Week 1-2)
4. Visitor Session Manager     (Week 2)
5. Accessibility Engine        (Week 1, ongoing)
6. Performance Engine          (Week 1, ongoing)
7. Memory Engine (stub)        (Week 3)
8. Rhythm Engine (basic)       (Week 3-4)
9. Threshold Engine            (Week 4-5)
10. Arrival Engine             (Week 5-6)
11. Room Engine (L1-L3)        (Week 6-9)
12. Curator Engine (basic)     (Week 9-11)
13. Constellation Engine       (Week 11-14)
14. Curator Engine (reinstall) (Week 14-15)
15. Diary Engine (stub)        (Week 5)
16. Integration testing        (Week 16-18)
```
