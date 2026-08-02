import { type NextRequest, NextResponse } from "next/server";
import { artistsRepository } from "@/lib/repositories/artists";
import { artworksRepository } from "@/lib/repositories/artworks";
import { collectionsRepository } from "@/lib/repositories/collections";
import { exhibitionsRepository } from "@/lib/repositories/exhibitions";
import { projectsRepository } from "@/lib/repositories/projects";
import { newsRepository } from "@/lib/repositories/news";
import { publicationsRepository } from "@/lib/repositories/publications";
import { servicesRepository } from "@/lib/repositories/services";

interface SearchResultItem {
  type: string;
  href: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  meta: string;
  metaAr: string;
  image: string | null;
}

const MAX_RESULTS = 20;
const MAX_QUERY_LENGTH = 200;

function searchableScore(text: string, query: string): number {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  if (lower === q) return 100;
  if (lower.startsWith(q)) return 80;
  if (lower.includes(` ${q}`) || lower.includes(`${q} `)) return 60;
  if (lower.includes(q)) return 40;
  return 0;
}

function matchesAny(queryLower: string, ...fields: (string | null | undefined)[]): number {
  let best = 0;
  for (const field of fields) {
    if (!field) continue;
    const score = searchableScore(field, queryLower);
    if (score > best) best = score;
  }
  return best;
}

