import "server-only";

import type { Prisma } from "@prisma/client";
import { MediaType, MediaVisibility } from "@prisma/client";
import { getTex7PrismaClient } from "@/lib/tex7/database/providers/prisma-client";
import { ensureProductionOrganization } from "@/lib/cms/production-prisma";

export type BulkImportModule =
  | "artists"
  | "artworks"
  | "collections"
  | "exhibitions"
  | "projects"
  | "services"
  | "news"
  | "publications";

export interface BulkField {
  readonly key: string;
  readonly label: string;
  readonly required?: boolean;
  readonly example?: string;
}

export interface BulkModuleConfig {
  readonly module: BulkImportModule;
  readonly label: string;
  readonly permission: string;
  readonly fields: readonly BulkField[];
  readonly mediaFields: readonly string[];
  readonly relationshipFields: readonly string[];
}

export interface BulkSummary {
  readonly module: BulkImportModule;
  readonly total: number;
  readonly imported: number;
  readonly updated: number;
  readonly skipped: number;
  readonly errors: readonly string[];
}

export interface LegacyMigrationSummary {
  readonly total: number;
  readonly imported: number;
  readonly updated: number;
  readonly skipped: number;
  readonly errors: readonly string[];
  readonly modules: Record<string, BulkSummary>;
}

type BulkRow = Record<string, string>;

