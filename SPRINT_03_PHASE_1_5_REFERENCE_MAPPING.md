# 015 Gallery Sprint 03 — Phase 1.5 Reference Mapping

## Status

The user identified `/Users/apple/Downloads/١١١١١.html` as the approved `015_Artists_Roster_All_Closed_Final.html` reference. The file was found and inspected in full.

Reference facts:

- page title: `015 Gallery — Artists Roster`;
- size: 234,880 bytes across 194 physical lines;
- delivery format: one self-contained HTML document;
- dependencies: no external CSS, JavaScript, fonts, or images;
- content: five artist entries;
- media: 30 embedded base64 JPEGs—one thumbnail, one portrait, and four work images per artist;
- initial state: all five `<details>` elements omit the `open` attribute;
- interaction: native disclosure plus one inline JavaScript listener;
- responsive breakpoint: one media query at `760px`.

## Remaining source gaps

Nothing required to inspect this prototype is missing. It is self-contained.

The prototype is not production content or a complete behavioral specification in the following respects:

- all “View artist” links use `href="#"` and cancel navigation with `onclick="return false;"`;
- filter labels are static `<span>` elements with no filtering JavaScript;
- embedded images are prototype assets rather than CMS media references;
- the reference contains five fixed artist records, while the application must use current public database records;
- the prototype does not define empty, missing-media, long-copy, loading, or database-error states;
- it does not include a reduced-motion rule;
- it does not specify whether an open artist should be addressable in the URL or retained after navigation.

## HTML structure analysis

The document has four top-level visual regions:

1. a 74px sticky black institutional header;
2. a large roster hero with title, introduction, and filter labels;
3. a roster `<main>` containing five sibling `<details class="artist">` disclosures;
4. one inline script after the roster.

Each artist disclosure follows the same structure:

```text
details.artist
├── summary
│   ├── span.num
│   ├── span.thumb > img
│   ├── span.identity
│   │   ├── small              representation label
│   │   ├── strong             artist name
│   │   └── em                 discipline · country
│   └── span.toggle            CSS plus/minus
└── div.panel
    ├── div.portrait > img
    └── div.details
        ├── p.meta              discipline · country
        ├── p.desc              biography excerpt
        ├── a                   disabled prototype detail link
        └── div.works > 4 img   artwork references
```

Native `<details>/<summary>` provides the closed initial state and built-in mouse/keyboard disclosure behavior. There are no nested buttons and no custom state attributes.

The reference roster records are:

| No. | Artist | Relationship | Discipline · country |
|---|---|---|---|
| 01 | Layla Al-Hassan | Exclusive Artist | Painting · Saudi Arabia |
| 02 | Omar Farouk | Represented Artist | Sculpture · Egypt |
| 03 | Maha Al-Rashid | Exclusive Artist | Mixed Media · Kuwait |
| 04 | Yousef Nassar | Collaborating Artist | Photography · Lebanon |
| 05 | Reem Al-Salem | Represented Artist | Ceramics · Saudi Arabia |

## CSS analysis

### Identity tokens

The prototype defines a small, coherent palette and type system:

- ink: `#0a0a09`;
- paper: `#eee9df`;
- muted: `#817b72`;
- rule: `rgba(10,10,9,.18)`;
- serif: Georgia / Times New Roman;
- sans: system Apple/Helvetica/Arial stack.

These values are close to, but not identical with, the current application’s warm ivory and dark-ink system. They should be reconciled deliberately at the roster component boundary instead of globally replacing the existing site identity.

### Desktop composition

- Hero spacing is `70px 5vw 56px`; the title scales from 72px to 150px at `11vw`, with `.82` line height and `-.065em` tracking.
- Roster uses `5vw` horizontal padding and a 100px bottom ending.
- Closed summary grid columns are `62px 110px 1fr 34px` with 26px gaps.
- Thumbnail is 110 × 88px, cropped with `object-fit: cover` and rendered in grayscale.
- Artist name scales from 34px to 62px and shifts 18px right when open.
- Plus/minus is drawn with pseudo-elements; the vertical stroke fades when open.
- Open panel is a two-column `.88fr 1.12fr` grid separated by `5vw`.
- Portrait is at least 520px high and otherwise 65vh, with cover cropping.
- Biography is 20px/1.5 and capped at 560px.
- Four works form an equal four-column row with square crops.

### Mobile composition

At `max-width: 760px`:

- prototype navigation is hidden;
- hero and roster horizontal padding become 22px;
- summary columns become `38px 58px 1fr 26px` with 12px gaps;
- thumbnail becomes 58 × 58px;
- relationship label is hidden;
- artist name is fixed at 31px and shifts 8px when open;
- panel becomes one column;
- portrait height becomes `105vw` with no minimum;
- biography becomes 18px;
- work-grid gaps reduce to 8px while retaining four columns.

### Motion

