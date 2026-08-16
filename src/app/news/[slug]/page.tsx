import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { EditorialDetail, EditorialRelated, type EditorialIndexItem } from '@/components/public/EditorialExperience';
import { mediaRepository } from '@/lib/repositories/media';
import { newsRepository } from '@/lib/repositories/news';
import { SITE } from '@/lib/metadata';
import { getServerLanguage } from '@/lib/i18n/server-language';
import type { Language } from '@/lib/i18n/language';
import { ArticleLd, BreadcrumbListLd } from '@/lib/jsonld';

const T = {
  published: { ar: 'نُشر', en: 'Published' },
  category: { ar: 'الفئة', en: 'Category' },
  reading_time: { ar: 'وقت القراءة', en: 'Reading time' },
  min_read: { ar: 'دقيقة قراءة', en: 'min read' },
  back_label: { ar: 'كل المجلة', en: 'All journal' },
  cta_title: { ar: 'تواصل مع الغاليري', en: 'Contact the gallery' },
  further_reading: { ar: 'قراءة إضافية', en: 'Further reading' },
  related_articles: { ar: 'مقالات ذات صلة', en: 'Related articles' },
  article_not_found: { ar: 'المقال غير موجود', en: 'Article Not Found' },
};

function t(key: keyof typeof T, lang: Language): string { return lang === 'ar' ? T[key].ar : T[key].en; }

interface Props { params: Promise<{ slug: string }> }
export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = (await newsRepository.getPublicAll()).find(c => c.slug === slug);
  if (!item) return { title: t('article_not_found', 'en') };
  const desc = (item.excerpt_en ?? '').slice(0, 155).replace(/\n/g, ' ') || '015 Journal article.';
  return { title: `${item.title_en} | ${SITE.name}`, description: desc };
}

const fullDate = (value: string, ar: boolean) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(ar ? 'ar' : 'en', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

function formatCategory(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function readingTime(body: string, lang: Language): string {
  const words = body.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} ${t('min_read', lang)}`;
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const lang = await getServerLanguage();
  const ar = lang === 'ar';
  const item = (await newsRepository.getPublicAll()).find((candidate) => candidate.slug === slug);
  if (!item) notFound();

  const image = item.image_id ? await mediaRepository.getPublicById(item.image_id) : null;
  const allNews = await newsRepository.getPublicAll();
  const related: EditorialIndexItem[] = await Promise.all(
    allNews
      .filter((candidate) => candidate.id !== item.id)
      .slice(0, 3)
      .map(async (candidate) => {
        const relatedImage = candidate.image_id ? await mediaRepository.getPublicById(candidate.image_id) : null;
        return {
          href: `/news/${candidate.slug}`,
          title: ar && candidate.title_ar ? candidate.title_ar : candidate.title_en,
          meta: fullDate(candidate.publish_date, ar),
          image: relatedImage ? { src: relatedImage.url, alt: relatedImage.alt_ar && ar ? relatedImage.alt_ar : relatedImage.alt_en || candidate.title_en } : null,
        };
      }),
  );

  return (
    <>
      <ArticleLd
        headline={item.title_en}
        alternateName={item.title_ar || undefined}
        description={item.excerpt_en?.slice(0, 300) || item.content_en?.slice(0, 300)}
        author="Gallery 015"
        datePublished={item.publish_date}
        url={`https://gallery015.com/news/${slug}`}
        image={image?.url}
      />
      <BreadcrumbListLd items={[{ name: 'Gallery 015', url: 'https://gallery015.com' }, { name: 'Journal', url: 'https://gallery015.com/news' }, { name: item.title_en, url: `https://gallery015.com/news/${slug}` }]} />
    <EditorialDetail
      eyebrow={formatCategory(item.category)}
      title={ar && item.title_ar ? item.title_ar : item.title_en}
      subtitle={ar && item.title_ar ? item.title_en : item.title_ar}
      image={image ? { src: image.url, alt: image.alt_ar && ar ? image.alt_ar : image.alt_en || item.title_en } : null}
      facts={[
        { label: t('published', lang), value: fullDate(item.publish_date, ar) },
        { label: t('category', lang), value: formatCategory(item.category) },
        { label: t('reading_time', lang), value: readingTime(item.content_en || item.excerpt_en, lang) },
      ]}
      body={ar && item.content_ar ? item.content_ar : item.content_en || item.excerpt_en}
      backHref="/news"
      backLabel={t('back_label', lang)}
      ctaTitle={t('cta_title', lang)}
    >
      <EditorialRelated
        eyebrow={t('further_reading', lang)}
        title={t('related_articles', lang)}
        items={related}
      />
    </EditorialDetail>
    </>
  );
}
