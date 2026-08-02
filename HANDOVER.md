# 015 Gallery — Session Handover

**Date:** 1 August 2026
**Project:** `/Users/apple/Downloads/015_Gallery_GitHub_Ready_Sprint_01`
**Status:** Homepage redesigned & approved. Design system extended sitewide. All pages 200, build clean.

---

## ⚠️ READ THIS FIRST — how to work with this user

1. **The user has ADHD.** Keep replies short and scannable. One decision at a time.
   Bullets and tables over paragraphs. Lead with the conclusion.

2. **My screenshot tool renders unreliably on this machine.** It returns black
   frames, stale paint, and timeouts. It cost this session a lot of wasted credits
   and trust. **Do not trust `computer{action:"screenshot"}` as ground truth.**
   Instead:
   - Verify with `javascript_tool` and read real DOM measurements
     (`getBoundingClientRect`, `getComputedStyle`, `naturalWidth`).
   - **Ask the user for screenshots.** Theirs are accurate and were by far the
     fastest path to real bugs every single time.

3. **Do not redesign things the user did not ask about.** I once "improved" the
   hero into a custom artwork layout unprompted and made it worse. The user's
   words: *"why you keep locking yourself in one corner."* Fix the specific thing,
   nothing else.

4. **The user is paying for this and the revenue funds medical bills.** Be
   efficient. Don't burn turns on discussion when you can act.

---

## Stack & how to run

| | |
|---|---|
| Framework | Next.js **16.2.10** (Turbopack), React 18.3.1 |
| DB | **Neon serverless Postgres** (cloud, not local) via Prisma 5.22 |
| Dev server | `npm run dev` → **http://localhost:3001** (3000 is taken by another project) |
| Env file | `.env.local` — **must** use `node --env-file=.env.local …` for scripts |
| Typecheck | `npm run typecheck` |
| Build | `npx dotenv-cli -e .env.local -- npm run build` |

**Neon is cloud-hosted and sleeps when idle.** First request after inactivity is
slow or may error `P1001`/`P2024`. That is normal — retry. I already set
`connection_limit=10&pool_timeout=30` on `DATABASE_URL` to stop pool exhaustion.

---

## Content in the database

Imported this session from the user's Google Drive (4 GB, 1,716 files).

| Entity | Count | Notes |
|---|---|---|
| Artists | 68 | 24 with real researched bios (EN+AR); 42 name-only stubs |
| Artist portraits | 7 | rest have no portrait on file |
| Artworks | 233 | 20 have **real** titles/medium/dimensions from certificates |
| Certificates | 20 | from `Art certificates.xlsx` |
| Exhibitions | 15 | dates/venues are **placeholders** — need real data |
| Projects | 8 | real names, placeholder descriptions |
| News / Journal | 9 | 8 real essays parsed from .docx |
| Media | 277 | real pixel dimensions backfilled |

**Data flow:** edit `data/*.json` → dry-run `node scripts/migrate-legacy-json.mjs`
→ apply `node --env-file=.env.local scripts/migrate-legacy-json.mjs --execute`.
Always dry-run first; it validates relationships.

### Google Drive sync (already authorised)
- `scripts/gdrive-sync.mjs <folderId>` — pulls the Drive tree into `imports/`
- Folder ID: `1vTUvdQt9aNT1IzVASi780-ci7E2ZD2DH`
- Credentials in `scripts/gdrive-credentials.json` (gitignored)
- OAuth app must stay in **Testing** mode with the user as a test user

---

## Design system (APPROVED by user)

**Identity: quiet authority.** The artwork speaks; the interface gets out of the way.
Reference: White Cube / David Zwirner. Craig Mod for reading pages.

### Files
| File | Scope |
|---|---|
| `src/styles/home-2026.css` | Homepage only. All selectors under `.hp` so they cannot collide with legacy CSS. |
| `src/styles/site-2026.css` | Sitewide. Loaded **after** `globals.css` in `layout.tsx`; refines existing markup. |
| `src/app/page.tsx` | Homepage |
| `src/components/public/home/HeroRotator.tsx` | Client component — the hero |
| `src/styles/globals.css` | **Legacy, tangled.** Avoid editing. Override in `site-2026.css` instead. |

### Rules — do not break these
1. **Pure white `#FFFFFF`** page ground everywhere. It matches the white the
   artwork photography is shot on, so photo edges disappear.
2. **Paintings are NEVER cropped** → `object-fit: contain`, centred on white,
   museum shadow. Cropping a painting is the cardinal sin here.
3. **Documentary photography fills its frame** → `object-fit: cover`.
   (Installation views, artist portraits, project sites.)
4. **One hairline frame** `1px rgba(18,17,15,.13)` on every image plate.
5. **No text over images.** The hero is split — type left, art right. This
   designs out an entire class of legibility bug that kept recurring.
6. Serif display: `"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif`
7. One container + one spacing scale so every section shares identical margins.

