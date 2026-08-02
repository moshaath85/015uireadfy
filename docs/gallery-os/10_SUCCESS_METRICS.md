# Gallery OS — Success Metrics

**Version:** 1.0  
**Status:** Approved

---

## Measurement Philosophy

Gallery OS does not optimize for traditional web metrics. It optimizes for museum outcomes: wonder, discovery, memory, and return. Metrics are organized into four tiers:

1. **Emotional Metrics** — Did the visitor feel something?
2. **Engagement Metrics** — Did the visitor explore deeply?
3. **Relationship Metrics** — Did the visitor return? Do they trust the institution?
4. **Institutional Metrics** — Did the museum achieve its mission?

---

## Tier 1: Emotional Metrics

These are the hardest to measure and the most important. They are assessed through Museum Experience Validation testing (qualitative) and inferred from behavioral signals (quantitative).

### Wonder Score
**Definition:** The degree to which a first-time visitor experiences awe during the Arrival and initial exploration.

**Qualitative:** Moderated testing — observer rates visitor's visible emotional response (pause, smile, verbal exclamation) on a 1-5 scale. Target: > 4.0 average.

**Quantitative (proxy):**
- Pause duration on Arrival ritual (time before first tap/scroll after ritual completes). Target: > 5 seconds median.
- Room of One dwell time (time before navigating away). Target: > 20 seconds median.
- `wonder.score`: composite of pause duration + Room of One dwell + Constellation initial zoom-in behavior. Target: increasing week-over-week after V1.0 launch.

### Curiosity Score
**Definition:** The degree to which a visitor explores beyond the initial view — unprompted, driven by interest.

**Qualitative:** Moderated testing — observer counts unprompted navigation actions. Target: > 3 unprompted actions per session.

**Quantitative (proxy):**
- Constellation pan distance per session (total pixels panned). Target: > 5000px median.
- Unique works viewed per session. Target: > 5 median.
- Unique artists explored per session. Target: > 3 median.
- Depth reached (percentage of sessions where visitor scrolls to L2 or L3). Target: > 40% of art work views reach L2, > 15% reach L3.

### Calm Score
**Definition:** The degree to which the museum feels peaceful rather than overwhelming. Measured by absence of stress signals.

**Qualitative:** Moderated testing — observer rates visitor's visible stress signals (rapid clicking, repeated back-navigation, verbal frustration). Target: < 0.5 incidents per session.

**Quantitative (proxy):**
- Rapid navigation rate (< 2 seconds per work viewed, > 5 works). Target: < 10% of sessions.
- Garden visits per session. Target: increasing adoption over time (indicates visitors know where to rest).
- Silence mode adoption. Target: > 5% of evening visitors enter Silence mode.

---

## Tier 2: Engagement Metrics

### Work Encounter Depth
**Definition:** How deeply visitors engage with individual works.

**Metrics:**
- **Level 1 (Encounter) completion rate:** % of work views lasting > 10 seconds. Target: > 70%.
- **Level 2 (Story) engagement:** % of L1 views that scroll to L2. Target: > 40%.
- **Level 3 (Record) engagement:** % of L2 views that scroll to L3. Target: > 15%.
- **Level 4 (Microscope) engagement (V1.1+):** % of L3 views that activate microscope. Target: > 8%.
- **Level 5 (Dialogue) engagement (V1.1+):** % of work views that click a related work. Target: > 12%.
- **Average depth per work view.** Target: > 1.8 (i.e., most visitors go beyond L1).

### Journey Completion
**Definition:** How many visitors complete a curated journey from start to finish.

**Metrics:**
- **The Encounter completion rate:** % of started journeys completed. Target: > 60%.
- **The Lecture completion rate (V1.1+):** Target: > 35%.
- **Average journey duration.** Target: > 5 minutes for The Encounter.

### Constellation Exploration
**Definition:** How visitors use the spatial browser.

**Metrics:**
- **Works selected from Constellation per session.** Target: > 3 median.
- **Zoom level reached (max).** Target: > 4× zoom in > 30% of sessions (indicates spatial exploration, not just list-browsing).
- **Cluster expansion rate:** % of sessions where visitor expands an artist cluster. Target: > 25%.
- **Connection toggle rate (V2.0+):** % of sessions where connections are toggled on. Target: > 20%.

### Journal Reading Depth (V1.1+)
**Definition:** How deeply visitors read editorial content.

**Metrics:**
- **Reading progress (scroll depth).** Target: > 50% median scroll depth on articles.
- **Reading completion rate** (> 90% scroll depth). Target: > 25%.
- **Articles per session.** Target: > 1.5 median (among Journal visitors).

---

## Tier 3: Relationship Metrics

### Return Rate
**Definition:** The percentage of visitors who return to the museum.

**Metrics:**
- **7-day return rate:** % of visitors who return within 7 days. Target: > 15%.
- **30-day return rate:** Target: > 25%.
- **Weekly reinstallation impact:** Increase in return rate on Monday (new installation day). Target: > 20% increase vs. Sunday.
- **Diary letter impact (V1.2+):** Return rate within 48 hours of receiving a letter. Target: > 30%.

### Memory Creation
**Definition:** The degree to which visitors form durable memories of specific works.

**Qualitative:** Follow-up survey 7 days after visit — "Name or describe one work you remember." Target: > 60% can recall at least one work.

**Quantitative (proxy):**
- **Re-encounter rate:** % of sessions where a visitor views the same work as a previous session. Target: > 20%.
- **Bookmark rate (V1.2+):** % of visitors who bookmark at least one work. Target: > 10%.
- **Share rate:** % of visitors who share a work (copy link, social). Target: > 3%.

