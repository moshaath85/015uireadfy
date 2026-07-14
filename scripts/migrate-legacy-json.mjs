#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const DATA = resolve(ROOT, 'data');
const execute = process.argv.includes('--execute');
const dryRun = !execute;
const organizationId = process.env.GALLERY015_ADMIN_ORGANIZATION_ID?.trim() || 'gallery-015';

const files = {
  settings: 'settings.json',
  media: 'media.json',
  artists: 'artists.json',
  collections: 'collections.json',
  artworks: 'artworks.json',
  exhibitions: 'exhibitions.json',
  exhibitionArtists: 'exhibition_artists.json',
  exhibitionArtworks: 'exhibition_artworks.json',
  projects: 'projects.json',
  projectArtists: 'project_artists.json',
  projectArtworks: 'project_artworks.json',
  services: 'services.json',
  news: 'news.json',
  publications: 'publications.json',
  certificates: 'certificates.json',
};

const report = {
  mode: dryRun ? 'dry-run' : 'execute',
  organizationId,
  startedAt: new Date().toISOString(),
  sources: {},
  entities: {},
  warnings: [],
  errors: [],
};

function asArray(value, name) {
  if (!Array.isArray(value)) throw new Error(`${name} must contain a JSON array.`);
  return value;
}

async function readJson(filename) {
  const path = resolve(DATA, filename);
  const raw = await readFile(path, 'utf8');
  return JSON.parse(raw);
}

function required(record, fields, entity) {
  const missing = fields.filter((field) => record[field] === undefined || record[field] === null || record[field] === '');
  if (missing.length) throw new Error(`${entity} ${record.id ?? '(no id)'} missing: ${missing.join(', ')}`);
}

function date(value, fallback = new Date()) {
  const parsed = value ? new Date(value) : fallback;
  if (Number.isNaN(parsed.getTime())) throw new Error(`Invalid date: ${value}`);
  return parsed;
}

function mediaType(value) {
  const normalized = String(value || 'other').toUpperCase();
  return ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'OTHER'].includes(normalized) ? normalized : 'OTHER';
}

function mediaVisibility(value) {
  const normalized = String(value || 'PUBLIC').toUpperCase();
  return ['PUBLIC', 'PRIVATE', 'VIP', 'HIDDEN'].includes(normalized) ? normalized : 'PUBLIC';
}

function relationValue(record, names) {
  for (const name of names) if (record[name] !== undefined) return record[name];
  return undefined;
}

function validateRelations(data) {
  const ids = {
    media: new Set(data.media.map((x) => x.id)),
    artists: new Set(data.artists.map((x) => x.id)),
    collections: new Set(data.collections.map((x) => x.id)),
    artworks: new Set(data.artworks.map((x) => x.id)),
    exhibitions: new Set(data.exhibitions.map((x) => x.id)),
    projects: new Set(data.projects.map((x) => x.id)),
  };

  for (const artist of data.artists) {
    if (artist.profile_image_id && !ids.media.has(artist.profile_image_id)) report.errors.push(`Artist ${artist.id}: missing media ${artist.profile_image_id}`);
  }
  for (const artwork of data.artworks) {
    if (!ids.artists.has(artwork.artist_id)) report.errors.push(`Artwork ${artwork.id}: missing artist ${artwork.artist_id}`);
    if (artwork.collection_id && !ids.collections.has(artwork.collection_id)) report.errors.push(`Artwork ${artwork.id}: missing collection ${artwork.collection_id}`);
    if (!ids.media.has(artwork.primary_image_id)) report.errors.push(`Artwork ${artwork.id}: missing primary media ${artwork.primary_image_id}`);
  }
  for (const item of data.exhibitionArtists) {
    const exhibitionId = relationValue(item, ['exhibition_id', 'exhibitionId']);
    const artistId = relationValue(item, ['artist_id', 'artistId']);
    if (!ids.exhibitions.has(exhibitionId) || !ids.artists.has(artistId)) report.errors.push(`Invalid exhibition-artist relation: ${JSON.stringify(item)}`);
  }
  for (const item of data.exhibitionArtworks) {
    const exhibitionId = relationValue(item, ['exhibition_id', 'exhibitionId']);
    const artworkId = relationValue(item, ['artwork_id', 'artworkId']);
    if (!ids.exhibitions.has(exhibitionId) || !ids.artworks.has(artworkId)) report.errors.push(`Invalid exhibition-artwork relation: ${JSON.stringify(item)}`);
  }
  for (const item of data.projectArtists) {
    const projectId = relationValue(item, ['project_id', 'projectId']);
    const artistId = relationValue(item, ['artist_id', 'artistId']);
    if (!ids.projects.has(projectId) || !ids.artists.has(artistId)) report.errors.push(`Invalid project-artist relation: ${JSON.stringify(item)}`);
  }
  for (const item of data.projectArtworks) {
    const projectId = relationValue(item, ['project_id', 'projectId']);
    const artworkId = relationValue(item, ['artwork_id', 'artworkId']);
    if (!ids.projects.has(projectId) || !ids.artworks.has(artworkId)) report.errors.push(`Invalid project-artwork relation: ${JSON.stringify(item)}`);
  }
}

