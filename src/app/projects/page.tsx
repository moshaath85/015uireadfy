import { EditorialIndex } from '@/components/public/EditorialExperience';
import { mediaRepository } from '@/lib/repositories/media';
import { projectsRepository } from '@/lib/repositories/projects';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const projects = await projectsRepository.getPublicAll();
  const items = await Promise.all(projects.map(async (project) => {
    const media = project.cover_media_id ? await mediaRepository.getById(project.cover_media_id) : null;
    return { href: `/projects/${project.slug}`, title: project.title_en, kicker: project.type?.replaceAll('_', ' '), meta: [project.client_en, project.year].filter(Boolean).join(' · '), description: project.description_en, image: media ? { src: media.url, alt: media.alt_en || project.title_en } : null };
  }));
  return <EditorialIndex eyebrow="Art in place" title="Projects" introduction="Bespoke art programmes for galleries, hospitals, private spaces, and cultural institutions." items={items} variant="projects" />;
}