const bulkModules: Record<BulkImportModule, BulkModuleConfig> = {
  artists: {
    module: "artists",
    label: "Artists",
    permission: "artists.update",
    fields: [
      { key: "id", label: "ID", required: true, example: "art-001" },
      { key: "slug", label: "Slug", required: true, example: "artist-slug" },
      { key: "name_en", label: "Name English", required: true },
      { key: "name_ar", label: "Name Arabic", required: true },
      { key: "bio_en", label: "Bio English", required: true },
      { key: "bio_ar", label: "Bio Arabic", required: true },
      { key: "birth_year", label: "Birth Year", required: true, example: "1985" },
      { key: "nationality_en", label: "Nationality English", required: true },
      { key: "nationality_ar", label: "Nationality Arabic", required: true },
      { key: "website", label: "Website" },
      { key: "email", label: "Email" },
      { key: "instagram", label: "Instagram" },
      { key: "profile_image_id", label: "Profile Media ID" },
      { key: "featured", label: "Featured", example: "true" },
      { key: "display_order", label: "Display Order", example: "1" },
      { key: "representation_status", label: "Representation Status", required: true, example: "exclusive" },
      { key: "visibility_status", label: "Visibility", required: true, example: "public" },
    ],
    mediaFields: ["profile_image_id"],
    relationshipFields: [],
  },
  artworks: {
    module: "artworks",
    label: "Artworks",
    permission: "artworks.update",
    fields: [
      { key: "id", label: "ID", required: true, example: "aw-001" },
      { key: "slug", label: "Slug", required: true },
      { key: "title_en", label: "Title English", required: true },
      { key: "title_ar", label: "Title Arabic", required: true },
      { key: "artist_id", label: "Artist ID", required: true },
      { key: "collection_id", label: "Collection ID" },
      { key: "year", label: "Year", required: true, example: "2024" },
      { key: "medium_en", label: "Medium English", required: true },
      { key: "medium_ar", label: "Medium Arabic" },
      { key: "dimensions", label: "Dimensions", required: true },
      { key: "description_en", label: "Description English", required: true },
      { key: "description_ar", label: "Description Arabic", required: true },
      { key: "price_status", label: "Price Visibility", required: true, example: "price_upon_request" },
      { key: "availability_status", label: "Availability", required: true, example: "available" },
      { key: "visibility_status", label: "Visibility", required: true, example: "public" },
      { key: "primary_image_id", label: "Primary Media ID", required: true },
      { key: "featured", label: "Featured", example: "false" },
      { key: "display_order", label: "Display Order", example: "1" },
    ],
    mediaFields: ["primary_image_id"],
    relationshipFields: ["artist_id", "collection_id"],
  },
  collections: {
    module: "collections",
    label: "Collections",
    permission: "collections.update",
    fields: [
      { key: "id", label: "ID", required: true, example: "col-001" },
      { key: "slug", label: "Slug", required: true },
      { key: "title_en", label: "Title English", required: true },
      { key: "title_ar", label: "Title Arabic", required: true },
      { key: "description_en", label: "Description English", required: true },
      { key: "description_ar", label: "Description Arabic", required: true },
      { key: "cover_media_id", label: "Cover Media ID" },
      { key: "featured", label: "Featured", example: "false" },
      { key: "display_order", label: "Display Order", example: "0" },
      { key: "visibility_status", label: "Visibility", required: true, example: "public" },
    ],
    mediaFields: ["cover_media_id"],
    relationshipFields: [],
  },
  exhibitions: {
    module: "exhibitions",
    label: "Exhibitions",
    permission: "exhibitions.update",
    fields: [
      { key: "id", label: "ID", required: true, example: "ex-001" },
      { key: "slug", label: "Slug", required: true },
      { key: "title_en", label: "Title English", required: true },
      { key: "title_ar", label: "Title Arabic", required: true },
      { key: "description_en", label: "Description English", required: true },
      { key: "description_ar", label: "Description Arabic", required: true },
      { key: "start_date", label: "Start Date", required: true, example: "2024-09-15" },
      { key: "end_date", label: "End Date", required: true, example: "2024-11-30" },
      { key: "venue_en", label: "Venue English", required: true },
      { key: "venue_ar", label: "Venue Arabic", required: true },
      { key: "cover_media_id", label: "Cover Media ID" },
      { key: "status", label: "Status", example: "planned" },
      { key: "featured", label: "Featured", example: "false" },
      { key: "display_order", label: "Display Order", example: "0" },
      { key: "visibility_status", label: "Visibility", required: true, example: "public" },
      { key: "artist_ids", label: "Artist IDs", example: "art-001|art-002" },
      { key: "artwork_ids", label: "Artwork IDs", example: "aw-001|aw-002" },
    ],
    mediaFields: ["cover_media_id"],
    relationshipFields: ["artist_ids", "artwork_ids"],
  },
  projects: {
    module: "projects",
    label: "Projects",
    permission: "projects.update",
    fields: [
      { key: "id", label: "ID", required: true, example: "proj-001" },
      { key: "slug", label: "Slug", required: true },
      { key: "title_en", label: "Title English", required: true },
      { key: "title_ar", label: "Title Arabic", required: true },
      { key: "description_en", label: "Description English", required: true },
      { key: "description_ar", label: "Description Arabic", required: true },
      { key: "client_en", label: "Client English" },
      { key: "client_ar", label: "Client Arabic" },
      { key: "type", label: "Type", required: true, example: "commission" },
      { key: "year", label: "Year", required: true, example: "2024" },
      { key: "status", label: "Status", required: true, example: "in_progress" },
      { key: "cover_media_id", label: "Cover Media ID" },
      { key: "featured", label: "Featured", example: "false" },
      { key: "display_order", label: "Display Order", example: "0" },
      { key: "visibility_status", label: "Visibility", required: true, example: "public" },
      { key: "artist_ids", label: "Artist IDs", example: "art-001|art-002" },
      { key: "artwork_ids", label: "Artwork IDs", example: "aw-001|aw-002" },
      { key: "media_ids", label: "Media IDs", example: "media-001|media-002" },
    ],
    mediaFields: ["cover_media_id", "media_ids"],
    relationshipFields: ["artist_ids", "artwork_ids", "media_ids"],
  },
  services: {
    module: "services",
    label: "Services",
    permission: "services.update",
    fields: [
      { key: "id", label: "ID", required: true, example: "svc-001" },
      { key: "slug", label: "Slug", required: true },
      { key: "title_en", label: "Title English", required: true },
      { key: "title_ar", label: "Title Arabic", required: true },
      { key: "description_en", label: "Description English", required: true },
      { key: "description_ar", label: "Description Arabic", required: true },
      { key: "features_en", label: "Features English", example: "Feature 1|Feature 2" },
      { key: "features_ar", label: "Features Arabic", example: "ميزة 1|ميزة 2" },
      { key: "price_info", label: "Price Info JSON", example: "{\"type\":\"upon_request\"}" },
      { key: "cover_media_id", label: "Cover Media ID" },
      { key: "display_order", label: "Display Order", example: "0" },
      { key: "visibility_status", label: "Visibility", required: true, example: "public" },
    ],
    mediaFields: ["cover_media_id"],
    relationshipFields: [],
  },
  news: {
    module: "news",
    label: "News",
    permission: "news.update",
    fields: [
      { key: "id", label: "ID", required: true, example: "news-001" },
      { key: "slug", label: "Slug", required: true },
      { key: "title_en", label: "Title English", required: true },
      { key: "title_ar", label: "Title Arabic", required: true },
      { key: "content_en", label: "Content English", required: true },
      { key: "content_ar", label: "Content Arabic", required: true },
      { key: "excerpt_en", label: "Excerpt English", required: true },
      { key: "excerpt_ar", label: "Excerpt Arabic", required: true },
      { key: "category", label: "Category", required: true, example: "announcement" },
      { key: "publish_date", label: "Publish Date", required: true, example: "2024-08-20" },
      { key: "image_id", label: "Image Media ID" },
      { key: "display_order", label: "Display Order", example: "0" },
      { key: "visibility_status", label: "Visibility", required: true, example: "public" },
    ],
    mediaFields: ["image_id"],
    relationshipFields: [],
  },
  publications: {
    module: "publications",
    label: "Publications",
    permission: "publications.update",
    fields: [
      { key: "id", label: "ID", required: true, example: "pub-001" },
      { key: "slug", label: "Slug", required: true },
      { key: "title_en", label: "Title English", required: true },
      { key: "title_ar", label: "Title Arabic", required: true },
      { key: "description_en", label: "Description English", required: true },
      { key: "description_ar", label: "Description Arabic", required: true },
      { key: "type", label: "Type", required: true, example: "catalogue" },
      { key: "file_url", label: "File URL", required: true },
      { key: "cover_image_id", label: "Cover Media ID" },
      { key: "publish_date", label: "Publish Date", required: true, example: "2024-09-15" },
      { key: "display_order", label: "Display Order", example: "0" },
      { key: "visibility_status", label: "Visibility", required: true, example: "public" },
    ],
    mediaFields: ["cover_image_id"],
    relationshipFields: [],
  },
};

export function isBulkImportModule(value: string): value is BulkImportModule {
  return Object.prototype.hasOwnProperty.call(bulkModules, value);
}

export function getBulkModuleConfig(module: BulkImportModule): BulkModuleConfig {
  return bulkModules[module];
}

export function listBulkModuleConfigs(): readonly BulkModuleConfig[] {
  return Object.values(bulkModules);
}

