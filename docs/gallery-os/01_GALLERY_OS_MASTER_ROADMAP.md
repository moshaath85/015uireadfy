# Gallery OS — Master Roadmap

**Version:** 1.0  
**Author:** TEX7 Engineering  
**Status:** Approved  
**Last Updated:** August 2026

---

## Executive Summary

Gallery OS is a reusable Museum Experience Engine. Gallery 015 is the first production deployment. This roadmap defines the journey from current production baseline to a multi-tenant cultural platform capable of powering museums, galleries, archives, and foundations globally.

---

## Version 1.0 — The Foundation (Q3-Q4 2026)

### Objective
Ship Gallery OS Core on top of the existing Gallery 015 production baseline. The visitor experiences a digital museum — not a website. Every interaction is spatial, temporal, and emotional.

### Scope
- Core Engines: Arrival, Threshold, Room (Levels 1-3), Constellation (basic), Curator (selection + weekly reinstallation), Rhythm (daily), Institution, Identity, Accessibility, Performance
- The existing website continues to function during migration
- New engines are added as incremental routes — existing routes are progressively replaced
- No data migration required. Engines consume existing Prisma repositories.

### Key Deliverables
| Deliverable | Description |
|---|---|
| Gallery OS Core Runtime | Event bus, engine registry, state management, visitor session |
| Arrival + Threshold Engines | The gateway experience replacing static homepage |
| Room Engine (L1-L3) | Artwork detail as spatial room with editorial depth |
| Constellation Engine (basic) | Spatial collection browser (2D Canvas, pan/zoom) |
| Curator Engine (selection) | Weekly Hundred algorithm, Room of One selection |
| Rhythm Engine (daily) | Time-of-day behavior, Monday reinstallation |
| Identity + Institution Engines | Gallery 015 identity configuration, bilingual foundation |
| Accessibility + Performance Engines | WCAG 2.2 AA, Core Web Vitals targets |

### Milestones
| Milestone | Date | Criteria |
|---|---|---|
| M1: Core Runtime | Week 4 | Event bus operational. All V1 engines registered. Visitor session lifecycle functional. |
| M2: Arrival + Room | Week 8 | Visitor enters museum through Arrival ritual. Room of One displays first work. Room engine renders L1-L3. |
| M3: Constellation | Week 12 | Spatial canvas renders 100 works. Pan, zoom, select. Progressive loading. |
| M4: Curator + Rhythm | Week 16 | Weekly reinstallation cron. Daily rhythm active. Hundred rotates. |
| M5: Alpha Release | Week 18 | Internal testing. All V1 engines operational. |
| M6: Beta Release | Week 20 | Limited external testing. A/B test against existing website. |
| M7: RC1 | Week 22 | Bug fixes, polish, accessibility audit. |
| M8: V1.0 GA | Week 24 | Production release. Existing routes progressively redirected. |

---

## Version 1.1 — Editorial Depth (Q1 2027)

### Objective
Deepen the visitor's engagement with individual works and editorial content. Add the Scholar, Ghost, and Publishing Engines.

### Scope
| Engine | Description |
|---|---|
| Room Engine (L4-L5) | Microscope zoom + related works horizontal strip |
| Scholar Engine | Provenance, bibliography, exhibition history, citation tools |
| Ghost Engine | Past installations as translucent overlays |
| Publishing Engine | Journal on black ground, article reading experience |
| Journey Engine (basic) | Curated paths: The Encounter, The Lecture |
| Collector Engine (basic) | Contextual inquiry from any work, private virtual wall |

### Milestones
| Milestone | Date | Criteria |
|---|---|---|
| V1.1 Alpha | Week 30 | All V1.1 engines operational. |
| V1.1 GA | Week 34 | Production release. |

---

## Version 1.2 — Memory and Time (Q2 2027)

### Objective
The museum remembers visitors and changes over time. Add Memory, Diary, Silence, and Garden Engines.

### Scope
| Engine | Description |
|---|---|
| Memory Engine | Visitor encounter history, institutional memory, relational memory |
| Diary Engine | Personal visitor space, monthly letters, journey suggestions |
| Silence Engine | Night mode as separate museum experience |
| Garden Engine | Digital rest space with seasonal adaptation |
| Rhythm Engine (seasonal) | Ramadan, Eid, National Day, seasonal configurations |

### Milestones
| Milestone | Date | Criteria |
|---|---|---|
| V1.2 Alpha | Week 40 | All V1.2 engines operational. |
| V1.2 GA | Week 44 | Production release. |

---

## Version 2.0 — The Full Museum (Q3-Q4 2027)

### Objective
Gallery OS is a complete digital museum. All engines operational. Arabic RTL full implementation. Multi-device optimization.

