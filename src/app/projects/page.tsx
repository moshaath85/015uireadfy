import { EditorialIndex } from '@/components/public/EditorialExperience';
import { mediaRepository } from '@/lib/repositories/media';
import { projectsRepository } from '@/lib/repositories/projects';
import { getServerLanguage } from '@/lib/i18n/server-language';
import type { Language } from '@/lib/i18n/language';
import type { Metadata } from 'next';

const T = {
  eyebrow: { ar: 'الفن في المكان', en: 'Art in place' },
  title: { ar: 'المشاريع', en: 'Projects' },
  introduction: { ar: 'برامج فنية مخصصة للمعارض والمستشفيات والمساحات الخاصة والمؤسسات الثقافية.', en: 'Bespoke art programmes for galleries, hospitals, private spaces, and cultural institutions.' },
};

function t(key: keyof typeof T, lang: Language): string { return lang === 'ar' ? T[key].ar : T[key].en; }

export const metadata: Metadata = {
  title: 'Projects | Gallery 015',
  description: 'Commissioned art programmes for institutions, hospitals, and cultural landmarks across Saudi Arabia.',
};

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const lang = await getServerLanguage();
  const ar = lang === 'ar';
  const projects = await projectsRepository.getPublicAll();
  const items = await Promise.all(projects.map(async (project) => {
    const media = project.cover_media_id ? await mediaRepository.getPublicById(project.cover_media_id) : null;
    const client = ar && project.client_ar ? project.client_ar : project.client_en;
    return {
      href: `/projects/${project.slug}`,
      title: ar && project.title_ar ? project.title_ar : project.title_en,
      kicker: project.type?.replaceAll('_', ' '),
      meta: [client, project.year].filter(Boolean).join(' · '),
      description: ar && project.description_ar ? project.description_ar : project.description_en,
      image: media ? { src: media.url, alt: media.alt_ar && ar ? media.alt_ar : media.alt_en || project.title_en } : null,
    };
  }));
  return <EditorialIndex eyebrow={t('eyebrow', lang)} title={t('title', lang)} introduction={t('introduction', lang)} items={items} variant="projects" />;
}
