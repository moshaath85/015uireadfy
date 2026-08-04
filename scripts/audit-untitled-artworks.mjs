/**
 * Generates docs/UNTITLED_ARTWORK_METADATA_AUDIT.md.
 *
 * Reads only. Renames nothing. Produces the curatorial action list for the
 * works whose public title is "Untitled", together with every field the
 * repository already holds that could distinguish one from another, so the
 * cataloguing pass starts from what is known rather than from a blank page.
 *
 *   node --env-file=.env.local scripts/audit-untitled-artworks.mjs
 */

import { PrismaClient } from '@prisma/client';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const OUT = resolve(process.cwd(), 'docs/UNTITLED_ARTWORK_METADATA_AUDIT.md');

const PLACEHOLDER_DIMENSIONS = /available on request/i;
const PLACEHOLDER_DESCRIPTION = /^part of the 015 gallery collection\.?$/i;
const SEQUENCE = /\((\d+)\)\s*$/;

const isUntitled = (title) => title.trim().toLowerCase().startsWith('untitled');
const esc = (v) => String(v ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ').trim();
const dash = (v) => (v && String(v).trim() ? esc(v) : '—');

async function main() {
  const prisma = new PrismaClient();

  const [artworks, artists, media, collections, certificates] = await Promise.all([
    prisma.artwork.findMany({
      where: { visibilityStatus: 'public' },
      select: {
        id: true, slug: true, titleEn: true, titleAr: true, artistId: true,
        collectionId: true, primaryMediaId: true, yearCreated: true,
        medium: true, dimensions: true, descriptionEn: true, descriptionAr: true,
        displayOrder: true,
      },
    }),
    prisma.artist.findMany({ select: { id: true, slug: true, nameEn: true, nameAr: true } }),
    prisma.media.findMany({ select: { id: true, filename: true, originalFilename: true, width: true, height: true } }),
    prisma.collection.findMany({ select: { id: true, titleEn: true } }).catch(() => []),
    prisma.certificate.findMany({ select: { artworkId: true, certificateNumber: true, status: true } }).catch(() => []),
  ]);

  const artistById = new Map(artists.map((a) => [a.id, a]));
  const mediaById = new Map(media.map((m) => [m.id, m]));
  const collectionById = new Map(collections.map((c) => [c.id, c]));
  const certByArtwork = new Map();
  certificates.forEach((c) => {
    if (!certByArtwork.has(c.artworkId)) certByArtwork.set(c.artworkId, []);
    certByArtwork.get(c.artworkId).push(c);
  });

  const untitled = artworks.filter((w) => isUntitled(w.titleEn));

  const rows = untitled.map((work) => {
    const artist = artistById.get(work.artistId) ?? null;
    const asset = work.primaryMediaId ? mediaById.get(work.primaryMediaId) : null;
    const certs = certByArtwork.get(work.id) ?? [];
    const sequence = SEQUENCE.exec(work.titleEn);
    const realDimensions = work.dimensions && !PLACEHOLDER_DIMENSIONS.test(work.dimensions)
      ? work.dimensions : null;
    const realDescription = work.descriptionEn && !PLACEHOLDER_DESCRIPTION.test(work.descriptionEn.trim())
      ? work.descriptionEn : null;
    const realMedium = work.medium && work.medium.trim() && work.medium.trim() !== '-'
      ? work.medium.trim() : null;
    const year = work.yearCreated > 1000 ? work.yearCreated : null;
    const collection = work.collectionId ? collectionById.get(work.collectionId) ?? null : null;
    /* The Arabic title only adds information when it is not the same
       "بدون عنوان، <artist> (n)" construction as the English. */
    const arabicAddsInformation = Boolean(
      work.titleAr
      && !/^بدون عنوان/.test(work.titleAr.trim())
      && work.titleAr.trim() !== work.titleEn.trim(),
    );

    const signals = [];
    if (sequence) signals.push(`sequence (${sequence[1]})`);
    if (year) signals.push(`year ${year}`);
    if (realDimensions) signals.push('dimensions');
    if (realMedium && realMedium.toLowerCase() !== 'mixed media') signals.push('medium');
    if (certs.length) signals.push(`certificate ${certs.map((c) => c.certificateNumber).join(', ')}`);
    if (collection) signals.push(`collection ${collection.titleEn}`);
    if (realDescription) signals.push('description');
    if (arabicAddsInformation) signals.push('Arabic title');

    /* What the curator has to supply, given what is already on file. There is
       no series or inventory field on this model, so a series designation has
       to be carried by the title until one is added. */
    let action;
    if (year && realDimensions) {
      action = `Confirm the work is genuinely untitled. Enough is on file to catalogue it as *Untitled*, ${year}, ${realDimensions} — the title field still needs the series or the parenthetical.`;
    } else if (year) {
      action = `Supply dimensions, then catalogue as *Untitled*, ${year}. Title field needs a series name or a durable parenthetical.`;
    } else if (realDimensions) {
      action = `Supply year, then catalogue as *Untitled*, ${realDimensions}. Title field needs a series name or a durable parenthetical.`;
    } else {
      action = 'Nothing on file distinguishes this work but its sequence number. Needs year, dimensions, and a title or series designation.';
    }

    return {
      id: work.id,
      slug: work.slug,
      titleEn: work.titleEn,
      titleAr: work.titleAr,
      artist: artist?.nameEn ?? work.artistId,
      artistAr: artist?.nameAr ?? '',
      artistSlug: artist?.slug ?? '',
      year,
      medium: realMedium,
      dimensions: realDimensions,
      collection: collection?.titleEn ?? null,
      certificates: certs.map((c) => `${c.certificateNumber} (${c.status})`),
      description: realDescription,
      arabicAddsInformation,
      sequence: sequence ? sequence[1] : null,
      filename: asset ? (asset.originalFilename || asset.filename) : null,
      signals,
      action,
      displayOrder: work.displayOrder,
    };
  });

  const byArtist = new Map();
  rows.forEach((r) => {
    if (!byArtist.has(r.artist)) byArtist.set(r.artist, []);
    byArtist.get(r.artist).push(r);
  });
  byArtist.forEach((list) => list.sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0) || a.id.localeCompare(b.id)));

  const count = (predicate) => rows.filter(predicate).length;
  const signalTable = [
    ['Parenthetical sequence number in the title', count((r) => r.sequence)],
    ['Year recorded', count((r) => r.year)],
    ['Real dimensions (not "available on request")', count((r) => r.dimensions)],
    ['Medium beyond the generic "Mixed media"', count((r) => r.medium && r.medium.toLowerCase() !== 'mixed media')],
    ['Certificate of authenticity issued', count((r) => r.certificates.length)],
    ['Belongs to a collection', count((r) => r.collection)],
    ['Description beyond the boilerplate', count((r) => r.description)],
    ['Arabic title carrying information the English does not', count((r) => r.arabicAddsInformation)],
  ];

  const noSignal = rows.filter((r) => r.signals.filter((s) => !s.startsWith('sequence')).length === 0);

  const doc = `# Untitled Artwork Metadata Audit

Generated by \`scripts/audit-untitled-artworks.mjs\` on ${new Date().toISOString().slice(0, 10)}.
Re-run it after any cataloguing session; it reads the database and rewrites this file.

**${rows.length} of ${artworks.length} public works (${Math.round((rows.length / artworks.length) * 100)}%) are titled "Untitled".**

**Nothing here has been renamed.** No title was generated, suggested by machine, or
altered. This is a register of what the repository already holds about each work,
so that a curator can catalogue from evidence rather than from a blank field.

## Why this matters more than any interface change

A catalogue in which 94% of entries share one title is an archive, not a programme.
It also constrains the site: \`src/app/page.tsx\` filters the hero and the selected
works to titles that are not "Untitled", which is why the same sixteen works carry
every editorial surface on the homepage. Cataloguing these works widens what the
gallery is able to show without a line of new code.

## What is already on file

| Distinguishing signal | Works |
|---|---|
${signalTable.map(([label, n]) => `| ${label} | ${n} / ${rows.length} |`).join('\n')}

**${noSignal.length} works carry no distinction at all beyond a sequence number.** Those are
the ones where the physical work has to be consulted.

## Cataloguing convention

Where a work is genuinely untitled, the museum convention is a qualified title
rather than a bare repetition:

> *Untitled (Series name)*, year — or *Untitled*, year, when there is no series.

A bare "Untitled" repeated 252 times is not a title; it is the absence of one,
and it makes two works by the same artist indistinguishable in any list, search
result, or certificate.

**No field on the current model holds a series or an inventory reference.** Until one
exists, a series designation has to be carried in \`title_en\` / \`title_ar\`. The
certificate number is the nearest thing to an inventory reference and only ${count((r) => r.certificates.length)}
of these works have one.

## Fields to complete, in priority order

1. \`title_en\` and \`title_ar\` — the title, or the qualified *Untitled (Series)* form.
2. \`year_created\` — ${count((r) => !r.year)} of these works have no year.
3. \`dimensions\` — ${count((r) => !r.dimensions)} say "Dimensions available on request".
4. \`medium\` — ${count((r) => !r.medium || r.medium.toLowerCase() === 'mixed media')} are the generic "Mixed media" or blank.
5. \`description_en\` / \`description_ar\` — ${count((r) => !r.description)} carry only the boilerplate line.

---

# Register, by artist

${[...byArtist.entries()]
  .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
  .map(([artist, list]) => {
    const first = list[0];
    return `## ${esc(artist)}${first.artistAr ? ` · ${esc(first.artistAr)}` : ''} — ${list.length} untitled work${list.length === 1 ? '' : 's'}