function prisma() {
  return getTex7PrismaClient();
}

function cell(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function csvCell(value: string | number | boolean | null | undefined): string {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function text(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  if (Array.isArray(value)) return value.map(String).join("|");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function optionalText(value: unknown): string | null {
  const next = text(value).trim();
  return next ? next : null;
}

function numberValue(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function booleanValue(value: unknown): boolean {
  return ["true", "1", "yes", "featured"].includes(text(value).trim().toLowerCase());
}

function dateValue(value: unknown, fallback = "2024-01-01"): Date {
  const raw = text(value, fallback).trim() || fallback;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? new Date(fallback) : date;
}

function listValue(value: unknown): readonly string[] {
  return text(value)
    .split(/[|,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function jsonValue(value: unknown, fallback: Prisma.InputJsonValue): Prisma.InputJsonValue {
  const raw = text(value).trim();
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as Prisma.InputJsonValue;
  } catch {
    return fallback;
  }
}

function dateOnly(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function nowFromRow(row: BulkRow): Date {
  return dateValue(row.updated_at || row.created_at || new Date().toISOString());
}

function validateRequired(config: BulkModuleConfig, row: BulkRow, index: number): string[] {
  return config.fields
    .filter((field) => field.required && !text(row[field.key]).trim())
    .map((field) => `${config.label} row ${index}: ${field.key} is required.`);
}

async function mediaExists(organizationId: string, mediaId: string | null | undefined): Promise<boolean> {
  if (!mediaId) return true;
  const count = await prisma().media.count({ where: { organizationId, id: mediaId, archivedAt: null } });
  return count > 0;
}

async function requireMediaReferences(config: BulkModuleConfig, organizationId: string, row: BulkRow, index: number): Promise<string[]> {
  const errors: string[] = [];

  for (const field of config.mediaFields) {
    for (const mediaId of listValue(row[field])) {
      if (!(await mediaExists(organizationId, mediaId))) {
        errors.push(`${config.label} row ${index}: media reference ${field}=${mediaId} was not found.`);
      }
    }
  }

  return errors;
}

async function requireEntityReferences(config: BulkModuleConfig, organizationId: string, row: BulkRow, index: number): Promise<string[]> {
  const errors: string[] = [];

  if (row.artist_id) {
    const count = await prisma().artist.count({ where: { organizationId, id: row.artist_id, archivedAt: null } });
    if (count === 0) errors.push(`${config.label} row ${index}: artist_id=${row.artist_id} was not found.`);
  }

  if (row.collection_id) {
    const count = await prisma().collection.count({ where: { organizationId, id: row.collection_id, archivedAt: null } });
    if (count === 0) errors.push(`${config.label} row ${index}: collection_id=${row.collection_id} was not found.`);
  }

  for (const artistId of listValue(row.artist_ids)) {
    const count = await prisma().artist.count({ where: { organizationId, id: artistId, archivedAt: null } });
    if (count === 0) errors.push(`${config.label} row ${index}: artist_ids contains missing artist ${artistId}.`);
  }

  for (const artworkId of listValue(row.artwork_ids)) {
    const count = await prisma().artwork.count({ where: { organizationId, id: artworkId, archivedAt: null } });
    if (count === 0) errors.push(`${config.label} row ${index}: artwork_ids contains missing artwork ${artworkId}.`);
  }

  return errors;
}

export function createExcelTemplate(module: BulkImportModule): string {
  const config = getBulkModuleConfig(module);
  const header = config.fields.map((field) => `<Cell><Data ss:Type="String">${cell(field.key)}</Data></Cell>`).join("");
  const labels = config.fields.map((field) => `<Cell><Data ss:Type="String">${cell(field.label)}${field.required ? " *" : ""}</Data></Cell>`).join("");
  const example = config.fields.map((field) => `<Cell><Data ss:Type="String">${cell(field.example ?? "")}</Data></Cell>`).join("");

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="${cell(config.label)} Import">
  <Table>
   <Row>${header}</Row>
   <Row>${labels}</Row>
   <Row>${example}</Row>
  </Table>
 </Worksheet>
</Workbook>`;
}

function parseDelimited(content: string): readonly BulkRow[] {
  const delimiter = content.includes("\t") ? "\t" : ",";
  const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const parseLine = (line: string): string[] => {
    const values: string[] = [];
    let current = "";
    let quoted = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const next = line[index + 1];

      if (char === '"' && quoted && next === '"') {
        current += '"';
        index += 1;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === delimiter && !quoted) {
        values.push(current);
        current = "";
      } else {
        current += char;
      }
    }

    values.push(current);
    return values;
  };

  const headers = parseLine(lines[0]).map((value) => value.trim());
  return lines.slice(1).map((line) => {
    const values = parseLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? ""]));
  });
}

function collectRegexMatches(content: string, pattern: RegExp): string[] {
  const matches: string[] = [];
  let match = pattern.exec(content);

  while (match) {
    matches.push(match[1]);
    match = pattern.exec(content);
  }

  return matches;
}

function parseExcelXml(content: string): readonly BulkRow[] {
  const rows = collectRegexMatches(content, /<Row[^>]*>([\s\S]*?)<\/Row>/gi);
  const table = rows.map((row) =>
    collectRegexMatches(row, /<Data[^>]*>([\s\S]*?)<\/Data>/gi).map((value) =>
      value
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .trim(),
    ),
  );

  if (table.length < 2) return [];
  const headers = table[0];
  const dataRows = table.slice(1).filter((row) => row.some((value) => value.trim()));

  return dataRows
    .filter((row) => !row.every((value, index) => value === `${headers[index]} *` || value === headers[index]))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

export async function parseBulkWorkbook(file: File): Promise<readonly BulkRow[]> {
  const bytes = await file.arrayBuffer();
  const content = new TextDecoder().decode(bytes);

  if (content.startsWith("PK")) {
    return [];
  }

  return content.includes("<Workbook") || content.includes("<ss:Workbook") ? parseExcelXml(content) : parseDelimited(content);
}

async function upsertMedia(organizationId: string, row: BulkRow): Promise<"imported" | "updated"> {
  const existing = await prisma().media.findUnique({ where: { organizationId_id: { organizationId, id: row.id } }, select: { id: true } });
  await prisma().media.upsert({
    where: { organizationId_id: { organizationId, id: row.id } },
    create: {
      id: row.id,
      organizationId,
      filename: text(row.filename || row.url || row.storage_path || row.id),
      originalFilename: text(row.original_filename || row.filename || row.url || row.id),
      mimeType: text(row.mime_type, "application/octet-stream"),
      mediaType: text(row.type).toUpperCase() === "IMAGE" || text(row.type).toLowerCase() === "image" ? MediaType.IMAGE : MediaType.OTHER,
      storagePath: text(row.storage_path || row.url || row.id),
      altText: optionalText(row.alt_en || row.alt_ar),
      width: row.width ? numberValue(row.width) : null,
      height: row.height ? numberValue(row.height) : null,
      fileSize: numberValue(row.file_size, 0),
      visibility: text(row.visibility, "PUBLIC").toUpperCase() === "PRIVATE" ? MediaVisibility.PRIVATE : MediaVisibility.PUBLIC,
      checksum: optionalText(row.checksum),
      createdAt: dateValue(row.created_at, new Date().toISOString()),
      updatedAt: dateValue(row.updated_at || row.created_at, new Date().toISOString()),
    },
    update: {
      filename: text(row.filename || row.url || row.storage_path || row.id),
      originalFilename: text(row.original_filename || row.filename || row.url || row.id),
      mimeType: text(row.mime_type, "application/octet-stream"),
      mediaType: text(row.type).toUpperCase() === "IMAGE" || text(row.type).toLowerCase() === "image" ? MediaType.IMAGE : MediaType.OTHER,
      storagePath: text(row.storage_path || row.url || row.id),
      altText: optionalText(row.alt_en || row.alt_ar),
      width: row.width ? numberValue(row.width) : null,
      height: row.height ? numberValue(row.height) : null,
      fileSize: numberValue(row.file_size, 0),
      checksum: optionalText(row.checksum),
      updatedAt: dateValue(row.updated_at || row.created_at, new Date().toISOString()),
    },
  });
  return existing ? "updated" : "imported";
}

async function upsertModuleRow(module: BulkImportModule, organizationId: string, row: BulkRow): Promise<"imported" | "updated"> {
  const existingSelect = { where: { organizationId_id: { organizationId, id: row.id } }, select: { id: true } };

  if (module === "artists") {
    const existing = await prisma().artist.findUnique(existingSelect);
    await prisma().artist.upsert({
      where: { organizationId_id: { organizationId, id: row.id } },
      create: {
        id: row.id,
        organizationId,
        slug: row.slug,
        nameEn: row.name_en,
        nameAr: row.name_ar,
        bioEn: row.bio_en,
        bioAr: row.bio_ar,
        birthYear: numberValue(row.birth_year),
        nationalityEn: row.nationality_en,
        nationalityAr: row.nationality_ar,
        website: optionalText(row.website),
        email: optionalText(row.email),
        instagram: optionalText(row.instagram),
        profileImageId: optionalText(row.profile_image_id),
        featured: booleanValue(row.featured),
        displayOrder: numberValue(row.display_order),
        representationStatus: text(row.representation_status, "represented"),
        visibilityStatus: text(row.visibility_status, "private"),
        createdAt: dateValue(row.created_at, new Date().toISOString()),
        updatedAt: nowFromRow(row),
      },
      update: {
        slug: row.slug,
        nameEn: row.name_en,
        nameAr: row.name_ar,
        bioEn: row.bio_en,
        bioAr: row.bio_ar,
        birthYear: numberValue(row.birth_year),
        nationalityEn: row.nationality_en,
        nationalityAr: row.nationality_ar,
        website: optionalText(row.website),
        email: optionalText(row.email),
        instagram: optionalText(row.instagram),
        profileImageId: optionalText(row.profile_image_id),
        featured: booleanValue(row.featured),
        displayOrder: numberValue(row.display_order),
        representationStatus: text(row.representation_status, "represented"),
        visibilityStatus: text(row.visibility_status, "private"),
        updatedAt: nowFromRow(row),
      },
    });
    return existing ? "updated" : "imported";
  }

  if (module === "collections") {
    const existing = await prisma().collection.findUnique(existingSelect);
    await prisma().collection.upsert({
      where: { organizationId_id: { organizationId, id: row.id } },
      create: {
        id: row.id,
        organizationId,
        slug: row.slug,
        titleEn: row.title_en,
        titleAr: row.title_ar,
        descriptionEn: row.description_en,
        descriptionAr: row.description_ar,
        coverMediaId: optionalText(row.cover_media_id),
        featured: booleanValue(row.featured),
        displayOrder: numberValue(row.display_order),
        visibilityStatus: text(row.visibility_status, "private"),
        createdAt: dateValue(row.created_at, new Date().toISOString()),
        updatedAt: nowFromRow(row),
      },
      update: {
        slug: row.slug,
        titleEn: row.title_en,
        titleAr: row.title_ar,
        descriptionEn: row.description_en,
        descriptionAr: row.description_ar,
        coverMediaId: optionalText(row.cover_media_id),
        featured: booleanValue(row.featured),
        displayOrder: numberValue(row.display_order),
        visibilityStatus: text(row.visibility_status, "private"),
        updatedAt: nowFromRow(row),
      },
    });
    return existing ? "updated" : "imported";
  }

  if (module === "artworks") {
    const existing = await prisma().artwork.findUnique(existingSelect);
    await prisma().artwork.upsert({
      where: { organizationId_id: { organizationId, id: row.id } },
      create: {
        id: row.id,
        organizationId,
        slug: row.slug,
        titleEn: row.title_en,
        titleAr: row.title_ar,
        artistId: row.artist_id,
        collectionId: optionalText(row.collection_id),
        yearCreated: numberValue(row.year),
        medium: text(row.medium_en || row.medium_ar),
        dimensions: row.dimensions,
        descriptionEn: row.description_en,
        descriptionAr: row.description_ar,
        priceVisibility: text(row.price_status, "price_upon_request"),
        availabilityStatus: text(row.availability_status, "available"),
        visibilityStatus: text(row.visibility_status, "private"),
        primaryMediaId: row.primary_image_id,
        featured: booleanValue(row.featured),
        displayOrder: numberValue(row.display_order),
        createdAt: dateValue(row.created_at, new Date().toISOString()),
        updatedAt: nowFromRow(row),
      },
      update: {
        slug: row.slug,
        titleEn: row.title_en,
        titleAr: row.title_ar,
        artistId: row.artist_id,
        collectionId: optionalText(row.collection_id),
        yearCreated: numberValue(row.year),
        medium: text(row.medium_en || row.medium_ar),
        dimensions: row.dimensions,
        descriptionEn: row.description_en,
        descriptionAr: row.description_ar,
        priceVisibility: text(row.price_status, "price_upon_request"),
        availabilityStatus: text(row.availability_status, "available"),
        visibilityStatus: text(row.visibility_status, "private"),
        primaryMediaId: row.primary_image_id,
        featured: booleanValue(row.featured),
        displayOrder: numberValue(row.display_order),
        updatedAt: nowFromRow(row),
      },
    });
    return existing ? "updated" : "imported";
  }

  if (module === "exhibitions") {
    const existing = await prisma().exhibition.findUnique(existingSelect);
    await prisma().exhibition.upsert({
      where: { organizationId_id: { organizationId, id: row.id } },
      create: {
        id: row.id,
        organizationId,
        slug: row.slug,
        titleEn: row.title_en,
        titleAr: row.title_ar,
        descriptionEn: row.description_en,
        descriptionAr: row.description_ar,
        startDate: dateValue(row.start_date),
        endDate: dateValue(row.end_date),
        venueEn: row.venue_en,
        venueAr: row.venue_ar,
        coverMediaId: optionalText(row.cover_media_id),
        status: text(row.status, "planned"),
        featured: booleanValue(row.featured),
        displayOrder: numberValue(row.display_order),
        visibilityStatus: text(row.visibility_status, "private"),
        createdAt: dateValue(row.created_at, new Date().toISOString()),
        updatedAt: nowFromRow(row),
      },
      update: {
        slug: row.slug,
        titleEn: row.title_en,
        titleAr: row.title_ar,
        descriptionEn: row.description_en,
        descriptionAr: row.description_ar,
        startDate: dateValue(row.start_date),
        endDate: dateValue(row.end_date),
        venueEn: row.venue_en,
        venueAr: row.venue_ar,
        coverMediaId: optionalText(row.cover_media_id),
        status: text(row.status, "planned"),
        featured: booleanValue(row.featured),
        displayOrder: numberValue(row.display_order),
        visibilityStatus: text(row.visibility_status, "private"),
        updatedAt: nowFromRow(row),
      },
    });
    await syncExhibitionRelations(organizationId, row.id, row);
    return existing ? "updated" : "imported";
  }

  if (module === "projects") {
    const existing = await prisma().project.findUnique(existingSelect);
    await prisma().project.upsert({
      where: { organizationId_id: { organizationId, id: row.id } },
      create: {
        id: row.id,
        organizationId,
        slug: row.slug,
        titleEn: row.title_en,
        titleAr: row.title_ar,
        descriptionEn: row.description_en,
        descriptionAr: row.description_ar,
        clientEn: optionalText(row.client_en),
        clientAr: optionalText(row.client_ar),
        type: text(row.type, "project"),
        year: numberValue(row.year, new Date().getFullYear()),
        status: text(row.status, "planned"),
        coverMediaId: optionalText(row.cover_media_id),
        featured: booleanValue(row.featured),
        displayOrder: numberValue(row.display_order),
        visibilityStatus: text(row.visibility_status, "private"),
        createdAt: dateValue(row.created_at, new Date().toISOString()),
        updatedAt: nowFromRow(row),
      },
      update: {
        slug: row.slug,
        titleEn: row.title_en,
        titleAr: row.title_ar,
        descriptionEn: row.description_en,
        descriptionAr: row.description_ar,
        clientEn: optionalText(row.client_en),
        clientAr: optionalText(row.client_ar),
        type: text(row.type, "project"),
        year: numberValue(row.year, new Date().getFullYear()),
        status: text(row.status, "planned"),
        coverMediaId: optionalText(row.cover_media_id),
        featured: booleanValue(row.featured),
        displayOrder: numberValue(row.display_order),
        visibilityStatus: text(row.visibility_status, "private"),
        updatedAt: nowFromRow(row),
      },
    });
    await syncProjectRelations(organizationId, row.id, row);
    return existing ? "updated" : "imported";
  }

  if (module === "services") {
    const existing = await prisma().service.findUnique(existingSelect);
    await prisma().service.upsert({
      where: { organizationId_id: { organizationId, id: row.id } },
      create: {
        id: row.id,
        organizationId,
        slug: row.slug,
        titleEn: row.title_en,
        titleAr: row.title_ar,
        descriptionEn: row.description_en,
        descriptionAr: row.description_ar,
        featuresEn: [...listValue(row.features_en)] as Prisma.InputJsonValue,
        featuresAr: [...listValue(row.features_ar)] as Prisma.InputJsonValue,
        priceInfo: jsonValue(row.price_info, { type: "upon_request" }),
        coverMediaId: optionalText(row.cover_media_id),
        displayOrder: numberValue(row.display_order),
        visibilityStatus: text(row.visibility_status, "private"),
        createdAt: dateValue(row.created_at, new Date().toISOString()),
        updatedAt: nowFromRow(row),
      },
      update: {
        slug: row.slug,
        titleEn: row.title_en,
        titleAr: row.title_ar,
        descriptionEn: row.description_en,
        descriptionAr: row.description_ar,
        featuresEn: [...listValue(row.features_en)] as Prisma.InputJsonValue,
        featuresAr: [...listValue(row.features_ar)] as Prisma.InputJsonValue,
        priceInfo: jsonValue(row.price_info, { type: "upon_request" }),
        coverMediaId: optionalText(row.cover_media_id),
        displayOrder: numberValue(row.display_order),
        visibilityStatus: text(row.visibility_status, "private"),
        updatedAt: nowFromRow(row),
      },
    });
    return existing ? "updated" : "imported";
  }

  if (module === "news") {
    const existing = await prisma().news.findUnique(existingSelect);
    await prisma().news.upsert({
      where: { organizationId_id: { organizationId, id: row.id } },
      create: {
        id: row.id,
        organizationId,
        slug: row.slug,
        titleEn: row.title_en,
        titleAr: row.title_ar,
        contentEn: row.content_en,
        contentAr: row.content_ar,
        excerptEn: row.excerpt_en,
        excerptAr: row.excerpt_ar,
        category: row.category,
        publishDate: dateValue(row.publish_date),
        imageId: optionalText(row.image_id),
        displayOrder: numberValue(row.display_order),
        visibilityStatus: text(row.visibility_status, "private"),
        createdAt: dateValue(row.created_at, new Date().toISOString()),
        updatedAt: nowFromRow(row),
      },
      update: {
        slug: row.slug,
        titleEn: row.title_en,
        titleAr: row.title_ar,
        contentEn: row.content_en,
        contentAr: row.content_ar,
        excerptEn: row.excerpt_en,
        excerptAr: row.excerpt_ar,
        category: row.category,
        publishDate: dateValue(row.publish_date),
        imageId: optionalText(row.image_id),
        displayOrder: numberValue(row.display_order),
        visibilityStatus: text(row.visibility_status, "private"),
        updatedAt: nowFromRow(row),
      },
    });
    return existing ? "updated" : "imported";
  }

  const existing = await prisma().publication.findUnique(existingSelect);
  await prisma().publication.upsert({
    where: { organizationId_id: { organizationId, id: row.id } },
    create: {
      id: row.id,
      organizationId,
      slug: row.slug,
      titleEn: row.title_en,
      titleAr: row.title_ar,
      descriptionEn: row.description_en,
      descriptionAr: row.description_ar,
      type: row.type,
      fileUrl: row.file_url,
      coverImageId: optionalText(row.cover_image_id),
      publishDate: dateValue(row.publish_date),
      displayOrder: numberValue(row.display_order),
      visibilityStatus: text(row.visibility_status, "private"),
      createdAt: dateValue(row.created_at, new Date().toISOString()),
      updatedAt: nowFromRow(row),
    },
    update: {
      slug: row.slug,
      titleEn: row.title_en,
      titleAr: row.title_ar,
      descriptionEn: row.description_en,
      descriptionAr: row.description_ar,
      type: row.type,
      fileUrl: row.file_url,
      coverImageId: optionalText(row.cover_image_id),
      publishDate: dateValue(row.publish_date),
      displayOrder: numberValue(row.display_order),
      visibilityStatus: text(row.visibility_status, "private"),
      updatedAt: nowFromRow(row),
    },
  });
  return existing ? "updated" : "imported";
}

async function syncExhibitionRelations(organizationId: string, exhibitionId: string, row: BulkRow): Promise<void> {
  let displayOrder = 0;
  for (const artistId of listValue(row.artist_ids)) {
    await prisma().exhibitionArtist.upsert({
      where: { organizationId_exhibitionId_artistId: { organizationId, exhibitionId, artistId } },
      create: { organizationId, exhibitionId, artistId, role: "artist", displayOrder: displayOrder++ },
      update: { role: "artist", displayOrder: displayOrder++ },
    });
  }

  displayOrder = 0;
  for (const artworkId of listValue(row.artwork_ids)) {
    await prisma().exhibitionArtwork.upsert({
      where: { organizationId_exhibitionId_artworkId: { organizationId, exhibitionId, artworkId } },
      create: { organizationId, exhibitionId, artworkId, displayOrder: displayOrder++ },
      update: { displayOrder: displayOrder++ },
    });
  }
}

async function syncProjectRelations(organizationId: string, projectId: string, row: BulkRow): Promise<void> {
  let displayOrder = 0;
  for (const artistId of listValue(row.artist_ids)) {
    await prisma().projectArtist.upsert({
      where: { organizationId_projectId_artistId: { organizationId, projectId, artistId } },
      create: { organizationId, projectId, artistId, role: "artist", displayOrder: displayOrder++ },
      update: { role: "artist", displayOrder: displayOrder++ },
    });
  }

  displayOrder = 0;
  for (const artworkId of listValue(row.artwork_ids)) {
    await prisma().projectArtwork.upsert({
      where: { organizationId_projectId_artworkId: { organizationId, projectId, artworkId } },
      create: { organizationId, projectId, artworkId, displayOrder: displayOrder++ },
      update: { displayOrder: displayOrder++ },
    });
  }

  displayOrder = 0;
  for (const mediaId of listValue(row.media_ids)) {
    await prisma().projectMedia.upsert({
      where: { organizationId_projectId_mediaId_role: { organizationId, projectId, mediaId, role: "supporting" } },
      create: { organizationId, projectId, mediaId, role: "supporting", displayOrder: displayOrder++ },
      update: { displayOrder: displayOrder++ },
    });
  }
}

export async function importBulkRows(module: BulkImportModule, organizationId: string, rows: readonly BulkRow[]): Promise<BulkSummary> {
  await ensureProductionOrganization(organizationId);
  const config = getBulkModuleConfig(module);
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const errors: string[] = [];
  let imported = 0;
  let updated = 0;
  let skipped = 0;

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    const index = rowIndex + 2;
    const rowErrors = validateRequired(config, row, index);

    if (row.id && seenIds.has(row.id)) rowErrors.push(`${config.label} row ${index}: duplicate id ${row.id} appears in the import file.`);
    if (row.slug && seenSlugs.has(row.slug)) rowErrors.push(`${config.label} row ${index}: duplicate slug ${row.slug} appears in the import file.`);
    if (row.id) seenIds.add(row.id);
    if (row.slug) seenSlugs.add(row.slug);

    rowErrors.push(...(await requireMediaReferences(config, organizationId, row, index)));
    rowErrors.push(...(await requireEntityReferences(config, organizationId, row, index)));

    if (rowErrors.length > 0) {
      skipped += 1;
      errors.push(...rowErrors);
      continue;
    }

    try {
      const result = await upsertModuleRow(module, organizationId, row);
      if (result === "imported") imported += 1;
      else updated += 1;
    } catch (error) {
      skipped += 1;
      errors.push(`${config.label} row ${index}: ${error instanceof Error ? error.message : "Import failed."}`);
    }
  }

  return { module, total: rows.length, imported, updated, skipped, errors };
}

export async function exportBulkRows(module: BulkImportModule, organizationId: string): Promise<string> {
  const config = getBulkModuleConfig(module);
  const fields = config.fields.map((field) => field.key);
  const records = await readModuleRows(module, organizationId);
  return [fields.map(csvCell).join(","), ...records.map((record) => fields.map((field) => csvCell(record[field])).join(","))].join("\n");
}

async function readModuleRows(module: BulkImportModule, organizationId: string): Promise<readonly BulkRow[]> {
  if (module === "artists") {
    return (await prisma().artist.findMany({ where: { organizationId, archivedAt: null }, orderBy: [{ displayOrder: "asc" }] })).map((record) => ({
      id: record.id,
      slug: record.slug,
      name_en: record.nameEn,
      name_ar: record.nameAr,
      bio_en: record.bioEn,
      bio_ar: record.bioAr,
      birth_year: String(record.birthYear),
      nationality_en: record.nationalityEn,
      nationality_ar: record.nationalityAr,
      website: record.website ?? "",
      email: record.email ?? "",
      instagram: record.instagram ?? "",
      profile_image_id: record.profileImageId ?? "",
      featured: String(record.featured),
      display_order: String(record.displayOrder),
      representation_status: record.representationStatus,
      visibility_status: record.visibilityStatus,
    }));
  }

  if (module === "artworks") {
    return (await prisma().artwork.findMany({ where: { organizationId, archivedAt: null }, orderBy: [{ displayOrder: "asc" }] })).map((record) => ({
      id: record.id,
      slug: record.slug,
      title_en: record.titleEn,
      title_ar: record.titleAr,
      artist_id: record.artistId,
      collection_id: record.collectionId ?? "",
      year: String(record.yearCreated),
      medium_en: record.medium,
      medium_ar: record.medium,
      dimensions: record.dimensions,
      description_en: record.descriptionEn,
      description_ar: record.descriptionAr,
      price_status: record.priceVisibility,
      availability_status: record.availabilityStatus,
      visibility_status: record.visibilityStatus,
      primary_image_id: record.primaryMediaId,
      featured: String(record.featured),
      display_order: String(record.displayOrder),
    }));
  }

  if (module === "collections") {
    return (await prisma().collection.findMany({ where: { organizationId, archivedAt: null }, orderBy: [{ displayOrder: "asc" }] })).map((record) => ({
      id: record.id,
      slug: record.slug,
      title_en: record.titleEn,
      title_ar: record.titleAr,
      description_en: record.descriptionEn,
      description_ar: record.descriptionAr,
      cover_media_id: record.coverMediaId ?? "",
      featured: String(record.featured),
      display_order: String(record.displayOrder),
      visibility_status: record.visibilityStatus,
    }));
  }

  if (module === "exhibitions") {
    return (await prisma().exhibition.findMany({
      where: { organizationId, archivedAt: null },
      include: { artists: true, artworks: true },
      orderBy: [{ displayOrder: "asc" }],
    })).map((record) => ({
      id: record.id,
      slug: record.slug,
      title_en: record.titleEn,
      title_ar: record.titleAr,
      description_en: record.descriptionEn,
      description_ar: record.descriptionAr,
      start_date: dateOnly(record.startDate),
      end_date: dateOnly(record.endDate),
      venue_en: record.venueEn,
      venue_ar: record.venueAr,
      cover_media_id: record.coverMediaId ?? "",
      status: record.status,
      featured: String(record.featured),
      display_order: String(record.displayOrder),
      visibility_status: record.visibilityStatus,
      artist_ids: record.artists.map((item) => item.artistId).join("|"),
      artwork_ids: record.artworks.map((item) => item.artworkId).join("|"),
    }));
  }

  if (module === "projects") {
    return (await prisma().project.findMany({
      where: { organizationId, archivedAt: null },
      include: { artists: true, artworks: true, media: true },
      orderBy: [{ displayOrder: "asc" }],
    })).map((record) => ({
      id: record.id,
      slug: record.slug,
      title_en: record.titleEn,
      title_ar: record.titleAr,
      description_en: record.descriptionEn,
      description_ar: record.descriptionAr,
      client_en: record.clientEn ?? "",
      client_ar: record.clientAr ?? "",
      type: record.type,
      year: String(record.year),
      status: record.status,
      cover_media_id: record.coverMediaId ?? "",
      featured: String(record.featured),
      display_order: String(record.displayOrder),
      visibility_status: record.visibilityStatus,
      artist_ids: record.artists.map((item) => item.artistId).join("|"),
      artwork_ids: record.artworks.map((item) => item.artworkId).join("|"),
      media_ids: record.media.map((item) => item.mediaId).join("|"),
    }));
  }

  if (module === "services") {
    return (await prisma().service.findMany({ where: { organizationId, archivedAt: null }, orderBy: [{ displayOrder: "asc" }] })).map((record) => ({
      id: record.id,
      slug: record.slug,
      title_en: record.titleEn,
      title_ar: record.titleAr,
      description_en: record.descriptionEn,
      description_ar: record.descriptionAr,
      features_en: Array.isArray(record.featuresEn) ? record.featuresEn.map(String).join("|") : "",
      features_ar: Array.isArray(record.featuresAr) ? record.featuresAr.map(String).join("|") : "",
      price_info: JSON.stringify(record.priceInfo ?? {}),
      cover_media_id: record.coverMediaId ?? "",
      display_order: String(record.displayOrder),
      visibility_status: record.visibilityStatus,
    }));
  }

  if (module === "news") {
    return (await prisma().news.findMany({ where: { organizationId, archivedAt: null }, orderBy: [{ displayOrder: "asc" }] })).map((record) => ({
      id: record.id,
      slug: record.slug,
      title_en: record.titleEn,
      title_ar: record.titleAr,
      content_en: record.contentEn,
      content_ar: record.contentAr,
      excerpt_en: record.excerptEn,
      excerpt_ar: record.excerptAr,
      category: record.category,
      publish_date: dateOnly(record.publishDate),
      image_id: record.imageId ?? "",
      display_order: String(record.displayOrder),
      visibility_status: record.visibilityStatus,
    }));
  }

  return (await prisma().publication.findMany({ where: { organizationId, archivedAt: null }, orderBy: [{ displayOrder: "asc" }] })).map((record) => ({
    id: record.id,
    slug: record.slug,
    title_en: record.titleEn,
    title_ar: record.titleAr,
    description_en: record.descriptionEn,
    description_ar: record.descriptionAr,
    type: record.type,
    file_url: record.fileUrl,
    cover_image_id: record.coverImageId ?? "",
    publish_date: dateOnly(record.publishDate),
    display_order: String(record.displayOrder),
    visibility_status: record.visibilityStatus,
  }));
}

export async function migrateLegacyJsonRows(organizationId: string, data: Record<string, readonly BulkRow[]>): Promise<LegacyMigrationSummary> {
  await ensureProductionOrganization(organizationId);
  const modules: Record<string, BulkSummary> = {};
  let imported = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of data.media ?? []) {
    try {
      const result = await upsertMedia(organizationId, row);
      if (result === "imported") imported += 1;
      else updated += 1;
    } catch (error) {
      skipped += 1;
      errors.push(`Media ${row.id || "unknown"}: ${error instanceof Error ? error.message : "Migration failed."}`);
    }
  }

  for (const module of listBulkModuleConfigs().map((item) => item.module)) {
    const summary = await importBulkRows(module, organizationId, data[module] ?? []);
    modules[module] = summary;
    imported += summary.imported;
    updated += summary.updated;
    skipped += summary.skipped;
    errors.push(...summary.errors);
  }

  return {
    total: imported + updated + skipped,
    imported,
    updated,
    skipped,
    errors,
    modules,
  };
}