# Gallery 015 — Production Polish Report

**Scope:** visual and experiential quality only. Architecture, routing, backend, IA and the
content model were treated as frozen. No page was redesigned, no component replaced, no
typeface changed, no content rewritten.

**Method:** every finding below was measured in a real browser (Chromium, 1440×900 and
390×844, LTR and RTL) against the running application, not read off the stylesheet.
Contrast figures are computed composites including inherited `opacity`. Overflow figures
are the difference between an image's rendered box and its plate's content box.

**Date:** 4 August 2026 · Branch `uiux-controlled-99`

---

## Summary

| | Findings | Implemented |
|---|---|---|
| Critical | 3 | 2 |
| High | 9 | 7 |
| Medium | 8 | 4 |
| Low | 3 | 1 |

Everything not implemented is listed in **Part B** with the reason — in every case it is
either a content decision that is yours to make, or it sits inside the frozen architecture.

Files touched: `src/styles/site-2026.css`, `src/styles/home-2026.css`,
`src/styles/design-tokens.css`, and four lines of
`src/components/public/home/HeroRotator.tsx`. `npm run typecheck` passes.

---

# Part A — Implemented

## A1 · The artwork was being cropped. Everywhere.

**Priority: CRITICAL** · Areas 3, 4, 10

**Current problem.** The site's first principle — a painting is never cropped, it is shown
whole and centred on white — was stated correctly in CSS and was not happening in the
browser. Every image plate sizes its own height from `aspect-ratio` or a clamped
`min-height`, then relies on `max-height: 100%` on the image to keep the work inside. A
percentage `max-height` only resolves against a track whose size the grid has been told;
these tracks were implicit, so `max-height` silently computed to `none`. Portrait works laid
out at intrinsic size and were then clipped by the plate's own `overflow: hidden`.

Measured at 1440, before the fix:

| Surface | Overflow past the plate |
|---|---|
| Artwork detail hero | **600 px** — roughly 45% of the work |
| Homepage selected works | 72 / 87 / 102 / **223 px** (4 of 6 works) |
| Artworks index | 32 / 48 / 117 / 128 / 172 / **192 px** |
| Related works rail | 42 / 61 px |

63% of the collection is portrait (23 works below 0.7 ratio, 147 portrait, of 268), so this
was most of the collection, on the pages the collection exists to serve.

**Why it matters.** This is not a refinement, it is the promise of the site failing in
production. A visitor on an artwork page was looking at the middle of a painting with the
top and bottom cut off, on a page whose entire design argument is that the work is
presented whole. It also silently undid the earlier decision (site-2026 rule 4) that swapped
these images to intrinsic sizing so their drop shadows would hug the work rather than the
box — that swap is what removed the `height: 100%` that had been holding them in.

**Refinement.** Declare one explicit track on each plate so the percentage resolves:
`grid-template-rows: minmax(0,1fr); grid-template-columns: minmax(0,1fr)`. Nothing else
changes — same plates, same padding, same shadows, same hairline.

**Verified after.** Every plate on every surface now overflows by −2 px or less, and every
rendered aspect ratio matches its source exactly (0.60, 0.72, 0.73, 0.77, 0.78, 0.79, 0.82,
0.87, 0.89, 1.00, 1.20, 1.53, 1.68 — all exact).

**Visual impact:** transformative. **Effort:** 6 lines of CSS.

---

## A2 · The Journal was publishing the absence of a photograph

**Priority: CRITICAL** · Areas 8, 10

**Current problem.** All nine published journal entries have `image_id = null`. The index
therefore drew nine 641×677 grey rectangles reading "015 / Image forthcoming", and every
article opened with a 802×1002 empty plate above its first line. The index page was 6,004 px
tall to carry nine short essays.

**Why it matters.** An institution publishes the writing, or it doesn't publish. It does not
publish a placeholder for a picture it doesn't have — that reads as a site mid-build, which
is the one impression a gallery cannot afford. It was also the single largest source of dead
vertical space on the site.

