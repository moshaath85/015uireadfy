import type { ProjectExperienceData } from '@/lib/experience/project-experience';
import { ProjectMedia } from './ProjectMedia';

interface ProjectGalleryProps {
  media: ProjectExperienceData['media'];
  title: string;
}

const PROJECT_MEDIA_ROLE_LABELS: Record<string, string> = {
  context: 'Context',
  detail: 'Detail',
  installation: 'Installation',
  outcome: 'Outcome',
  process: 'Process',
  site: 'Site',
};

function mapRole(role: string): string | null {
  return PROJECT_MEDIA_ROLE_LABELS[role] ?? null;
}

export function ProjectGallery({ media, title }: ProjectGalleryProps) {
  if (!media.length) return null;

  return (
    <section className="project-experience-gallery" aria-labelledby="project-gallery-title">
      <header>
        <p className="project-experience-kicker">Documentation</p>
        <h2 id="project-gallery-title">Commission archive</h2>
      </header>
      <ol className="project-experience-gallery__sequence">
        {media.map((item, index) => {
          const role = mapRole(item.role);
          return (
            <li className="project-experience-gallery__entry" key={item.id}>
              <ProjectMedia fallbackLabel={title} media={item} variant="documentary" />
              <p>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {role ? <span>{role}</span> : null}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