function monthYear(value: string, ar: boolean): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(ar ? "ar" : "en", { month: "long", year: "numeric" }).format(date);
}

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const lang = searchParams.get("lang") === "ar" ? "ar" : "en";
  const ar = lang === "ar";

  if (!q || q.length < 2) {
    return NextResponse.json({ items: [], total: 0, query: q });
  }

  if (q.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ items: [], total: 0, query: q });
  }

  const queryLower = q.toLowerCase();
  const results: Array<{ item: SearchResultItem; score: number }> = [];

  try {
    const [
      artists,
      artworks,
      collections,
      exhibitions,
      projects,
      newsItems,
      publications,
      services,
    ] = await Promise.all([
      artistsRepository.getPublicAll().catch(() => [] as readonly any[]),
      artworksRepository.getPublicAll().catch(() => [] as readonly any[]),
      collectionsRepository.getPublicAll().catch(() => [] as readonly any[]),
      exhibitionsRepository.getPublicAll().catch(() => [] as readonly any[]),
      projectsRepository.getPublicAll().catch(() => [] as readonly any[]),
      newsRepository.getPublicAll().catch(() => [] as readonly any[]),
      publicationsRepository.getPublicAll().catch(() => [] as readonly any[]),
      servicesRepository.getPublicAll().catch(() => [] as readonly any[]),
    ]);

    for (const a of artists) {
      const score = matchesAny(queryLower, a.name_en, a.name_ar, a.bio_en, a.bio_ar);
      if (score > 0) {
        results.push({
          item: {
            type: "artist",
            href: `/artists/${a.slug}`,
            title: a.name_en,
            titleAr: a.name_ar,
            description: a.bio_en?.slice(0, 200) ?? "",
            descriptionAr: a.bio_ar?.slice(0, 200) ?? "",
            meta: `${a.nationality_en} · ${a.birth_year}`,
            metaAr: `${a.nationality_ar} · ${a.birth_year}`,
            image: null,
          },
          score,
        });
      }
    }

    for (const aw of artworks) {
      const score = matchesAny(queryLower, aw.title_en, aw.title_ar, aw.description_en, aw.description_ar, aw.medium_en, aw.medium_ar);
      if (score > 0) {
        results.push({
          item: {
            type: "artwork",
            href: `/artworks/${aw.slug}`,
            title: aw.title_en,
            titleAr: aw.title_ar,
            description: aw.description_en?.slice(0, 200) ?? "",
            descriptionAr: aw.description_ar?.slice(0, 200) ?? "",
            meta: `${aw.medium_en} · ${aw.year}`,
            metaAr: `${aw.medium_ar} · ${aw.year}`,
            image: null,
          },
          score,
        });
      }
    }

    for (const c of collections) {
      const score = matchesAny(queryLower, c.title_en, c.title_ar, c.description_en, c.description_ar);
      if (score > 0) {
        results.push({
          item: {
            type: "collection",
            href: `/collections/${c.slug}`,
            title: c.title_en,
            titleAr: c.title_ar,
            description: c.description_en?.slice(0, 200) ?? "",
            descriptionAr: c.description_ar?.slice(0, 200) ?? "",
            meta: "Collection",
            metaAr: "مجموعة",
            image: null,
          },
          score,
        });
      }
    }

    for (const ex of exhibitions) {
      const score = matchesAny(queryLower, ex.title_en, ex.title_ar, ex.description_en, ex.description_ar, ex.venue_en, ex.venue_ar);
      if (score > 0) {
        results.push({
          item: {
            type: "exhibition",
            href: `/exhibitions/${ex.slug}`,
            title: ex.title_en,
            titleAr: ex.title_ar,
            description: ex.description_en?.slice(0, 200) ?? "",
            descriptionAr: ex.description_ar?.slice(0, 200) ?? "",
            meta: `${ex.venue_en} · ${monthYear(ex.start_date, false)}`,
            metaAr: `${ex.venue_ar} · ${monthYear(ex.start_date, true)}`,
            image: null,
          },
          score,
        });
      }
    }

    for (const p of projects) {
      const score = matchesAny(queryLower, p.title_en, p.title_ar, p.description_en, p.description_ar, p.client_en, p.client_ar);
      if (score > 0) {
        results.push({
          item: {
            type: "project",
            href: `/projects/${p.slug}`,
            title: p.title_en,
            titleAr: p.title_ar,
            description: p.description_en?.slice(0, 200) ?? "",
            descriptionAr: p.description_ar?.slice(0, 200) ?? "",
            meta: `${formatLabel(p.type)} · ${p.year}`,
            metaAr: `${formatLabel(p.type)} · ${p.year}`,
            image: null,
          },
          score,
        });
      }
    }

    for (const n of newsItems) {
      const score = matchesAny(queryLower, n.title_en, n.title_ar, n.content_en, n.content_ar, n.excerpt_en, n.excerpt_ar);
      if (score > 0) {
        results.push({
          item: {
            type: "news",
            href: `/news/${n.slug}`,
            title: n.title_en,
            titleAr: n.title_ar,
            description: n.excerpt_en?.slice(0, 200) ?? "",
            descriptionAr: n.excerpt_ar?.slice(0, 200) ?? "",
            meta: `${formatLabel(n.category)} · ${monthYear(n.publish_date, false)}`,
            metaAr: `${formatLabel(n.category)} · ${monthYear(n.publish_date, true)}`,
            image: null,
          },
          score,
        });
      }
    }

    for (const pb of publications) {
      const score = matchesAny(queryLower, pb.title_en, pb.title_ar, pb.description_en, pb.description_ar);
      if (score > 0) {
        results.push({
          item: {
            type: "publication",
            href: `/publications#${pb.slug}`,
            title: pb.title_en,
            titleAr: pb.title_ar,
            description: pb.description_en?.slice(0, 200) ?? "",
            descriptionAr: pb.description_ar?.slice(0, 200) ?? "",
            meta: `${formatLabel(pb.type)} · ${pb.publish_date}`,
            metaAr: `${formatLabel(pb.type)} · ${pb.publish_date}`,
            image: null,
          },
          score,
        });
      }
    }

    for (const sv of services) {
      const score = matchesAny(queryLower, sv.title_en, sv.title_ar, sv.description_en, sv.description_ar);
      if (score > 0) {
        results.push({
          item: {
            type: "service",
            href: `/services#${sv.slug}`,
            title: sv.title_en,
            titleAr: sv.title_ar,
            description: sv.description_en?.slice(0, 200) ?? "",
            descriptionAr: sv.description_ar?.slice(0, 200) ?? "",
            meta: "Service",
            metaAr: "خدمة",
            image: null,
          },
          score,
        });
      }
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown search error";
    console.error("Search failed:", msg);
    return NextResponse.json({ items: [], total: 0, query: q, error: "Search unavailable" }, { status: 200 });
  }

  results.sort((a, b) => b.score - a.score);
  const top = results.slice(0, MAX_RESULTS);

  return NextResponse.json({
    items: top.map((r) => r.item),
    total: results.length,
    query: q,
  });
}