**Refinement.** Where a card or a detail hero has no photograph, the plate is removed and
the type carries the card, with a hairline above it so the index still reads as an index.
Cards that do have a photograph are untouched, and the rule re-activates itself
automatically the moment an image is attached in the CMS. The detail hero collapses to a
single column.

**Verified after.** Journal index 6,004 px → **2,372 px**. Article 4,510 px → **3,586 px**.
Card height 900 px → 228 px. Nine plates hidden, nine cards intact.

**Visual impact:** high. **Effort:** 12 lines of CSS. No content or component change.

---

## A3 · The header was a different white from the page

**Priority: HIGH** · Areas 2, 6, 10

**Current problem.** `site-2026.css` rule 1 sets the header to the paper white so it does not
draw a seam — but it addresses `.site-header`, a class no component renders any more. The
live header is `.g-header`, still carrying `rgba(250,250,247,.96)` from the previous warm
palette. The homepage patches itself separately via `:has(.hp)`, so the homepage looked
right and **every other page opened with an 82 px band a shade warmer than the paper
beneath it.**

**Why it matters.** The whole colour argument of this site is that there is one white,
chosen to match the white the artwork is photographed on, so that no rectangle appears
around a work. A warm band across the top of every page is the first thing the eye finds,
and it is the exact defect the palette was chosen to prevent.

**Refinement.** `.g-header { background: rgba(255,255,255,.96) }`.

**Visual impact:** high, and immediately felt. **Effort:** 1 line.

---

## A4 · Every section arrived at the same volume

**Priority: HIGH** · Area 1

**Current problem.** Measured on the homepage: seven consecutive sections, every one with a
144 px foot, every section head at 63 px with a 72 px foot. Uniform interval, uniform scale,
uniform weight — so a page with a hero, a statement, an exhibition, six works, a roster,
three commissions and a journal read as one long column of equally important things.

**Why it matters.** Cadence is how a publication tells you what matters. Without it the
visitor has no way to know that "Now on view" outranks "Art in context", so nothing outranks
anything, and the page feels long rather than considered.

**Refinement.** Three spacing intervals instead of one, and two levels of section head.
No content moved, nothing cut:

| Section | Before | After | Head |
|---|---|---|---|
| Statement | 144 / 144 | 166 top / 109 foot | — |
| Programme | 144 | **166** | 63 px |
| Selected works | 144 | **166** | 63 px |
| The roster | 144 | 109 | **48 px** |
| Art in context | 144 | 144 | **48 px** |
| 015 Journal | 144 | 109 | **48 px** |

Two principal chapters keep the full measure and the full head; the three supporting
sections step down one level — which is what makes the principal ones read as principal.
Total page height is unchanged (7,470 → 7,500 px): this is redistribution, not compression.

**Visual impact:** high. **Effort:** 20 lines of CSS.

---

## A5 · The plate grid had no rhythm

**Priority: HIGH** · Area 4

**Current problem.** Three columns, every plate starting on the same baseline, every plate
the same square. A catalogue of thumbnails rather than a plate section.

**Why it matters.** In a museum publication the plates are set off the line against each
other; that is what stops a sequence of works reading as a contact sheet. The brief is right
that some works deserve more presence — but on a rotating homepage selection, presence
should come from the rhythm of the spread, not from an editor ranking the collection.

**Refinement.** The centre column drops by 28–62 px — the same device the index pages
already use on their second and third cards, so this is the house vocabulary, not a new one.
Applied to the works grid and the projects grid, at three columns and above only. The roster
stays aligned, because a roster is a roster.

Deliberately **not** done: masonry, Pinterest-style variable heights, or a "hero work" that
spans two columns. Masonry destroys the baseline that makes a grid feel institutional, and a
spanning lead work leaves a ragged tail at six items.

The larger contribution to grid rhythm is A1: with works finally rendering at their true
proportion inside a constant plate, the sequence now varies naturally — 0.60, 0.79, 1.00,
1.53 — which is exactly how a plate section reads.

