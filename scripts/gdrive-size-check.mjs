#!/usr/bin/env node
import { getDriveClient } from './gdrive-auth.mjs';

const rootFolderId = process.argv[2] || process.env.GDRIVE_FOLDER_ID;
if (!rootFolderId) {
  console.error('Usage: node scripts/gdrive-size-check.mjs <driveFolderId>');
  process.exit(1);
}

const FOLDER_MIME = 'application/vnd.google-apps.folder';

async function listChildren(drive, folderId) {
  const files = [];
  let pageToken;
  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType, size)',
      pageToken,
      pageSize: 1000,
    });
    files.push(...res.data.files);
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  return files;
}

let totalBytes = 0;
let totalFiles = 0;
let totalFolders = 0;

async function walk(drive, folderId) {
  totalFolders += 1;
  const children = await listChildren(drive, folderId);
  for (const file of children) {
    if (file.mimeType === FOLDER_MIME) {
      await walk(drive, file.id);
    } else {
      totalFiles += 1;
      totalBytes += Number(file.size || 0);
    }
  }
}

const drive = await getDriveClient();
await walk(drive, rootFolderId);

const gb = (totalBytes / 1024 ** 3).toFixed(2);
console.log(`Folders: ${totalFolders}`);
console.log(`Files: ${totalFiles}`);
console.log(`Total size: ${gb} GB (${totalBytes} bytes)`);
