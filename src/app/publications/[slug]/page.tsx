import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { mediaRepository } from "@/lib/repositories/media";
import { publicationsRepository } from "@/lib/repositories/publications";
import { getServerLanguage } from "@/lib/i18n/server-language";
import type { Language } from "@/lib/i18n/language";
import { BreadcrumbListLd } from "@/lib/jsonld";

const T = {
  kicker: { ar: "إصدار", en: "Publication" },
  type: { ar: "النوع", en: "Type" },
  published: { ar: "نُشر", en: "Published" },
  note: { ar: "ملاحظة النشر", en: "Publication note" },
  file: { ar: "ملف النشر", en: "Publication file" },
  open: { ar: "فتح الإصدار", en: "Open publication" },
  all: { ar: "جميع الإصدارات", en: "All publications" },
  not_found: { ar: "الإصدار غير موجود", en: "Publication not found" },
};

function t(key: keyof typeof T, lang: Language): string { return lang === "ar" ? T[key].ar : T[key].en; }

interface Props { params: Promise<{ slug: string }> }
export const dynamic = "force-dynamic";

function formatDate(value: string, ar: boolean): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(ar ? "ar" : "en", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function formatLabel(value: string): string {
  return value.split("_").map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const publication = (await publicationsRepository.getPublicAll()).find((item) => item.slug === slug);
  if (!publication) return { title: t("not_found", "en") };
  return { title: `${publication.title_en} | Gallery 015`, description: publication.description_en?.slice(0, 155) };
}

export default async function PublicationDetailPage({ params }: Props) {
  const { slug } = await params;
  const lang = await getServerLanguage();
  const ar = lang === "ar";
  const publication = (await publicationsRepository.getPublicAll()).find((item) => item.slug === slug);
  if (!publication) notFound();

  const cover = publication.cover_image_id ? await mediaRepository.getById(publication.cover_image_id) : null;

  return (
    <>
      <BreadcrumbListLd items={[{ name: "Gallery 015", url: "https://gallery015.com" }, { name: "Publications", url: "https://gallery015.com/publications" }, { name: publication.title_en, url: `https://gallery015.com/publications/${slug}` }]} />
      <main className="g-page">
        <div className="g-page__grid">
          <header className="g-page__header">
            <p className="g-page__kicker">{t("kicker", lang)}</p>
            <h1>{ar && publication.title_ar ? publication.title_ar : publication.title_en}</h1>
          </header>

          {cover ? (
            <figure className="publication-cover">
              <img src={cover.url} alt={cover.alt_en || publication.title_en} decoding="async" />
            </figure>
          ) : null}

          <div className="g-page__body">
            <div className="g-page__section">
              <h2>{t("type", lang)}</h2>
              <p>{formatLabel(publication.type)}</p>
            </div>
            <div className="g-page__section">
              <h2>{t("published", lang)}</h2>
              <p>{formatDate(publication.publish_date, ar)}</p>
            </div>
            <div className="g-page__section">
              <h2>{t("note", lang)}</h2>
              <p>{ar && publication.description_ar ? publication.description_ar : publication.description_en}</p>
            </div>
            <div className="g-page__links">
              {publication.file_url ? (
                <a href={publication.file_url} target="_blank" rel="noopener noreferrer">{t("open", lang)}</a>
              ) : (
                <Link href="/publications">{t("all", lang)}</Link>
              )}
              <Link href="/publications">{t("all", lang)}</Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