${first.artistSlug ? `Artist page: \`/artists/${first.artistSlug}\`\n` : ''}
| # | Artwork ID | Current title (EN) | Current title (AR) | Year | Medium | Dimensions | Collection | Certificate | Image file | Detail route |
|---|---|---|---|---|---|---|---|---|---|---|
${list.map((r) => `| ${r.sequence ?? '—'} | \`${r.id}\` | ${esc(r.titleEn)} | ${dash(r.titleAr)} | ${r.year ?? '—'} | ${dash(r.medium)} | ${dash(r.dimensions)} | ${dash(r.collection)} | ${r.certificates.length ? esc(r.certificates.join(', ')) : '—'} | ${r.filename ? `\`${esc(r.filename)}\`` : '—'} | \`/artworks/${r.slug}\` |`).join('\n')}

**Curatorial review**

${(() => {
      /* Forty-seven identical sentences is not a checklist. Works needing the
         same thing are grouped; anything with a distinction of its own is
         called out on its own line. */
      const groups = new Map();
      list.forEach((r) => {
        const distinctive = r.signals.filter((s) => !s.startsWith('sequence') && !s.startsWith('year'));
        const key = distinctive.length ? `SOLO:${r.id}` : r.action;
        if (!groups.has(key)) groups.set(key, { action: r.action, distinctive, ids: [] });
        groups.get(key).ids.push(r.id);
      });
      return [...groups.values()].map((g) => {
        const ids = g.ids.map((id) => `\`${id}\``).join(', ');
        const prefix = g.distinctive.length
          ? `${ids} — already distinguished by ${g.distinctive.join('; ')}. `
          : `${g.ids.length > 1 ? `${g.ids.length} works (${ids})` : ids} — `;
        return `- ${prefix}${g.action}`;
      }).join('\n');
    })()}
`;
  }).join('\n---\n\n')}

---

*This register is generated. Do not edit it by hand — catalogue in the CMS and re-run the script.*
`;

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, doc, 'utf8');
  console.log(`wrote ${OUT}`);
  console.log(`  ${rows.length} untitled works across ${byArtist.size} artists; ${noSignal.length} with no distinction beyond a sequence number`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
