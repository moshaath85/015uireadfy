import { notFound } from 'next/navigation';
import { ProjectExperience } from '@/components/experience';
import { projectsRepository } from '@/lib/repositories/projects';

interface Props { params: Promise<{ slug: string }> }
export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await projectsRepository.getPublicExperienceBySlug(slug);
  if (!data) notFound();

  return <ProjectExperience data={data} />;
}