**Visual impact:** medium–high. **Effort:** 6 lines of CSS.

---

## A6 · Quiet text was too quiet to read

**Priority: HIGH** · Area 12

**Current problem.** 40% black at 9–12 px carries real information across the site — dates,
media, dimensions, counts, kickers, fact labels. That is **2.62:1** against paper, where 4.5:1
is the floor. The footer's headings and legal line were at half opacity on the dark wall:
**3.38:1**. The "Image forthcoming" text was 2.93:1. Some interface text was set at 8–9 px.

Failing selectors found across eleven pages: `.hp-label`, `.hp-idx`, `.hp-record dt`,
`.hp-entry time`, `.hp-hero__count`, `.hp-arw`, `.g-nav-overlay__num`, `.experience-kicker`,
`.experience-facts dt`, `.g-page__kicker`, `.g-page__section h2`, `.g-footer__col h3`,
`.g-footer__bottom`, and all four image-fallback labels.

**Why it matters.** A date and a medium are not decoration — they are the catalogue entry,
and they are what a collector reads. The earlier pass (rule 11) established exactly this
principle and stopped at one selector.

**Refinement.** A `--g-ink-quiet` token at 60% black — **4.93:1** — applied to text only.
`--g-ink-40` is untouched and stays correct for hairlines, dots and the scroll cue, which are
marks rather than words. Sizes below 10 px raised to 10 px. The tracked uppercase gallery
convention is kept exactly as it was.

**Verified after** (all previously failing selectors, all pages): 4.93, 4.93, 4.93, 4.93, 4.93,
4.93, 4.93, 5.02, 5.23, 5.25, 5.25, 5.29, 6.82, 6.94, 18.87. No visible remaining failures.

**Visual impact:** low individually, high cumulatively — the page reads as more certain, not
louder. **Effort:** 25 lines of CSS.

---

## A7 · Nothing answered the pointer

**Priority: HIGH** · Areas 5, 6, 9

**Current problem.** An index card responded to the cursor by fading its photograph 8%. Its
title did not respond at all. The 67-row artist roster — where every row is a control — had
no hover state whatsoever: background, colour and rule all measured identical before and
after.

**Why it matters.** Restraint is not the same as inertness. A visitor needs to know a thing
is a thing before they commit a click, and a list of 67 silent rows reads as a table, not as a
way in.

**Refinement.**

- **Titles** take the oldest signal a link has: a 1 px rule drawn under them over 320 ms,
  from the reading edge. Mirrored under RTL (verified: `background-position: 100% 100%`).
- **Plates** darken their own hairline from 13% to 28% — the frame acknowledges, the work
  does not move.
- **Roster rows** take the same 2.8% wash the homepage journal rows already use, the row's
  rule darkens, and the row number comes up to full ink. One vocabulary, two lists.
- **The plus becomes a minus by turning** rather than by fading, which is the only way that
  gesture reads as one mark instead of two.

**Note:** a contained work can no longer be scaled on hover. The plate is now exactly the
size of the work, so the old `scale(1.025)` would crop it — the very defect A1 fixes. Scale
is kept only for photography that fills its frame (portraits, commissions, installation
views), standardised to 1.02.

**Verified after:** every gesture measured as changing; the contained-work transform
measured as `none`.

**Visual impact:** medium–high. **Effort:** 45 lines of CSS.

---

## A8 · Nine durations for one gesture

**Priority: HIGH** · Area 11

**Current problem.** The same hover — a photograph moving slightly — was written nine times
at 0.3 s, 0.7 s, 0.8 s, 0.85 s, 0.9 s, 1.0 s, 1.1 s, 1.4 s across five stylesheet regions, in
three different easings. Scale distances ranged from 1.012 to 1.03.

**Why it matters.** Motion is a signature. When the same gesture takes 0.9 s on the homepage
and 1.4 s on a detail page, the site feels assembled rather than authored — the visitor
can't name why, but the inconsistency is what "cheap" is made of.

