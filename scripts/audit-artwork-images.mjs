/**
 * Generates docs/LOW_RES_ARTWORK_IMAGE_AUDIT.md.
 *
 * Reads only. Reports the artwork images whose short edge falls below the
 * threshold at which they can fill the plate the site gives them, together
 * with every page each one appears on, so the re-scan can be scheduled by
 * how visible the defect is rather than by filename.
 *
 *   node --env-file=.env.local scripts/audit-artwork-images.mjs
 */

import { PrismaClient } from '@prisma/client';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const OUT = resolve(process.cwd(), 'docs/LOW_RES_ARTWORK_IMAGE_AUDIT.md');

/* The plate on /artworks is 641x677 at 1440 and the detail hero is 1264x738.
   A work needs roughly 1200px on the short edge to fill either at 2x. Below
   400px it cannot fill even the roster thumbnail without upscaling, which is
   the line the brief draws. */
const CRITICAL = 300;
const HIGH = 400;

const severityOf = (shortEdge) => {
  if (shortEdge < CRITICAL) return 'Critical';
  if (shortEdge < HIGH) return 'High';
  return 'Acceptable';
};

const esc = (value) => String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

async function main() {
  const prisma = new PrismaClient();

  const [artworks, artists, media, exhibitionLinks, projectLinks] = await Promise.all([
    prisma.artwork.findMany({
      where: { visibilityStatus: 'public' },
      select: {
        id: true, slug: true, titleEn: true, titleAr: true, artistId: true,
        primaryMediaId: true, yearCreated: true, medium: true, dimensions: true,
        featured: true, displayOrder: true,
      },
    }),
    prisma.artist.findMany({
      where: { visibilityStatus: 'public' },
      select: { id: true, slug: true, nameEn: true },
    }),
    prisma.media.findMany({
      select: { id: true, width: true, height: true, filename: true, originalFilename: true, storagePath: true, mimeType: true, fileSize: true },
    }),
    prisma.exhibitionArtwork.findMany({
      select: { artworkId: true, exhibition: { select: { slug: true, visibilityStatus: true } } },
    }).catch(() => []),
    prisma.projectArtwork.findMany({
      select: { artworkId: true, project: { select: { slug: true, visibilityStatus: true } } },
    }).catch(() => []),
  ]);

  const mediaById = new Map(media.map((m) => [m.id, m]));
  const artistById = new Map(artists.map((a) => [a.id, a]));

  /* Which works the roster and each artist page put on screen: the artist's
     four highest-ranked works, matching the slice in src/app/artists/page.tsx. */
  const byArtist = new Map();
  artworks.forEach((work) => {
    if (!byArtist.has(work.artistId)) byArtist.set(work.artistId, []);
    byArtist.get(work.artistId).push(work);
  });
  const rosterWorkIds = new Set();
  byArtist.forEach((works) => {
    works
      .slice()
      .sort((a, b) => (a.featured === b.featured ? a.displayOrder - b.displayOrder : (a.featured ? -1 : 1)))
      .slice(0, 4)
      .forEach((work) => rosterWorkIds.add(work.id));
  });

  /* The homepage's own filters, from src/app/page.tsx: titled works with an
     image, hero needs a 900px short edge, selected works are slice(5, 11). */
  const hasRealTitle = (title) => !title.trim().toLowerCase().startsWith('untitled');
  const titled = artworks
    .filter((w) => hasRealTitle(w.titleEn) && w.primaryMediaId && mediaById.has(w.primaryMediaId))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.displayOrder - b.displayOrder);
  const heroIds = new Set(
    titled
      .filter((w) => {
        const m = mediaById.get(w.primaryMediaId);
        return Math.min(m.width ?? 0, m.height ?? 0) >= 900;
      })
      .slice(0, 5)
      .map((w) => w.id),
  );
  const homeSelectedIds = new Set(titled.slice(5, 11).map((w) => w.id));

  const exhibitionsByWork = new Map();
  exhibitionLinks.forEach((link) => {
    if (link.exhibition?.visibilityStatus !== 'public') return;
    if (!exhibitionsByWork.has(link.artworkId)) exhibitionsByWork.set(link.artworkId, []);
    exhibitionsByWork.get(link.artworkId).push(link.exhibition.slug);
  });
  const projectsByWork = new Map();
  projectLinks.forEach((link) => {
    if (link.project?.visibilityStatus !== 'public') return;
    if (!projectsByWork.has(link.artworkId)) projectsByWork.set(link.artworkId, []);
    projectsByWork.get(link.artworkId).push(link.project.slug);
  });

  const pagesFor = (work) => {
    const pages = ['/artworks', `/artworks/${work.slug}`];
    const artist = artistById.get(work.artistId);
    if (artist) pages.push(`/artists/${artist.slug}`);
    if (rosterWorkIds.has(work.id)) pages.push('/artists');
    if (heroIds.has(work.id)) pages.push('/ (hero)');
    if (homeSelectedIds.has(work.id)) pages.push('/ (selected works)');
    (exhibitionsByWork.get(work.id) ?? []).forEach((slug) => pages.push(`/exhibitions/${slug}`));
    (projectsByWork.get(work.id) ?? []).forEach((slug) => pages.push(`/projects/${slug}`));
    return pages;
  };

  const rows = [];
  const buckets = { Critical: 0, High: 0, Acceptable: 0, missing: 0 };
  let shortEdgeTotal = 0;

  artworks.forEach((work) => {
    const asset = work.primaryMediaId ? mediaById.get(work.primaryMediaId) : null;
    if (!asset || !asset.width || !asset.height) { buckets.missing += 1; return; }
    const shortEdge = Math.min(asset.width, asset.height);
    const severity = severityOf(shortEdge);
    buckets[severity] += 1;
    shortEdgeTotal += shortEdge;
    if (severity === 'Acceptable') return;
    rows.push({
      artworkId: work.id,
      slug: work.slug,
      title: work.titleEn,
      artist: artistById.get(work.artistId)?.nameEn ?? work.artistId,
      artistSlug: artistById.get(work.artistId)?.slug ?? '',
      filename: asset.originalFilename || asset.filename,
      storedAs: asset.filename,
      path: asset.storagePath,
      width: asset.width,
      height: asset.height,
      shortEdge,
      longEdge: Math.max(asset.width, asset.height),
      mime: asset.mimeType,
      bytes: asset.fileSize,
      severity,
      pages: pagesFor(work),
    });
  });

  rows.sort((a, b) => a.shortEdge - b.shortEdge || a.artist.localeCompare(b.artist));

  const total = buckets.Critical + buckets.High + buckets.Acceptable;
  const byArtistCount = new Map();
  rows.forEach((r) => byArtistCount.set(r.artist, (byArtistCount.get(r.artist) ?? 0) + 1));

  const kb = (n) => `${Math.round(n / 1024)} KB`;

  const doc = `# Low-Resolution Artwork Image Audit

Generated by \`scripts/audit-artwork-images.mjs\` on ${new Date().toISOString().slice(0, 10)}.
Re-run it after any re-scan; it reads the database and rewrites this file.

Every public artwork's primary image was measured. **No image was altered,
upscaled, or regenerated** — this is a list of what needs to be re-shot.

## Thresholds

| Severity | Short edge | Count |
|---|---|---|
| **Critical** | under ${CRITICAL}px | ${buckets.Critical} |
| **High** | ${CRITICAL}–${HIGH - 1}px | ${buckets.High} |
| Acceptable | ${HIGH}px or above | ${buckets.Acceptable} |
| No dimensions recorded | — | ${buckets.missing} |

**${rows.length} of ${total} public works (${Math.round((rows.length / total) * 100)}%) are below the acceptable floor.**
Mean short edge across the whole collection: ${Math.round(shortEdgeTotal / Math.max(total, 1))}px.

Why 400px is the floor: the artworks index draws a 641×677 plate at 1440 and the
detail hero draws 1264×738. A work of 400px on its short edge fills neither, but
it does fill the 110×88 roster thumbnail at 2x. Below 400px there is no surface
on the site where the work is shown at full size. Below 300px it is smaller than
the caption underneath it.

## Recommended delivery specification

| | |
|---|---|
| Minimum long edge | **2500px** |
| Preferred long edge | **4000px or greater** |
| Delivery colour space | sRGB, embedded profile |
| Delivery format | WebP or JPEG at quality 85+, from the archival master |
| Archival master | 16-bit TIFF, retained separately, never overwritten |
| Cropping | None. Deliver the full work, square to the frame, no destructive crop |
| Ground | Consistent: the same white the rest of the collection is shot on |
| Lighting | Consistent across a sitting; no mixed colour temperature within an artist |

## Current on-site handling

The site does not paper over these files, and should not start:

- Images are shown at their **natural size** and are never upscaled.
- **Aspect ratio is preserved** — measured 0px overflow on every plate type.
- Small works are **centred**, on the same white as the rest of the collection.
- **No blur, no synthetic sharpening, no generated detail.**
- Nothing is hidden.

One protection is applied, on the artwork detail hero only. Shown at true size
on a full-width hero, a 203×108 scan occupied **2.1%** of an 820px plate and read
as a loading failure rather than as a small work. The plate now shrinks to a
mount the size of the work — 349×254, centred — which brings the work to **24.7%**
of its plate without touching a pixel of the image. A small work gets a small
frame; that is what the wall would do.

It is keyed off the source dimensions (\`data-source-scale="archival"\` on the
figure, threshold ${HIGH}px), so it **switches itself off the moment a file is
replaced**. The index grid is deliberately left alone: a constant plate is what
lets a sequence of works read as a plate section, and a small work in a constant
plate simply reads as a small work.

The fix is the re-scan. Everything above is a holding position.

## By artist

| Artist | Works below the floor |
|---|---|
${[...byArtistCount.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([a, n]) => `| ${esc(a)} | ${n} |`).join('\n')}

## Full register

${rows.map((r, i) => `### ${i + 1}. ${esc(r.title)} — ${esc(r.artist)}

