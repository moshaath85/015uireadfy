import { EditorialIndex, type EditorialIndexItem } from '@/components/public/EditorialExperience';
import { BreadcrumbListLd } from '@/lib/jsonld';
import { mediaRepository } from '@/lib/repositories/media';
import { publicationsRepository } from '@/lib/repositories/publications';
import { getServerLanguage } from '@/lib/i18n/server-language';
import type { Language } from '@/lib/i18n/language';
import type { Metadata } from 'next';

const T = {
  eyebrow: { ar: 'الإصدارات', en: 'Publications' },
  title: { ar: 'الإصدارات', en: 'Publications' },
  introduction: { ar: 'كتالوجات ونصوص ومراجع منشورة مرتبطة ببرنامج غاليري ٠١٥.', en: 'Catalogues, texts, and published references connected to the Gallery 015 programme.' },
};

function t(key: keyof typeof T, lang: Language): string { return lang === 'ar' ? T[key].ar : T[key].en; }

export const metadata: Metadata = {
  title: 'Publications | Gallery 015',
  description: 'Catalogues, texts, and published references connected to the Gallery 015 programme.',
};

export const revalidate = 300;

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function formatLabel(value: string): string {
  return value.split('_').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

export default async function PublicationsPage() {
  const lang = await getServerLanguage();
  const ar = lang === 'ar';
  const publications = ((await publicationsRepository.getAll()) as any[])
    .filter((p: any) => p.visibility_status === 'public')
    .sort((a: any, b: any) => new Date(`${b.publish_date}T00:00:00.000Z`).getTime() - new Date(`${a.publish_date}T00:00:00.000Z`).getTime());

  const items: EditorialIndexItem[] = await Promise.all(
    publications.map(async (pub: any) => {
      const image = pub.cover_image_id ? await mediaRepository.getById(pub.cover_image_id).catch(() => null) : null;
      return {
        href: pub.file_url || `/publications#${pub.slug}`,
        title: ar && pub.title_ar ? pub.title_ar : pub.title_en,
        kicker: formatLabel(pub.type),
        meta: formatDate(pub.publish_date),
        description: ar && pub.description_ar ? pub.description_ar : pub.description_en,
        image: image ? { src: image.url, alt: pub.title_en } : null,
      };
    }),
  );

  return (
    <>
      <BreadcrumbListLd items={[{ name: 'Gallery 015', url: 'https://gallery015.com' }, { name: 'Publications', url: 'https://gallery015.com/publications' }]} />
      <EditorialIndex
        eyebrow={t('eyebrow', lang)}
        title={t('title', lang)}
        introduction={t('introduction', lang)}
        items={items}
        variant="collections"
      />
    </>
  );
}