**Refinement.** Two tokens cover the public site: `--motion-ui: 320 ms` for a rule, a caption
or an opacity, and `--motion-image: 1000 ms` for anything that moves a photograph — both on
the existing `--motion-ease` curve. Values sit inside the old range, so nothing looks
different; it now looks the same everywhere.

**Visual impact:** low individually, high as a whole. **Effort:** 2 tokens, 10 lines.

---

## A9 · Essays set at 32 px

**Priority: HIGH** · Area 8

**Current problem.** `.experience-body` is shared by a one-paragraph exhibition statement,
where 31.7 px serif is exactly the right voice, and by a five-paragraph journal essay, where
it is not. A reader got a display face at 31.7 px / 45.9 px leading in an 805 px column and a
page four screens long.

**Why it matters.** The Journal is the gallery's own critical voice; it is the one place on
the site where a visitor is expected to read rather than look. Display size makes an essay
feel like a pull-quote that never ends.

**Refinement.** Three paragraphs or more is an essay: drop to 19.4 px / 33.4 px and let the
62 ch measure from rule 8 actually govern (it never did — at 31.7 px, 62 ch was wider than
the container). Bodies of one or two paragraphs keep their display voice.

**Verified after:** journal article 31.7 px → **19.4 px**, column 805 px → **579 px**, page
4,510 px → 3,586 px. Exhibition and collection bodies unaffected.

**Visual impact:** high on the Journal, none elsewhere. **Effort:** 8 lines of CSS.

---

## A10 · Targets a thumb could not find

**Priority: MEDIUM** · Area 12

**Current problem.** Measured hit areas: header nav links 19 px tall, the "Contact" call to
action 60×15, the search icon 18×22 sitting beside a 44×44 language button, the hero's
rotator dots **24×2**, footer links 18 px, overlay links 15 px.

**Why it matters.** 44 px is the accessibility floor and also just the truth about fingers.
The search icon's mismatch with the language button was additionally an optical problem in
the header's right cluster.

**Refinement.** Nothing changes by a pixel on screen. Hit areas are extended past the glyph
with a pseudo-element rather than by padding the glyph, so the nav's optical spacing and the
active-state underline stay exactly where they were. The search anchor becomes a 44×44 grid
box with a negative margin, so it now aligns with the language button without moving
anything else. The rotator's dots keep a 2 px painted bar inside a 24×32 target, using
`background-clip: content-box` — which also had to be repeated on the `:hover` and `.is-on`
rules, because their `background` shorthand resets the clip and would otherwise paint the
whole 32 px block.

**Verified after:** search 44×44, dots 24×32 with a 2 px painted bar in all three states,
and a click 9 px above the "Journal" link navigates to `/news` (10 px above "Contact"
navigates to `/contact`).

**Visual impact:** none — that is the point. **Effort:** 15 lines of CSS.

---

## A11 · The hero rotated away from keyboard users

**Priority: MEDIUM** · Areas 11, 12

**Current problem.** The hero advances every 6.5 s and pauses on hover. A keyboard visitor
tabbing to "View this work" had the carousel move underneath them; WCAG 2.2.2 requires a
pause mechanism for anything auto-updating for more than 5 s.

**Refinement.** `onFocus` / `onBlur` on the section, pausing exactly as the pointer already
does. Four lines, additive, no component replaced.

**Remaining gap:** there is still no explicit pause control and no arrow-key navigation.
Both are new controls, which is outside this brief — see B8.

**Visual impact:** none. **Effort:** 4 lines.

---

## A12 · Focus was invisible on the dark surfaces

**Priority: MEDIUM** · Area 12

**Current problem.** The focus ring is `2px solid var(--g-ink)` — correct on paper, and ink
on ink inside the footer and the Visit band.

**Refinement.** Those two surfaces invert the ring to paper. The ring itself is unchanged.

**Visual impact:** none until it matters. **Effort:** 2 lines.

---

## A13 · Roster interface text at 8–9 px

**Priority: LOW** · Area 9

