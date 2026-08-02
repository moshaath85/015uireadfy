#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import process from 'node:process';
import { getDriveClient } from './gdrive-auth.mjs';

const ROOT = process.cwd();
const IMPORTS_DIR = resolve(ROOT, 'imports');
const rootFolderId = process.argv[2] || process.env.GDRIVE_FOLDER_ID;

if (!rootFolderId) {
  console.error('Usage: node scripts/gdrive-sync.mjs <driveFolderId>');
  process.exit(1);
}

const FOLDER_MIME = 'application/vnd.google-apps.folder';
const GOOGLE_SHEET_MIME = 'application/vnd.google-apps.spreadsheet';

function sanitize(name) {
  return name.replace(/[/\\?%*:|"<>]/g, '-').trim();
}

async function listChildren(drive, folderId) {
  const files = [];
  let pageToken;
  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType, modifiedTime)',
      pageToken,
      pageSize: 1000,
    });
    files.push(...res.data.files);
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  return files;
}

async function downloadFile(drive, file, destPath) {
  const res = await drive.files.get({ fileId: file.id, alt: 'media' }, { responseType: 'arraybuffer' });
  await writeFile(destPath, Buffer.from(res.data));
}

async function exportSheetAsCsv(drive, file, destPath) {
  const res = await drive.files.export({ fileId: file.id, mimeType: 'text/csv' }, { responseType: 'arraybuffer' });
  await writeFile(destPath, Buffer.from(res.data));
}

async function walk(drive, folderId, destDir, summary) {
  await mkdir(destDir, { recursive: true });
  const children = await listChildren(drive, folderId);
  for (const file of children) {
    const name = sanitize(file.name);
    if (file.mimeType === FOLDER_MIME) {
      await walk(drive, file.id, join(destDir, name), summary);
    } else if (file.mimeType === GOOGLE_SHEET_MIME) {
      const destPath = join(destDir, name.endsWith('.csv') ? name : `${name}.csv`);
      await exportSheetAsCsv(drive, file, destPath);
      summary.csv.push(destPath);
      console.log(`CSV (exported): ${destPath}`);
    } else {
      const destPath = join(destDir, name);
      await downloadFile(drive, file, destPath);
      if (/\.csv$/i.test(name)) {
        summary.csv.push(destPath);
      } else if (/\.(png|jpe?g|webp|gif|tiff?)$/i.test(name)) {
        summary.photos.push(destPath);
      } else {
        summary.other.push(destPath);
      }
      console.log(`Downloaded: ${destPath}`);
    }
  }
}

async function main() {
  const drive = await getDriveClient();
  const summary = { csv: [], photos: [], other: [] };
  await walk(drive, rootFolderId, IMPORTS_DIR, summary);
  console.log('\nSync complete.');
  console.log(`CSV files: ${summary.csv.length}`);
  console.log(`Photos: ${summary.photos.length}`);
  console.log(`Other files: ${summary.other.length}`);
  console.log(`\nStaged under: ${IMPORTS_DIR}`);
}

main().catch((error) => {
  console.error('Drive sync failed:', error);
  process.exitCode = 1;
});
