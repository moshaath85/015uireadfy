import { EditorialIndex, type EditorialIndexItem } from '@/components/public/EditorialExperience';
import { BreadcrumbListLd } from '@/lib/jsonld';
import { mediaRepository } from '@/lib/repositories/media';
import { servicesRepository } from '@/lib/repositories/services';
import { getServerLanguage } from '@/lib/i18n/server-language';
import type { Language } from '@/lib/i18n/language';
import type { Metadata } from 'next';

const T = {
  eyebrow: { ar: 'غاليري ٠١٥', en: 'Gallery 015' },
  title: { ar: 'الخدمات', en: 'Services' },
  introduction: { ar: 'خدمات استشارية وتكليف وجمع تقدم من خلال الغاليري.', en: 'Advisory, commissioning, and collection services offered through the gallery.' },
};

function t(key: keyof typeof T, lang: Language): string { return lang === 'ar' ? T[key].ar : T[key].en; }

export const metadata: Metadata = {
  title: 'Services | Gallery 015',
  description: 'Advisory, commissioning, and collection services offered through Gallery 015.',
};

export const dynamic = 'force-dynamic';

function formatLabel(value: string): string {
  return value.split('_').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

function getServiceCategory(service: any): string {
  return service.category ?? 'gallery_service';
}

export default async function ServicesPage() {
  const lang = await getServerLanguage();
  const ar = lang === 'ar';
  const services = ((await servicesRepository.getAll()) as any[])
    .filter((s: any) => s.visibility_status === 'public')
    .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0) || a.title_en.localeCompare(b.title_en));

  const items: EditorialIndexItem[] = await Promise.all(
    services.map(async (svc: any) => {
      const image = svc.hero_media_id ? await mediaRepository.getById(svc.hero_media_id).catch(() => null) : null;
      const description = ar && svc.description_ar ? svc.description_ar : svc.description_en;
      const features = (ar && svc.features_ar?.length ? svc.features_ar : svc.features_en ?? []) as string[];
      const fullDescription = description + (features.length ? '\n' + features.slice(0, 3).join(' · ') : '');
      return {
        href: `/services#${svc.slug}`,
        title: ar && svc.title_ar ? svc.title_ar : svc.title_en,
        kicker: formatLabel(getServiceCategory(svc)),
        meta: undefined,
        description: fullDescription,
        image: image ? { src: image.url, alt: svc.title_en } : null,
      };
    }),
  );

  return (
    <>
      <BreadcrumbListLd items={[{ name: 'Gallery 015', url: 'https://gallery015.com' }, { name: 'Services', url: 'https://gallery015.com/services' }]} />
      <EditorialIndex
        eyebrow={t('eyebrow', lang)}
        title={t('title', lang)}
        introduction={t('introduction', lang)}
        items={items}
        variant="exhibitions"
      />
    </>
  );
}