async function loadData() {
  const loaded = {};
  for (const [key, filename] of Object.entries(files)) {
    const value = await readJson(filename);
    loaded[key] = key === 'settings' ? value : asArray(value, filename);
    report.sources[key] = filename;
    report.entities[key] = { found: key === 'settings' ? 1 : loaded[key].length, inserted: 0, updated: 0, skipped: 0 };
  }
  return loaded;
}

function validate(data) {
  for (const item of data.media) required(item, ['id', 'url', 'mime_type'], 'media');
  for (const item of data.artists) required(item, ['id', 'slug', 'name_en', 'name_ar', 'bio_en', 'bio_ar', 'birth_year', 'nationality_en', 'nationality_ar', 'representation_status'], 'artist');
  for (const item of data.collections) required(item, ['id', 'slug', 'title_en', 'title_ar', 'description_en', 'description_ar'], 'collection');
  for (const item of data.artworks) required(item, ['id', 'slug', 'title_en', 'title_ar', 'description_en', 'description_ar', 'artist_id', 'primary_image_id', 'year', 'medium_en', 'dimensions', 'price_status', 'availability_status'], 'artwork');
  for (const item of data.exhibitions) required(item, ['id', 'slug', 'title_en', 'title_ar', 'description_en', 'description_ar', 'start_date', 'end_date', 'venue_en', 'venue_ar'], 'exhibition');
  for (const item of data.projects) required(item, ['id', 'slug', 'title_en', 'title_ar', 'description_en', 'description_ar', 'type', 'year', 'status'], 'project');
  for (const item of data.services) required(item, ['id', 'slug', 'title_en', 'title_ar', 'description_en', 'description_ar', 'features_en', 'features_ar'], 'service');
  for (const item of data.news) required(item, ['id', 'slug', 'title_en', 'title_ar', 'content_en', 'content_ar', 'excerpt_en', 'excerpt_ar', 'category', 'publish_date'], 'news');
  for (const item of data.publications) required(item, ['id', 'slug', 'title_en', 'title_ar', 'description_en', 'description_ar', 'type', 'file_url', 'publish_date'], 'publication');
  validateRelations(data);
}

