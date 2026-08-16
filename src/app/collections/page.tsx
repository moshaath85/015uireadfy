import { EditorialIndex } from '@/components/public/EditorialExperience';
import { collectionsRepository } from '@/lib/repositories/collections';
import { mediaRepository } from '@/lib/repositories/media';
import { getServerLanguage } from '@/lib/i18n/server-language';
import type { Language } from '@/lib/i18n/language';
import type { Metadata } from 'next';
import { BreadcrumbListLd } from '@/lib/jsonld';

const T = {
  eyebrow: { ar: 'سرديات منسقة', en: 'Curated narratives' },
  title: { ar: 'المجموعات', en: 'Collections' },
  introduction: { ar: 'أعمال جمعت معًا عبر المادة والذاكرة والمكان والحوار الفني.', en: 'Works brought together through material, memory, place, and artistic dialogue.' },
  kicker: { ar: 'مجموعة', en: 'Collection' },
};

function t(key: keyof typeof T, lang: Language): string { return lang === 'ar' ? T[key].ar : T[key].en; }

export const metadata: Metadata = {
  title: 'Collections | Gallery 015',
  description: 'Curated collections at Gallery 015 — works brought together through material, memory, place, and artistic dialogue.',
};

export const revalidate = 300;

export default async function CollectionsPage() {
  const lang = await getServerLanguage();
  const ar = lang === 'ar';
  const collections = await collectionsRepository.getPublicAll();
  const items = await Promise.all(collections.map(async (collection) => {
    const media = collection.cover_media_id ? await mediaRepository.getPublicById(collection.cover_media_id) : null;
    return {
      href: `/collections/${collection.slug}`,
      title: ar && collection.title_ar ? collection.title_ar : collection.title_en,
      kicker: t('kicker', lang),
      description: ar && collection.description_ar ? collection.description_ar : collection.description_en,
      image: media ? { src: media.url, alt: media.alt_ar && ar ? media.alt_ar : media.alt_en || collection.title_en } : null,
    };
  }));
  return (
    <>
      <BreadcrumbListLd items={[{ name: 'Gallery 015', url: 'https://gallery015.com' }, { name: 'Collections', url: 'https://gallery015.com/collections' }]} />
      <EditorialIndex eyebrow={t('eyebrow', lang)} title={t('title', lang)} introduction={t('introduction', lang)} items={items} variant="collections" />
    </>
  );
}