- artist name translation: `.45s ease`;
- plus-to-minus vertical-stroke fade: `.3s ease`;
- open panel reveal: `.55s ease`, fading from zero opacity and translating upward from 22px;
- disclosure height itself uses native `<details>` behavior and is not height-animated;
- closing has no matching panel keyframe;
- no `prefers-reduced-motion` override exists in the prototype.

The current application’s global reduced-motion rule should remain authoritative. Matching the reference means preserving its calm reveal and identity shift, not forcing animated height where the approved HTML has none.

## JavaScript analysis

The entire interaction script is one `toggle` listener per artist:

```js
document.querySelectorAll('details.artist').forEach(item => {
  item.addEventListener('toggle', () => {
    if (item.open) {
      document.querySelectorAll('details.artist').forEach(other => {
        if (other !== item) other.removeAttribute('open')
      })
    }
  })
})
```

Behavioral contract:

- all items start closed because none has `open`;
- browser-native interaction toggles the selected item;
- after an item opens, the script closes all siblings;
- the open item may be closed, returning the page to all-closed;
- opening another item does not scroll or otherwise reposition the viewport;
- there is no filter state, URL state, analytics, persistence, or image lazy loading.

In React, controlled state is preferable to querying and mutating sibling DOM nodes. A single `openArtistId: string | null` exactly models the approved states without changing the visible behavior.

## Accessibility assessment

Strengths:

- native `<summary>` is keyboard-operable and exposes disclosure state;
- meaningful artist names are visible text;
- portraits/thumbnails have artist-name alt text;
- all-closed is a valid and reachable state.

Gaps to correct without altering the approved appearance:

- the decorative plus/minus should be hidden from assistive technology;
- repeated thumbnail and portrait alt text may be redundant; one may need empty alt depending on final reading order;
- “Artwork reference” repeated four times is not meaningful production alt text;
- filters are visually control-like but are noninteractive spans;
- the prototype suppresses the real destination link;
- no explicit focus-visible styling is included;
- no reduced-motion behavior is included.

## Current Next.js files involved

### Primary implementation surface

| File | Current responsibility | Expected Phase 2 role |
|---|---|---|
| `src/app/artists/page.tsx` | Server-loads public artists and profile media, then renders `EditorialIndex` | Remain the server data-composition boundary; map artist records into roster view data |
| `src/components/public/EditorialExperience.tsx` | Provides generic editorial index, detail, and related-content templates | Keep shared detail/related behavior; do not force the approved roster into the generic grid abstraction |
| `src/styles/globals.css` | Holds current public, experience, motion, responsive, and admin styling | Existing 015 tokens/rhythm remain inputs; approved roster styles should be isolated to a deliberate component namespace |
| `src/app/artists/[slug]/page.tsx` | Renders artist detail and selected works | Preserve route and functionality; align metadata/storytelling with the experience language after roster approval |
| `src/lib/repositories/artists.ts` | Exposes public artist list and slug lookup | Preserve contract unless a scoped read-only composition method is demonstrably needed |
| `src/lib/repositories/media.ts` | Resolves artist profile media by ID | Preserve storage contract; use profile media in roster view data |
| `src/lib/cms/artists/artists-prisma-adapter.ts` | Reads ordered, public Prisma artist records and maps them to domain shape | No Phase 2 visual changes expected |
| `src/types/index.ts` | Defines the current `Artist` and `Media` shapes | No schema/contract change expected for the roster |

### Supporting experience surface

| File | Relevance |
|---|---|
| `src/components/layout/Header.tsx` | Establishes public header height, navigation, and page context |
| `src/components/layout/Footer.tsx` | Establishes the page ending and institutional identity |
| `src/app/layout.tsx` | Loads global styles and shared public chrome |
| `src/components/public/ArtistCard.tsx` | Legacy/simple artist card; should not be reused automatically if it conflicts with the approved roster |
| `src/components/public/PageContainer.tsx` | Existing width/padding primitive; evaluate against the reference measurements |
| `public/images/artists/*` and object-storage media URLs | Current local/sample and production artist imagery |

### Files that should not be changed for this migration

- `prisma/schema.prisma`;
- `prisma/migrations/**`;
- database models and relation definitions;
- CMS mutation actions and validation contracts;
- public API contracts;
- unrelated admin/media files currently modified in the working tree.

## Component mapping

This mapping is based on the inspected approved DOM and the current application architecture. Component names remain implementation choices, but the boundaries are now reference-backed.