Relationship labels, summary meta, panel meta and the "View artist" link were set at 8–9 px,
below the 11 px floor the previous pass established for the same page. Raised to 10 px at
4.93:1, tracking and case unchanged.

**Visual impact:** low. **Effort:** included in A6.

---

# Part B — Found, reported, not implemented

These are outside the frozen scope, or they are your decision rather than mine.

## B1 · 24 artwork images are too small to show

**Priority: CRITICAL (content)** · Area 10

Of 268 public works, **24 have a short edge under 400 px** and 4 more are under 800 px. The
smallest are 146×167, 188×146, 198×202, 203×108. In a 641×677 index plate, a 146×167 source
renders at native size and fills **7% of its plate** — a postage stamp floating in white,
next to works that fill 94%.

No CSS can fix this: upscaling a 146 px source makes it worse, and the plate cannot shrink
to fit one work without breaking the grid. It needs re-scanning, or those works need to be
withheld from the public grid until they are re-shot.

**Recommendation:** set a minimum publishable resolution (900 px short edge is the threshold
the homepage hero already enforces in `page.tsx`) and either re-scan or unpublish the 24.
**Effort:** content operation, ~1 day of scanning; the code already has the pattern.

Full list available on request — it is concentrated in works by Othman Taha (6), Abdullah
Al-Ahmad (4), Ahmed Anan (3), Al-Sheikh Idris (2) and Khaled Al-Ghannam (2).

---

## B2 · 94% of the collection is called "Untitled"

**Priority: HIGH (content)**

**252 of 268** public works have a title beginning "Untitled". 32 have no year. The homepage
already works around this — `hasRealTitle()` filters the hero and the selected works down to
the 16 titled works, which is why the same handful of pieces appears in both.

**Why it matters.** A catalogue where 94% of entries are untitled is an archive, not a
programme. It also constrains every editorial surface on the site to the same 16 works.

**Recommendation:** cataloguing pass. Where a work genuinely has no title, the convention is
*Untitled (Series name), year* rather than a bare "Untitled" repeated 252 times — that alone
would make the grid legible without inventing anything.

---

## B3 · 60 of 70 artists have no portrait

**Priority: HIGH (content)** · Areas 9, 10

86% of roster rows show the "015 / Image forthcoming" placeholder. The previous pass gave
the placeholder and the photograph an identical hairline so the rows read as one treatment,
which was the right call — but ten photographs among sixty placeholders is still a roster
that looks unfinished.

**Recommendation:** either commission the portraits, or make the roster type-led and use
portraits only where they exist (the same move A2 makes for the Journal). The second is a
one-hour change and I did not make it unilaterally, because unlike the Journal a roster
legitimately expects a face. **Your call.**

---

## B4 · The artworks index is a 138,000 px page

**Priority: HIGH** · Area 4

All 265 works render in a single ungated page: **138,022 px** at desktop, **176,995 px** on
mobile — around 177 metres of scroll. There is no pagination, no filter and no jump.

This is architecture, which is frozen, so I have not touched it. But it is the largest
usability defect on the site and no amount of polish reaches it. A museum publication does
not print 265 plates without a contents page.

**Recommendation:** pagination or a filter by artist/medium/year — all three fields are
already on the model and already rendered in the card meta. **Effort:** ~half a day. Needs
your sign-off because it touches routing.

---

## B5 · The artwork hero plate is landscape; the collection is portrait

**Priority: MEDIUM** · Area 3

With A1 in place, the detail hero is correct but not yet optimal: the plate is
`height: min(78svh, 920px)` at full page width — 1264×738 at 1440 — so a portrait work fills
**44%** of it and sits in a very wide field of white with a short top and bottom margin. The
optical balance is sideways-heavy.

**Recommendation:** cap the plate's width for portrait sources so the margins around the work
are even on all four sides — `.artwork-experience-media--hero:has(img)` with a
`max-width` derived from the aspect ratio. I stopped short because it changes the
proportions of the flagship page and that is a decision you should see before it ships
rather than read about afterwards. **Effort:** ~10 lines; I can do it on a word.

