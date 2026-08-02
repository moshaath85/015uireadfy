import { EditorialIndex, type EditorialIndexItem } from '@/components/public/EditorialExperience';
import { mediaRepository } from '@/lib/repositories/media';
import { newsRepository } from '@/lib/repositories/news';
import { getServerLanguage } from '@/lib/i18n/server-language';
import type { Language } from '@/lib/i18n/language';
import type { Metadata } from 'next';

const T = {
  eyebrow: { ar: 'مجلة ٠١٥', en: '015 Journal' },
  title: { ar: 'المجلة', en: 'Journal' },
  introduction: { ar: 'مقالات ونقد ومقابلات وملاحظات حول المشهد الفني السعودي والإقليمي.', en: 'Essays, criticism, interviews, and gallery notes on the Saudi and regional art scene.' },
};

function t(key: keyof typeof T, lang: Language): string { return lang === 'ar' ? T[key].ar : T[key].en; }

export const metadata: Metadata = {
  title: 'Journal | Gallery 015',
  description: 'Essays, criticism, interviews, and gallery notes on the Saudi and regional art scene — the 015 Journal.',
};

export const dynamic = 'force-dynamic';

const monthYear = (value: string, lang: Language) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : 'en', { month: 'long', year: 'numeric' }).format(date);
};

function formatCategory(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default async function NewsPage() {
  const lang = await getServerLanguage();
  const ar = lang === 'ar';
  const allNews = await newsRepository.getPublicAll();

  const sortedNews = [...allNews].sort(
    (a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime(),
  );

  const items: EditorialIndexItem[] = await Promise.all(
    sortedNews.map(async (item) => {
        const image = item.image_id ? await mediaRepository.getPublicById(item.image_id) : null;
        return {
          href: `/news/${item.slug}`,
          title: ar && item.title_ar ? item.title_ar : item.title_en,
          kicker: formatCategory(item.category),
          meta: monthYear(item.publish_date, lang),
          description: ar && item.excerpt_ar ? item.excerpt_ar : item.excerpt_en,
          image: image ? { src: image.url, alt: image.alt_ar && ar ? image.alt_ar : image.alt_en || item.title_en } : null,
        };
      }),
  );

  return (
    <EditorialIndex
      eyebrow={t('eyebrow', lang)}
      title={t('title', lang)}
      introduction={t('introduction', lang)}
      items={items}
    />
  );
}