| Approved experience concept | Next.js responsibility | Proposed boundary |
|---|---|---|
| `.hero` | Static/server-rendered “The roster” heading, introduction, and status taxonomy | Artists page composition; optionally a small `ArtistsRosterHero` server component |
| `.filters` | Relationship filter presentation | Render from supported `representation_status` values; add real filtering only if separately approved |
| `.roster` | Owns one-open-at-a-time state and renders disclosures | New focused client component, `ArtistsRoster` |
| `details.artist` | Native artist disclosure | `ArtistRosterItem`, retaining `<details>/<summary>` semantics |
| `summary` | Closed row and disclosure control | Item markup with number, thumbnail, identity, metadata, and decorative toggle |
| `.panel` | Open two-column media/story region | Item markup or `ArtistRosterPanel`; keep coupled to its disclosure |
| `.portrait` | Large profile-media presentation | Existing resolved profile media, with missing-media fallback |
| `.details` | Metadata, biography excerpt, detail link, and selected works | Rendered from artist and artwork view data |
| `.works` | Four square artwork references | Four public works by the artist, resolved server-side with primary media and meaningful alt text |
| Roster view data | Serializable artist, media, and work presentation data | Created in `src/app/artists/page.tsx` on the server |
| Artist detail | Full persistent entity page | Existing `/artists/[slug]` route and `EditorialDetail` composition |
| Motion behavior | Expansion/reveal contract with reduced-motion fallback | Component-scoped CSS driven by state/ARIA attributes; JavaScript manages state, not measurements unless required by the reference |

### Server/client boundary

The current page should remain a server component. It should continue to:

- query public artists in repository order;
- resolve profile media;
- normalize presentation metadata;
- pass only serializable display data to the interactive roster.

Only the roster state boundary needs client-side React. The client component should own a nullable active artist ID. `null` is the initial state. Activating the closed item sets its ID; activating the open item returns to `null`; activating another item replaces the previous ID in one state update. Controlled `open` plus `onToggle` can retain the reference’s native disclosure semantics while avoiding direct DOM queries.

The current application does not have a dedicated artist-discipline field. The reference’s “Painting”, “Sculpture”, and similar labels cannot be mapped directly from `Artist`. A display discipline could be derived from a selected/public artwork medium, but that is an inference and may be misleading. Until a verified existing source is identified, the safe metadata mapping is representation status plus nationality and birth year. No schema field should be added in this sprint.

The reference’s “Exclusive Artist” value also does not exist in the current CMS options (`represented`, `collaborating`, `archived`). The roster must use actual existing values or an approved presentation-only mapping; it must not invent a persisted status.

## Migration plan

### Gate 1 — approve reference interpretation

1. Confirm `/Users/apple/Downloads/١١١١١.html` is the exact final source of truth.
2. Confirm the prototype header should **not** replace the existing site header; only the roster experience should migrate.
3. Confirm filters should remain visual taxonomy in the first implementation or become functional.
4. Confirm how “Exclusive” should map to existing CMS representation values.
5. Confirm whether discipline should be omitted, derived, or supplied from an already-existing approved field/source.

### Gate 2 — approve the React mapping

1. Confirm the server/client boundary.
2. Confirm whether the roster is a dedicated Artists component or a reusable entity-disclosure primitive.
3. Confirm item content and link behavior.
4. Confirm keyboard, focus, and reduced-motion requirements.
5. Confirm whether URL/hash state is intentionally absent or required.

### Phase 2 implementation sequence after approval

1. Introduce the smallest dedicated roster component needed by the approved reference.
2. Replace only the Artists list rendering; preserve repository, route, CMS, and detail-page behavior.
3. Port approved visual rules into isolated 015 experience styles, reconciling them with existing tokens rather than globally restyling the site.
4. Add motion with an explicit reduced-motion outcome.
5. Validate all-closed initial state, single-open switching, collapse, keyboard use, focus visibility, long content, missing media, and responsive layouts.
6. Run `npm run typecheck` immediately after the implementation step.
7. Compare the result visually against the approved reference before reusing the pattern elsewhere.

## Risks

| Risk | Level | Response |
|---|---|---|
| “Exclusive” has no current CMS representation value | High | Use an approved presentation mapping or omit it; do not change schema/contracts |
| Artist discipline has no dedicated current field | High | Do not infer from medium without approval; use verified existing metadata |
| Porting raw DOM/CSS/JS literally could conflict with React and global styles | High | Preserve behavior and visual identity while mapping state into a focused React boundary and isolating selectors |
| Generic `EditorialIndex` does not support the required disclosure model | High | Use a dedicated roster component; avoid adding Artists-only state to every entity index |
| Existing global CSS is cumulative and includes admin/public rules | Medium | Namespace roster styles and test cascade interactions at all breakpoints |
| Expansion animation may rely on fixed heights or DOM measurement | Medium | Inspect approved script first; prefer resilient layout animation while matching approved timing |
| Accessibility may not be complete in the static reference | Medium | Preserve approved appearance while implementing valid buttons, `aria-expanded`, `aria-controls`, focus behavior, and reduced motion |
| Raw images and unknown intrinsic dimensions can cause layout shift | Medium | Preserve current media contract and reserve approved aspect ratios where metadata permits |
| Current working tree contains active CMS/media edits | High | Avoid those files and resolve branch/worktree ownership before implementation |
| Checked-out branch is not named `main` | Medium | Preserve dirty work and align branch only with explicit approval before implementation |

## Approval gate

The reference has now been fully analyzed and mapped. Phase 2 implementation remains paused, as requested, pending approval of this mapping and direction on the two content mismatches: the unsupported “Exclusive” status and the absence of an artist-discipline field in current contracts.
