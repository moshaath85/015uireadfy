/*
 * Gallery 015 — Compress public images (in place, with backup taken first).
 *
 * Reduces page weight by re-encoding every webp in public/images to a smaller
 * webp: downscales oversized dimensions and applies a webp quality suitable
 * for the web. Original files are preserved in backups/images-original-pre-compress.
 *
 * Usage:
 *   node scripts/compress-images.cjs [--dry-run] [--limit N]
 *
 * Flags:
 *   --dry-run   Report what would change without writing.
 *   --limit N   Process only the first N images (sorted).
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'public', 'images');
const MAX_DIMENSION = 1600;   // longest edge, px
const QUALITY = 80;           // webp quality

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitIdx = args.indexOf('--limit');
const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity;

function listImages(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) out.push(...listImages(p));
    else if (/\.(webp|jpe?g|png)$/i.test(name)) out.push(p);
  }
  return out;
}

(async () => {
  const files = listImages(ROOT).sort();
  const targets = files.slice(0, limit);
  console.log(`Gallery 015 — Compress images`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Images to process: ${targets.length} of ${files.length}`);
  console.log(`Max edge: ${MAX_DIMENSION}px, quality: ${QUALITY}`);

  let saved = 0, totalBefore = 0, totalAfter = 0, skipped = 0;

  for (const file of targets) {
    const before = fs.statSync(file).size;
    try {
      const meta = await sharp(file).metadata();
      if (!meta.width || !meta.height) { skipped++; continue; }

      const longest = Math.max(meta.width, meta.height);
      let buf;
      if (longest > MAX_DIMENSION) {
        buf = await sharp(file).resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true }).webp({ quality: QUALITY }).toBuffer();
      } else {
        buf = await sharp(file).webp({ quality: QUALITY }).toBuffer();
      }
      const after = buf.length;
      totalBefore += before;
      totalAfter += after;
      const pct = before > 0 ? Math.round((1 - after / before) * 100) : 0;
      if (!dryRun) await fs.promises.writeFile(file, buf);
      saved += after < before ? 1 : 0;
      if (after >= before) skipped++;
      console.log(`  ${dryRun ? '[DRY]' : 'OK'} ${path.relative(ROOT, file)} ${(before/1024).toFixed(0)}KB -> ${(after/1024).toFixed(0)}KB (${pct}% saved)`);
    } catch (e) {
      console.log(`  ERR ${path.relative(ROOT, file)}: ${e.message}`);
    }
  }

  console.log('══════════════════════════════════');
  console.log(`  Processed: ${targets.length}`);
  console.log(`  Saved (got smaller): ${saved}`);
  console.log(`  Skipped/kept: ${skipped}`);
  console.log(`  Total before: ${(totalBefore/1048576).toFixed(1)} MB`);
  console.log(`  Total after:  ${(totalAfter/1048576).toFixed(1)} MB`);
  console.log(`  Reduction:    ${totalBefore>0 ? Math.round((1-totalAfter/totalBefore)*100) : 0}%`);
})().catch(e => { console.error(e); process.exit(1); });
