import { notFound } from 'next/navigation';
import { ProjectExperience } from '@/components/experience';
import { projectsRepository } from '@/lib/repositories/projects';
import { getServerLanguage } from '@/lib/i18n/server-language';

interface Props { params: Promise<{ slug: string }> }
export const revalidate = 300;

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await projectsRepository.getPublicExperienceBySlug(slug);
  if (!data) notFound();

  // English view shows no Arabic: drop the secondary Arabic title line.
  const ar = (await getServerLanguage()) === 'ar';
  const localized = ar ? data : { ...data, project: { ...data.project, titleAr: '' } };

  return <ProjectExperience data={localized} />;
}