async function saveReport() {
  report.completedAt = new Date().toISOString();
  const path = resolve(ROOT, 'legacy-migration-report.json');
  await writeFile(path, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return path;
}

async function migrate(data) {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required for --execute.');
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  async function upsert(delegate, key, args) {
    const existed = await delegate.findUnique({ where: { id: args.where.id }, select: { id: true } });
    await delegate.upsert(args);
    report.entities[key][existed ? 'updated' : 'inserted'] += 1;
  }

  try {
    await prisma.organization.upsert({
      where: { id: organizationId },
      create: { id: organizationId, name: data.settings.site_name_en || 'Gallery 015', slug: 'gallery-015', status: 'active', description: data.settings.description_en, contactEmail: data.settings.contact_email, locale: 'en', timezone: 'Asia/Riyadh', metadata: data.settings },
      update: { name: data.settings.site_name_en || 'Gallery 015', description: data.settings.description_en, contactEmail: data.settings.contact_email, metadata: data.settings },
    });

    const existingSettings = await prisma.systemConfiguration.findFirst({ where: { organizationId, scope: 'ORGANIZATION', key: 'legacy.site.settings', archivedAt: null }, select: { id: true } });
    if (existingSettings) {
      await prisma.systemConfiguration.update({ where: { id: existingSettings.id }, data: { value: data.settings, valueType: 'JSON', isActive: true } });
      report.entities.settings.updated = 1;
    } else {
      await prisma.systemConfiguration.create({ data: { organizationId, scope: 'ORGANIZATION', key: 'legacy.site.settings', valueType: 'JSON', value: data.settings, description: 'Imported from data/settings.json', isActive: true } });
      report.entities.settings.inserted = 1;
    }

    for (const item of data.media) await upsert(prisma.media, 'media', {
      where: { id: item.id },
      create: { id: item.id, organizationId, filename: item.storage_path?.split('/').pop() || item.id, originalFilename: item.storage_path?.split('/').pop() || item.id, mimeType: item.mime_type, mediaType: mediaType(item.type), storagePath: item.storage_path || item.url, altText: item.alt_en || item.alt_ar || null, width: item.width ?? null, height: item.height ?? null, fileSize: Number(item.file_size || 0), visibility: mediaVisibility(item.visibility_status), checksum: item.checksum || null, createdAt: date(item.created_at), updatedAt: date(item.updated_at || item.created_at) },
      update: { organizationId, filename: item.storage_path?.split('/').pop() || item.id, originalFilename: item.storage_path?.split('/').pop() || item.id, mimeType: item.mime_type, mediaType: mediaType(item.type), storagePath: item.storage_path || item.url, altText: item.alt_en || item.alt_ar || null, width: item.width ?? null, height: item.height ?? null, fileSize: Number(item.file_size || 0), visibility: mediaVisibility(item.visibility_status), checksum: item.checksum || null },
    });

    for (const item of data.artists) await upsert(prisma.artist, 'artists', {
      where: { id: item.id },
      create: { id: item.id, organizationId, slug: item.slug, nameEn: item.name_en, nameAr: item.name_ar, bioEn: item.bio_en, bioAr: item.bio_ar, birthYear: Number(item.birth_year), nationalityEn: item.nationality_en, nationalityAr: item.nationality_ar, website: item.website || null, email: item.email || null, instagram: item.instagram || null, profileImageId: item.profile_image_id || null, featured: Boolean(item.featured), displayOrder: Number(item.display_order || 0), representationStatus: item.representation_status, visibilityStatus: item.visibility_status || 'private', createdAt: date(item.created_at), updatedAt: date(item.updated_at || item.created_at) },
      update: { organizationId, slug: item.slug, nameEn: item.name_en, nameAr: item.name_ar, bioEn: item.bio_en, bioAr: item.bio_ar, birthYear: Number(item.birth_year), nationalityEn: item.nationality_en, nationalityAr: item.nationality_ar, website: item.website || null, email: item.email || null, instagram: item.instagram || null, profileImageId: item.profile_image_id || null, featured: Boolean(item.featured), displayOrder: Number(item.display_order || 0), representationStatus: item.representation_status, visibilityStatus: item.visibility_status || 'private' },
    });

    for (const item of data.collections) await upsert(prisma.collection, 'collections', {
      where: { id: item.id },
      create: { id: item.id, organizationId, slug: item.slug, titleEn: item.title_en, titleAr: item.title_ar, descriptionEn: item.description_en, descriptionAr: item.description_ar, coverMediaId: item.cover_media_id || null, featured: Boolean(item.featured), visibilityStatus: item.visibility_status || 'private', displayOrder: Number(item.display_order || 0), createdAt: date(item.created_at), updatedAt: date(item.updated_at || item.created_at) },
      update: { organizationId, slug: item.slug, titleEn: item.title_en, titleAr: item.title_ar, descriptionEn: item.description_en, descriptionAr: item.description_ar, coverMediaId: item.cover_media_id || null, featured: Boolean(item.featured), visibilityStatus: item.visibility_status || 'private', displayOrder: Number(item.display_order || 0) },
    });

    for (const item of data.artworks) await upsert(prisma.artwork, 'artworks', {
      where: { id: item.id },
      create: { id: item.id, organizationId, slug: item.slug, titleEn: item.title_en, titleAr: item.title_ar, descriptionEn: item.description_en, descriptionAr: item.description_ar, artistId: item.artist_id, collectionId: item.collection_id || null, primaryMediaId: item.primary_image_id, yearCreated: Number(item.year), medium: item.medium_en || item.medium_ar, dimensions: item.dimensions, priceVisibility: item.price_status, availabilityStatus: item.availability_status, featured: Boolean(item.featured || item.is_featured_homepage), displayOrder: Number(item.display_order || 0), visibilityStatus: item.visibility_status || 'private', createdAt: date(item.created_at), updatedAt: date(item.updated_at || item.created_at) },
      update: { organizationId, slug: item.slug, titleEn: item.title_en, titleAr: item.title_ar, descriptionEn: item.description_en, descriptionAr: item.description_ar, artistId: item.artist_id, collectionId: item.collection_id || null, primaryMediaId: item.primary_image_id, yearCreated: Number(item.year), medium: item.medium_en || item.medium_ar, dimensions: item.dimensions, priceVisibility: item.price_status, availabilityStatus: item.availability_status, featured: Boolean(item.featured || item.is_featured_homepage), displayOrder: Number(item.display_order || 0), visibilityStatus: item.visibility_status || 'private' },
    });

    for (const item of data.exhibitions) await upsert(prisma.exhibition, 'exhibitions', {
      where: { id: item.id },
      create: { id: item.id, organizationId, slug: item.slug, titleEn: item.title_en, titleAr: item.title_ar, descriptionEn: item.description_en, descriptionAr: item.description_ar, startDate: date(item.start_date), endDate: date(item.end_date), venueEn: item.venue_en, venueAr: item.venue_ar, coverMediaId: item.cover_media_id || null, status: item.status || 'planned', featured: Boolean(item.featured), visibilityStatus: item.visibility_status || 'private', displayOrder: Number(item.display_order || 0), createdAt: date(item.created_at), updatedAt: date(item.updated_at || item.created_at) },
      update: { organizationId, slug: item.slug, titleEn: item.title_en, titleAr: item.title_ar, descriptionEn: item.description_en, descriptionAr: item.description_ar, startDate: date(item.start_date), endDate: date(item.end_date), venueEn: item.venue_en, venueAr: item.venue_ar, coverMediaId: item.cover_media_id || null, status: item.status || 'planned', featured: Boolean(item.featured), visibilityStatus: item.visibility_status || 'private', displayOrder: Number(item.display_order || 0) },
    });

    for (const item of data.projects) await upsert(prisma.project, 'projects', {
      where: { id: item.id },
      create: { id: item.id, organizationId, slug: item.slug, titleEn: item.title_en, titleAr: item.title_ar, descriptionEn: item.description_en, descriptionAr: item.description_ar, clientEn: item.client_en || null, clientAr: item.client_ar || null, type: item.type, year: Number(item.year), status: item.status, featured: Boolean(item.featured), coverMediaId: item.cover_media_id || null, visibilityStatus: item.visibility_status || 'private', displayOrder: Number(item.display_order || 0), createdAt: date(item.created_at), updatedAt: date(item.updated_at || item.created_at) },
      update: { organizationId, slug: item.slug, titleEn: item.title_en, titleAr: item.title_ar, descriptionEn: item.description_en, descriptionAr: item.description_ar, clientEn: item.client_en || null, clientAr: item.client_ar || null, type: item.type, year: Number(item.year), status: item.status, featured: Boolean(item.featured), coverMediaId: item.cover_media_id || null, visibilityStatus: item.visibility_status || 'private', displayOrder: Number(item.display_order || 0) },
    });

    for (const item of data.services) await upsert(prisma.service, 'services', {
      where: { id: item.id },
      create: { id: item.id, organizationId, slug: item.slug, titleEn: item.title_en, titleAr: item.title_ar, descriptionEn: item.description_en, descriptionAr: item.description_ar, featuresEn: item.features_en, featuresAr: item.features_ar, priceInfo: item.price_info ?? null, coverMediaId: item.cover_media_id || null, visibilityStatus: item.visibility_status || 'private', displayOrder: Number(item.display_order || 0), createdAt: date(item.created_at), updatedAt: date(item.updated_at || item.created_at) },
      update: { organizationId, slug: item.slug, titleEn: item.title_en, titleAr: item.title_ar, descriptionEn: item.description_en, descriptionAr: item.description_ar, featuresEn: item.features_en, featuresAr: item.features_ar, priceInfo: item.price_info ?? null, coverMediaId: item.cover_media_id || null, visibilityStatus: item.visibility_status || 'private', displayOrder: Number(item.display_order || 0) },
    });

    for (const item of data.news) await upsert(prisma.news, 'news', {
      where: { id: item.id },
      create: { id: item.id, organizationId, slug: item.slug, titleEn: item.title_en, titleAr: item.title_ar, contentEn: item.content_en, contentAr: item.content_ar, excerptEn: item.excerpt_en, excerptAr: item.excerpt_ar, category: item.category, publishDate: date(item.publish_date), imageId: item.image_id || null, visibilityStatus: item.visibility_status || 'private', displayOrder: Number(item.display_order || 0), createdAt: date(item.created_at), updatedAt: date(item.updated_at || item.created_at) },
      update: { organizationId, slug: item.slug, titleEn: item.title_en, titleAr: item.title_ar, contentEn: item.content_en, contentAr: item.content_ar, excerptEn: item.excerpt_en, excerptAr: item.excerpt_ar, category: item.category, publishDate: date(item.publish_date), imageId: item.image_id || null, visibilityStatus: item.visibility_status || 'private', displayOrder: Number(item.display_order || 0) },
    });

    for (const item of data.publications) await upsert(prisma.publication, 'publications', {
      where: { id: item.id },
      create: { id: item.id, organizationId, slug: item.slug, titleEn: item.title_en, titleAr: item.title_ar, descriptionEn: item.description_en, descriptionAr: item.description_ar, type: item.type, fileUrl: item.file_url, coverImageId: item.cover_image_id || null, publishDate: date(item.publish_date), visibilityStatus: item.visibility_status || 'private', displayOrder: Number(item.display_order || 0), createdAt: date(item.created_at), updatedAt: date(item.updated_at || item.created_at) },
      update: { organizationId, slug: item.slug, titleEn: item.title_en, titleAr: item.title_ar, descriptionEn: item.description_en, descriptionAr: item.description_ar, type: item.type, fileUrl: item.file_url, coverImageId: item.cover_image_id || null, publishDate: date(item.publish_date), visibilityStatus: item.visibility_status || 'private', displayOrder: Number(item.display_order || 0) },
    });

    for (const item of data.certificates) await upsert(prisma.certificate, 'certificates', {
      where: { id: item.id },
      create: { id: item.id, organizationId, certificateNumber: item.certificate_number, artworkId: item.artwork_id, issuedDate: date(item.issued_date), templateId: item.template_id || null, qrCode: item.qr_code || null, verificationUrl: item.verification_url, status: item.status || 'draft', issuedBy: item.issued_by || 'legacy-import', approvedBy: item.approved_by || 'legacy-import', issuedVersion: Number(item.issued_version || 1), issuedAt: date(item.issued_at || item.issued_date) },
      update: { organizationId, certificateNumber: item.certificate_number, artworkId: item.artwork_id, issuedDate: date(item.issued_date), templateId: item.template_id || null, qrCode: item.qr_code || null, verificationUrl: item.verification_url, status: item.status || 'draft', issuedBy: item.issued_by || 'legacy-import', approvedBy: item.approved_by || 'legacy-import', issuedVersion: Number(item.issued_version || 1), issuedAt: date(item.issued_at || item.issued_date) },
    });

    for (const item of data.exhibitionArtists) {
      const exhibitionId = relationValue(item, ['exhibition_id', 'exhibitionId']);
      const artistId = relationValue(item, ['artist_id', 'artistId']);
      const where = { organizationId_exhibitionId_artistId: { organizationId, exhibitionId, artistId } };
      const existed = await prisma.exhibitionArtist.findUnique({ where, select: { id: true } });
      await prisma.exhibitionArtist.upsert({ where, create: { organizationId, exhibitionId, artistId, role: item.role || 'artist', displayOrder: Number(item.display_order || 0) }, update: { role: item.role || 'artist', displayOrder: Number(item.display_order || 0), archivedAt: null } });
      report.entities.exhibitionArtists[existed ? 'updated' : 'inserted'] += 1;
    }
    for (const item of data.exhibitionArtworks) {
      const exhibitionId = relationValue(item, ['exhibition_id', 'exhibitionId']);
      const artworkId = relationValue(item, ['artwork_id', 'artworkId']);
      const where = { organizationId_exhibitionId_artworkId: { organizationId, exhibitionId, artworkId } };
      const existed = await prisma.exhibitionArtwork.findUnique({ where, select: { id: true } });
      await prisma.exhibitionArtwork.upsert({ where, create: { organizationId, exhibitionId, artworkId, displayOrder: Number(item.display_order || 0) }, update: { displayOrder: Number(item.display_order || 0), archivedAt: null } });
      report.entities.exhibitionArtworks[existed ? 'updated' : 'inserted'] += 1;
    }
    for (const item of data.projectArtists) {
      const projectId = relationValue(item, ['project_id', 'projectId']);
      const artistId = relationValue(item, ['artist_id', 'artistId']);
      const where = { organizationId_projectId_artistId: { organizationId, projectId, artistId } };
      const existed = await prisma.projectArtist.findUnique({ where, select: { id: true } });
      await prisma.projectArtist.upsert({ where, create: { organizationId, projectId, artistId, role: item.role || 'artist', displayOrder: Number(item.display_order || 0) }, update: { role: item.role || 'artist', displayOrder: Number(item.display_order || 0), archivedAt: null } });
      report.entities.projectArtists[existed ? 'updated' : 'inserted'] += 1;
    }
    for (const item of data.projectArtworks) {
      const projectId = relationValue(item, ['project_id', 'projectId']);
      const artworkId = relationValue(item, ['artwork_id', 'artworkId']);
      const where = { organizationId_projectId_artworkId: { organizationId, projectId, artworkId } };
      const existed = await prisma.projectArtwork.findUnique({ where, select: { id: true } });
      await prisma.projectArtwork.upsert({ where, create: { organizationId, projectId, artworkId, inclusionNote: item.inclusion_note || null, displayOrder: Number(item.display_order || 0) }, update: { inclusionNote: item.inclusion_note || null, displayOrder: Number(item.display_order || 0), archivedAt: null } });
      report.entities.projectArtworks[existed ? 'updated' : 'inserted'] += 1;
    }
  } finally {
    await prisma.$disconnect();
  }
}

try {
  const data = await loadData();
  validate(data);
  if (report.errors.length) throw new Error(`Legacy data validation failed with ${report.errors.length} relationship error(s).`);
  if (execute) await migrate(data);
  const reportPath = await saveReport();
  console.log(`${dryRun ? 'Dry run' : 'Migration'} complete.`);
  console.log(`Report: ${reportPath}`);
  console.table(Object.fromEntries(Object.entries(report.entities).map(([key, value]) => [key, value])));
} catch (error) {
  report.errors.push(error instanceof Error ? error.message : String(error));
  const reportPath = await saveReport();
  console.error(`Migration failed. Report: ${reportPath}`);
  console.error(error);
  process.exitCode = 1;
}