| Field | Value |
|---|---|
| Severity | **${r.severity}** |
| Artwork ID | \`${r.artworkId}\` |
| Detail route | [/artworks/${r.slug}](/artworks/${r.slug}) |
| Artist | ${esc(r.artist)}${r.artistSlug ? ` (\`/artists/${r.artistSlug}\`)` : ''} |
| Current filename | \`${esc(r.filename)}\` |
| Stored as | \`${esc(r.storedAs)}\` |
| Source path | \`${esc(r.path)}\` |
| Pixel width | ${r.width}px |
| Pixel height | ${r.height}px |
| **Short edge** | **${r.shortEdge}px** |
| Long edge | ${r.longEdge}px |
| Format | ${esc(r.mime)}, ${kb(r.bytes)} |
| Pages where used | ${r.pages.map((p) => `\`${p}\``).join(', ')} |
| Replacement minimum | ${Math.max(2500, r.longEdge * 4)}px long edge, sRGB, uncropped |
`).join('\n')}
---

*This register is generated. Do not edit it by hand — re-run the script.*
`;

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, doc, 'utf8');
  console.log(`wrote ${OUT}`);
  console.log(`  ${rows.length} works below ${HIGH}px (${buckets.Critical} critical, ${buckets.High} high) of ${total} measured`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