### Homepage structure
Hero (rotator) → Statement → Programme → Selected works → Roster → Projects →
Journal → Visit.

**Hero rotator:** one artwork at a time, auto-flips every 6.5 s with a 1.15 s
cross-fade. Title / artist / medium cross-fade **in sync** with the image.
Pauses on hover. `01 —— 05` counter + click-to-jump markers. Respects
`prefers-reduced-motion`. All slides preload (a hidden lazy image flashes blank).
**Gated to sources ≥900 px on the short edge** — the hero renders very large and
small scans fall apart.

---

## ⚠️ Image trimming — important

The artwork photos had **white padding baked into the file**, so a contained image
showed a big white rectangle with the painting small inside it, and the shadow
wrapped the white box instead of the art. This was the "edges" problem.

**I trimmed 198 of 233 artwork images in place.**
**Originals are backed up in `public/images/_original_untrimmed/`** — fully reversible.

If new artwork images are added, they likely need the same treatment. The script
used Pillow, sampled the corner colour as background, and refused any crop
removing >75% of the image.

---

## Known bugs fixed this session (don't reintroduce)

1. **`aspect-ratio` without `width:100%`** on a stretched grid child makes the
   element compute its *width from the row height* → images overflow right and
   overlap. This bit me in **four** separate places. Always pair them.
2. **`place-content:center`** on a grid image container stops the track
   stretching, leaving beige gaps around images.
3. **Next.js 16 async `params`/`searchParams`** — fixed across **23 page files**.
   They are Promises now and must be awaited.
4. **Raw `<script>` in JSX never executes.** Use `next/script`.
5. **N+1 database queries** on the homepage — was ~20 sequential round-trips to a
   remote DB (20–45 s loads, frequent 500s). Now one batched media fetch. **1–4 s.**
6. Homepage showed `Gallery 015` instead of real artist names — the lookup map
   only contained featured artists.

---

## Verification method that actually works

My screenshots lie. This does not — run in `javascript_tool`:

```js
// overlap + overflow + broken-image audit
(function(){
  const seen=new Set(),ov=[];
  Array.from(document.querySelectorAll('*'))
    .filter(el=>{const d=getComputedStyle(el).display;return d==='grid'||d==='flex';})
    .forEach(c=>{
      const k=Array.from(c.children).filter(x=>{
        const q=x.getBoundingClientRect(),cs=getComputedStyle(x);
        return q.width>10&&q.height>10&&cs.position!=='absolute'
          &&cs.position!=='fixed'&&cs.visibility!=='hidden'&&+cs.opacity>.05;});
      for(let i=0;i<k.length;i++)for(let j=i+1;j<k.length;j++){
        const a=k[i].getBoundingClientRect(),b=k[j].getBoundingClientRect();
        const ox=Math.min(a.right,b.right)-Math.max(a.left,b.left);
        const oy=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);
        if(ox>8&&oy>8){const key=k[i].className+'|'+k[j].className;
          if(!seen.has(key)){seen.add(key);ov.push(key.slice(0,44));}}}
    });
  return JSON.stringify({overlaps:ov,
    docW:document.documentElement.scrollWidth,vw:innerWidth,
    broken:Array.from(document.images).filter(i=>i.complete&&i.naturalWidth===0).length});
})();
```

**Note:** check children of *every grid/flex container*, not just `<section>`
children. My first audit only checked section children and missed every real bug
the user could plainly see.

Always test at **1920×1080 and 375×812**, and reload after resizing.

---

## Current state

✅ Homepage redesigned and **approved by the user**
✅ Design system extended to all pages via `site-2026.css`
✅ Artwork no longer cropped anywhere
✅ All 11 public pages return 200
✅ Zero overlaps / overflow / broken images at both breakpoints
✅ TypeScript clean, production build succeeds

---

## Suggested next steps

1. **Real exhibition dates & venues.** All 15 use placeholder dates. One is
   artificially set "current" (`vernissage-new-old-work-sama-gallery`,
   Jul 1 – Sep 15 2026) purely so the homepage Programme section has content.
2. **Artwork titles.** 213 of 233 are `Untitled, <Artist> (n)`. Only certified
   works have real titles. These are filtered out of the homepage but do show on
   `/artworks`.
3. **Artist portraits.** Only 7 of 68. **Note:** the portrait in the Drive folder
   `فهد الحجيلان` appears to be the wrong person — Fahad Al-Hijailan died in 2018
   aged 61 and the photo looks far more recent. Its link was removed; the Drive
   folder itself may need correcting.
4. **Photography quality** is the biggest remaining drag on perceived quality —
   several sources are phone snapshots, and some are too low-res for feature use.
5. `public/preview-home.html` is a standalone mockup, now **behind** the live
   homepage. Delete it or re-sync.
6. Interactive admin flows (create/edit forms) were **never exercised** — only
   page loads were verified.
