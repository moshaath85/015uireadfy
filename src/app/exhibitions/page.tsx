import { EditorialIndex } from '@/components/public/EditorialExperience';
import { exhibitionsRepository } from '@/lib/repositories/exhibitions';
import { mediaRepository } from '@/lib/repositories/media';
import { getServerLanguage } from '@/lib/i18n/server-language';
import type { Language } from '@/lib/i18n/language';
import type { Metadata } from 'next';
import { BreadcrumbListLd } from '@/lib/jsonld';

const T = {
  eyebrow: { ar: 'البرنامج', en: 'Programme' },
  title: { ar: 'المعارض', en: 'Exhibitions' },
  introduction: { ar: 'معارض حالية وقادمة وأرشيفية يقدمها غاليري ٠١٥ بوضوح وسياق.', en: 'Current, forthcoming, and archival exhibitions presented by Gallery 015 with clarity and context.' },
};

function t(key: keyof typeof T, lang: Language): string { return lang === 'ar' ? T[key].ar : T[key].en; }

export const metadata: Metadata = {
  title: 'Exhibitions | Gallery 015',
  description: 'Current, forthcoming, and archival exhibitions presented by Gallery 015 with clarity and context.',
};

export const revalidate = 300;

const longDate = (value: string, lang: Language) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : 'en', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

function dates(start: string, end: string, lang: Language) {
  if (!start) return '';
  if (!end || end === start) return longDate(start, lang);
  return `${longDate(start, lang)} — ${longDate(end, lang)}`;
}

export default async function ExhibitionsPage() {
  const lang = await getServerLanguage();
  const ar = lang === 'ar';
  const exhibitions = await exhibitionsRepository.getPublicAll();
  const items = await Promise.all(exhibitions.map(async (exhibition) => {
    const media = exhibition.cover_media_id ? await mediaRepository.getPublicById(exhibition.cover_media_id) : null;
    return {
      href: `/exhibitions/${exhibition.slug}`,
      title: ar && exhibition.title_ar ? exhibition.title_ar : exhibition.title_en,
      kicker: ar && exhibition.venue_ar ? exhibition.venue_ar : exhibition.venue_en,
      meta: dates(exhibition.start_date, exhibition.end_date, lang),
      description: ar && exhibition.description_ar ? exhibition.description_ar : exhibition.description_en,
      image: media ? { src: media.url, alt: media.alt_ar && ar ? media.alt_ar : media.alt_en || exhibition.title_en } : null,
    };
  }));
  return (
    <>
      <BreadcrumbListLd items={[{ name: 'Gallery 015', url: 'https://gallery015.com' }, { name: 'Exhibitions', url: 'https://gallery015.com/exhibitions' }]} />
      <EditorialIndex eyebrow={t('eyebrow', lang)} title={t('title', lang)} introduction={t('introduction', lang)} items={items} variant="exhibitions" />
    </>
  );
}