### Scope
| Feature | Description |
|---|---|
| Arabic RTL Complete | Full bilingual rendering. Language switching. Arabic-first flows. |
| Constellation (advanced) | Connections, clusters, exhibitions as regions, time scrub |
| Journey Engine (advanced) | Personal journeys, The Meditation, The Survey, The Child |
| Archive Engine | Complete collection search, past installation browser |
| Performance Engine (advanced) | Offline mode via Service Worker, adaptive quality |
| Accessibility Engine (advanced) | Screen reader Constellation mode, voice commands |
| Multi-device | Mobile-first Constellation gestures, tablet optimization |

### Milestones
| Milestone | Date | Criteria |
|---|---|---|
| V2.0 Alpha | Week 52 | All engines operational. Arabic complete. |
| V2.0 Beta | Week 56 | Public beta. Migration from V1.x. |
| V2.0 GA | Week 60 | Production release. V1.x deprecated. |

---

## Version 2.1 — Institutional Features (Q1-Q2 2028)

### Objective
Add institution-to-institution features. Multi-tenant support begins.

### Scope
- Institution management dashboard
- Multi-institution identity switching (visitor)
- Cross-institution journeys ("Works from Saudi galleries, 1960-2020")
- Institution comparison tools for researchers
- White-label configuration for partner institutions

---

## Version 3.0 — The Platform (Q3-Q4 2028)

### Objective
Gallery OS is a platform. Any cultural institution can deploy their own digital museum on Gallery OS infrastructure.

### Scope
- Self-service institution onboarding
- Institution configuration UI (no-code identity, ritual, visual configuration)
- Multi-tenant data isolation
- Institution billing and subscription management
- API for external content ingestion
- Plugin architecture for custom engines
- Marketplace for third-party engine extensions
- Federation: institutions can share content, cross-link, co-curate
- Analytics dashboard (privacy-preserving, aggregate only)

### Milestones
| Milestone | Date | Criteria |
|---|---|---|
| V3.0 Alpha | Week 80 | Self-service onboarding for 5 pilot institutions. |
| V3.0 Beta | Week 88 | 20 institutions. Plugin API stable. |
| V3.0 GA | Week 96 | Public platform launch. |

---

## Version 3.x+ — The Ecosystem (2029+)

- Mobile native apps (iOS, Android) with offline Constellation
- AR integration: view works at scale in physical space
- VR integration: walk through the digital museum in headset
- AI Curator: machine learning for journey generation, work pairing, visitor suggestion
- Digital provenance: blockchain-anchored certificates of authenticity
- API economy: third-party apps consuming Gallery OS data
- Physical integration: in-gallery kiosks running Gallery OS, synced with visitor's Diary

---

## Dependency Map (Versions)

```
V1.0 (Foundation)
  └── V1.1 (Editorial Depth) → depends on V1.0 Room + Constellation
       └── V1.2 (Memory + Time) → depends on V1.0 Memory foundations
            └── V2.0 (Full Museum) → depends on all V1.x
                 └── V2.1 (Institutional) → depends on V2.0 multi-tenant prep
                      └── V3.0 (Platform) → depends on V2.1
```

---

## Resource Model

| Version | Engineers | Designers | Curators | QA | Duration |
|---|---|---|---|---|---|
| V1.0 | 4 FE, 2 BE, 1 Infra | 2 | 1 | 1 | 24 weeks |
| V1.1 | 3 FE, 1 BE | 1 | 1 | 1 | 10 weeks |
| V1.2 | 2 FE, 1 BE | 1 | 1 | 1 | 10 weeks |
| V2.0 | 4 FE, 2 BE, 1 Mobile | 2 | 2 | 2 | 16 weeks |
| V2.1 | 2 FE, 2 BE | 1 | 1 | 1 | 12 weeks |
| V3.0 | 4 FE, 3 BE, 1 Infra, 1 DX | 2 | 2 | 2 | 16 weeks |

---

## Exit Criteria Per Version

| Version | Must Have | Nice to Have | Won't Have |
|---|---|---|---|
| V1.0 | Arrival, Room L1-L3, Constellation basic, Weekly reinstall, Daily rhythm, WCAG AA | Room L4-L5, Journeys, Ghost, Scholar | Diary, Silence, Garden, Arabic RTL, Multi-tenant |
| V1.1 | Room L4-L5, Scholar, Ghost, Publishing, Journey basic, Collector basic | Journey advanced, Personal journeys | Diary, Silence, Garden, Arabic RTL |
| V1.2 | Memory, Diary, Silence, Garden, Seasonal rhythm | Advanced seasonal, Cross-institution | Multi-tenant, Platform |
| V2.0 | Arabic RTL, Constellation advanced, Journey advanced, Archive, Offline | Voice commands, Screen reader Constellation | Multi-tenant |
| V2.1 | Institution dashboard, Multi-identity, White-label | Cross-institution journeys | Self-service, Marketplace |
| V3.0 | Self-service, Multi-tenant, Plugin API, Analytics, Federation | AI Curator, AR/VR | Physical kiosk integration |