### Trust Score
**Definition:** The degree to which visitors perceive the museum as authoritative, credible, and worthy of their attention.

**Qualitative:** Moderated testing — "On a scale of 1-5, how much do you trust the information presented?" Target: > 4.5.

**Quantitative (proxy):**
- **Scholar Engine usage (V1.1+):** % of sessions where bibliography or provenance is viewed. Target: > 5% (indicates academic trust).
- **Citation rate (V1.1+):** copies of formatted citations. Target: > 100/month.
- **Collector inquiry rate (V1.1+):** inquiries submitted through Collector Engine. Target: > 5/month (measured against baseline of direct contact form submissions).

---

## Tier 4: Institutional Metrics

### Cultural Representation
**Definition:** The degree to which the museum serves its Saudi and Arabic-speaking audience.

**Metrics:**
- **Arabic content consumption:** % of views on Arabic-text versions of works. Target: > 30% of total views (reflecting Saudi audience proportion).
- **Language switch rate:** % of sessions where language is toggled. Target: > 10% (bilingual audience curiosity).
- **Saudi artist exposure:** % of total work views on Saudi artists. Target: > 50% (the museum's primary cultural mission).
- **Geographic distribution of visitors:** Target: > 60% from MENA region, > 20% from Europe, > 10% from Americas, > 10% from Asia-Pacific.

### Educational Impact
**Definition:** The degree to which the museum fulfills its educational mission.

**Metrics:**
- **Scholar mode usage:** % of sessions using Scholar features (bibliography, provenance). Target: > 5%.
- **Journey: The Lecture completion rate (V1.1+).** Target: > 35%.
- **Student/researcher feedback:** Survey — "Did this museum help your research/study?" Target: > 4.0/5.
- **Citation count (external):** Instances of Gallery 015 cited in academic publications. Target: > 5 citations within 2 years of launch.

### Commercial Impact (if Collector Engine enabled)
**Definition:** The degree to which the museum facilitates the gallery's commercial mission — discreetly, without compromising the experience.

**Metrics:**
- **Inquiry quality:** Gallery team rates inquiry relevance on a 1-5 scale. Target: > 4.0 (contextual inquiries are higher quality than generic contact form).
- **Inquiry-to-appointment rate:** % of inquiries that result in a private viewing. Target: > 20%.
- **Virtual collection creation (V1.1+):** % of collector visitors who create a virtual collection. Target: > 15% of collector-identified visitors.

### Publication Impact (V1.1+)
**Definition:** The degree to which the Journal establishes independent editorial credibility.

**Metrics:**
- **Journal unique visitors per month.** Target: > 500 (Year 1), > 2000 (Year 2).
- **Article completion rate** (> 90% scroll). Target: > 25%.
- **External citations/links to Journal articles.** Target: > 10 inbound links from non-gallery sources within 1 year.

---

## Metrics Dashboard (V1.0 Launch)

| Metric Group | Metric | Current Baseline | V1.0 Target | V2.0 Target |
|---|---|---|---|---|
| **Emotional** | Wonder Score | N/A | > 4.0/5 | > 4.3/5 |
| | Curiosity Score | N/A | > 3 actions/session | > 5 actions/session |
| | Calm Score | N/A | < 0.5 stress/session | < 0.3 stress/session |
| **Engagement** | Works viewed/session | ~2 (current site) | > 5 | > 8 |
| | Depth L2 rate | ~10% (current site) | > 40% | > 50% |
| | The Encounter completion | N/A | > 60% | > 70% |
| | Journal reading depth | N/A | > 50% (V1.1) | > 65% |
| **Relationship** | 7-day return rate | ~5% (estimated) | > 15% | > 20% |
| | 30-day return rate | ~12% (estimated) | > 25% | > 35% |
| | Monday bump | N/A | > 20% | > 30% |
| | Re-encounter rate | N/A | > 20% | > 30% |
| **Institutional** | Arabic content % | 0% (current) | > 20% | > 30% |
| | Saudi artist % | ~40% (current) | > 50% | > 55% |
| | Scholar usage % | 0% | > 5% (V1.1) | > 10% |
| | Inquiry quality | N/A | > 4.0/5 (V1.1) | > 4.3/5 |

---

## What Gallery OS Does NOT Measure

- **Page views** — The museum has no pages.
- **Click-through rate** — The museum has no ads.
- **Session duration as a KPI** — Long sessions can indicate confusion, not engagement.
- **Bounce rate** — "Bouncing" after viewing one work for 5 minutes is a success, not a failure.
- **Conversion rate** — The museum is not a funnel.
- **Scroll depth as a standalone metric** — Shallow scroll on a work can mean the work was satisfying at Level 1.
- **Social shares** — Not a target. A byproduct if the experience is powerful.
- **Newsletter signups** — The Diary replaces the newsletter. Relationship, not subscription.
- **Any personally identifiable visitor data** — Privacy is an institutional value. Metrics are anonymized and aggregated.

---

## Review Cadence

| Review | Frequency | Participants |
|---|---|---|
| Metric review | Weekly | Product Manager, FE-Arch Lead |
| Emotional metric review | Monthly | Creative Director, UX Research Lead |
| Institutional metric review | Quarterly | Museum Director, Curator, Board |
| Full metric strategy review | Biannually | All stakeholders |

---

## North Star Metric

**"Percentage of visitors who return within 30 days and view at least one work they have not seen before."**

This single metric captures:
- **Return** — The visitor wants to come back.
- **Discovery** — The museum showed them something new.
- **Reinstallation working** — The museum changed since their last visit.
- **Memory** — They remembered the museum and chose to return.

**V1.0 Target:** > 20% of visitors.  
**V2.0 Target:** > 30% of visitors.  
**V3.0 Target:** > 40% of visitors.