---

## B6 · Two containment policies on the detail hero

**Priority: MEDIUM** · Area 3

`site-2026.css` rule 5 gives `.experience-detail__media` centring, generous padding and a
radial gradient — all the vocabulary of a contained work — but the image inside it still
uses `object-fit: cover` from the legacy sheet, so it crops and the gradient is only ever
visible in the padding.

Today that container is only used by documentary photography (exhibitions, collections,
publications, services), where cropping is defensible — which is why I left it. But the two
halves of the rule disagree with each other, and the next content type routed through
`EditorialDetail` will inherit the disagreement.

**Recommendation:** decide which it is, and make the image match. **Effort:** 2 lines once
decided.

---

## B7 · No page transition

**Priority: MEDIUM** · Area 11

Navigation is a hard cut: the outgoing page vanishes, a skeleton plate appears, the new page
snaps in. Against the standard set by the hero's 1.15 s cross-fade, arrival is the least
considered motion on the site.

**Recommendation:** a 200–300 ms opacity transition on route change, honouring
`prefers-reduced-motion`. This needs a template-level component, which is architecture —
hence not done. **Effort:** ~half a day including reduced-motion and scroll-restoration
behaviour.

---

## B8 · The hero still has no explicit pause

**Priority: MEDIUM** · Area 12

A11 added focus-pause, which closes the trap. Full WCAG 2.2.2 conformance wants a visible
pause control, and the dots want arrow-key support. Both are new controls in a component the
brief says not to replace.

**Recommendation:** add a pause affordance in the existing counter row — it already has the
space and the visual language. **Effort:** ~2 hours. **Your call.**

---

## B9 · Header spacing is mathematically centred, optically not

**Priority: LOW** · Area 6

The nav block is centred exactly on the page's 720 px axis. But the gap from the wordmark to
the first link is 158 px, and from the last link to the search icon 206 px — a 48 px
asymmetry, because the two side columns of the header grid are declared at different minimums
(170 px and 140 px) while their content is the opposite way round.

It is visible if you look for it and invisible if you don't. Correcting it means moving the
nav off the page's true centre, which trades one kind of wrongness for another.
**Recommendation:** leave it. Recorded so it is a decision rather than an oversight.

---

## B10 · Dead CSS

**Priority: LOW**

- `.site-header` (~2 KB of rules in `globals.css`) — no component has rendered this class
  since the header was rewritten. This is what caused A3.
- `.artist-roster-hero__taxonomy` — styled in both `globals.css` and `site-2026.css`; the
  markup does not exist on the roster page.
- `globals.css` is 183 KB and holds at least three superseded generations of homepage CSS
  (`.home-chapter`, `.institutional-chapter`, `.home-works-study`).

**Recommendation:** a dead-CSS pass before launch. Not done here because deleting rules is
how you discover which ones were load-bearing, and this is not the week for that.
**Effort:** ~half a day with a coverage run.

---

# Verification record

| Check | Result |
|---|---|
| Image overflow, all plate types, 4 pages | every plate ≤ −2 px; every rendered ratio matches source exactly |
| Contrast, 11 pages, composited opacity | no visible failures; previously failing selectors now 4.93–18.87:1 |
| Extended hit areas | click 9 px above "Journal" → `/news`; 10 px above "Contact" → `/contact` |
| Rotator dots | 24×32 target, 2 px painted bar, correct in default / hover / active |
| Hover deltas | 8 of 8 measured gestures change; contained-work transform confirmed `none` |
| RTL (`gallery-lang=ar`) | `dir="rtl"`, no horizontal overflow at 1440, underline draws from the right |
| Mobile 390×844 | no horizontal overflow on `/`, `/artworks`, `/news`, `/artists`, article |
| `npm run typecheck` | passes |

**Not verified:** Safari and Firefox. The one rule with meaningful engine risk is `:has()`
(A2, A9) — supported in all three since 2023, and both uses degrade to the current behaviour
rather than breaking. Worth 20 minutes on a real Safari before launch.
