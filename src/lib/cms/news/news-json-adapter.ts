import { randomUUID } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { jsonFileTargets, type JsonWriteTarget } from "@/lib/database/json-file-types";
import { jsonWriter } from "@/lib/database/json-writer";
import type { JsonWriteGuardOptions } from "@/lib/database/json-write-guards";
import type { JsonWriteResult } from "@/lib/database/json-write-result";
import type { News } from "@/types";
import type { NewsValidatedInput } from "./news-validation";

export interface NewsJsonSaveOptions extends JsonWriteGuardOptions {
  readonly now?: string;
}

export type NewsJsonRecord = News & Record<string, unknown>;

const newsJsonWriteTarget: JsonWriteTarget<NewsJsonRecord> = {
  file: {
    ...jsonFileTargets.news,
    writeMode: "development_write_disabled",
    description: "News records prepared for guarded development-only create and update proof.",
  },
  idField: "id",
  slugField: "slug",
};

const newsJsonPath = path.join(process.cwd(), "data", "news.json");

function readNewsFile(): NewsJsonRecord[] {
  if (!existsSync(newsJsonPath)) {
    return [];
  }

  const raw = readFileSync(newsJsonPath, "utf8");
  const parsed = JSON.parse(raw) as unknown;

  return Array.isArray(parsed) ? (parsed as NewsJsonRecord[]) : [];
}

function writeNewsFile(records: readonly NewsJsonRecord[]) {
  writeFileSync(newsJsonPath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

function validationFailure(
  operation: "create" | "update",
  message: string,
  details: readonly string[],
): JsonWriteResult<NewsJsonRecord> {
  return {
    ok: false,
    operation,
    target: jsonFileTargets.news.entity,
    reason: "invalid_payload",
    message,
    details,
  };
}

function createNewsRecord(input: NewsValidatedInput): NewsJsonRecord {
  return {
    id: `news-${randomUUID()}`,
    slug: input.slug,
    title_en: input.title_en,
    title_ar: input.title_ar,
    content_en: input.content_en,
    content_ar: input.content_ar,
    excerpt_en: input.excerpt_en,
    excerpt_ar: input.excerpt_ar,
    category: input.category,
    publish_date: input.publish_date,
    image_id: input.image_id,
    visibility_status: input.visibility_status,
  };
}

function updateNewsRecord(existing: NewsJsonRecord, input: NewsValidatedInput): NewsJsonRecord {
  return {
    ...existing,
    slug: input.slug,
    title_en: input.title_en,
    title_ar: input.title_ar,
    content_en: input.content_en,
    content_ar: input.content_ar,
    excerpt_en: input.excerpt_en,
    excerpt_ar: input.excerpt_ar,
    category: input.category,
    publish_date: input.publish_date,
    image_id: input.image_id,
    visibility_status: input.visibility_status,
  };
}

export function createNewsJsonRecord(
  input: NewsValidatedInput,
  options: NewsJsonSaveOptions = {},
): JsonWriteResult<NewsJsonRecord> {
  const record = createNewsRecord(input);
  const guardResult = jsonWriter.write<NewsJsonRecord>({
    operation: "create",
    target: newsJsonWriteTarget,
    record,
    options,
  });

  if (!guardResult.ok) {
    return guardResult;
  }

  const news = readNewsFile();

  if (news.some((newsItem) => newsItem.id === record.id || newsItem.slug === record.slug)) {
    return validationFailure("create", "News id or slug already exists.", [record.id, record.slug]);
  }

  writeNewsFile([...news, record]);

  return {
    ok: true,
    operation: "create",
    target: jsonFileTargets.news.entity,
    record,
    message: "Development-only news JSON create proof completed.",
  };
}

export function updateNewsJsonRecord(
  newsId: News["id"],
  input: NewsValidatedInput,
  options: NewsJsonSaveOptions = {},
): JsonWriteResult<NewsJsonRecord> {
  const news = readNewsFile();
  const newsIndex = news.findIndex((newsItem) => newsItem.id === newsId);

  if (newsIndex < 0) {
    return validationFailure("update", "News record was not found for update.", [newsId]);
  }

  if (news.some((newsItem) => newsItem.id !== newsId && newsItem.slug === input.slug)) {
    return validationFailure("update", "News slug already belongs to another record.", [input.slug]);
  }

  const record = updateNewsRecord(news[newsIndex], input);
  const guardResult = jsonWriter.write<NewsJsonRecord>({
    operation: "update",
    target: newsJsonWriteTarget,
    record,
    options,
  });

  if (!guardResult.ok) {
    return guardResult;
  }

  writeNewsFile(news.map((newsItem) => (newsItem.id === newsId ? record : newsItem)));

  return {
    ok: true,
    operation: "update",
    target: jsonFileTargets.news.entity,
    record,
    message: "Development-only news JSON update proof completed.",
  };
}