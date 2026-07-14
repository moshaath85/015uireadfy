import { notFound } from 'next/navigation';
import { EditorialDetail } from '@/components/public/EditorialExperience';
import { mediaRepository } from '@/lib/repositories/media';
import { projectsRepository } from '@/lib/repositories/projects';

interface Props { params: { slug: string } }
export const dynamic = 'force-dynamic';
const label = (value: string) => value?.replaceAll('_', ' ');

export default async function ProjectDetailPage({ params }: Props) {
  const project = (await projectsRepository.getPublicAll()).find((item) => item.slug === params.slug);
  if (!project) notFound();
  const cover = project.cover_media_id ? await mediaRepository.getById(project.cover_media_id) : null;
  return <EditorialDetail eyebrow="Project" title={project.title_en} subtitle={project.title_ar} image={cover ? { src: cover.url, alt: cover.alt_en || project.title_en } : null} facts={[{ label: 'Client', value: project.client_en }, { label: 'Type', value: label(project.type) }, { label: 'Year', value: project.year }, { label: 'Status', value: label(project.status) }]} body={project.description_en} backHref="/projects" backLabel="All projects" ctaTitle="Start a project with Gallery 015" />;
}
