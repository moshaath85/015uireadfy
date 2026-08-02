import type { ProjectExperienceData } from '@/lib/experience/project-experience';
import { ProjectIdentity } from './ProjectIdentity';
import { ProjectMedia } from './ProjectMedia';

interface ProjectHeroProps {
  coverMedia: ProjectExperienceData['coverMedia'];
  media: ProjectExperienceData['media'];
  project: ProjectExperienceData['project'];
}

export function ProjectHero({ coverMedia, media, project }: ProjectHeroProps) {
  const heroMedia = coverMedia ?? media[0] ?? null;
  const supportingMedia = media.filter((item) => item.id !== heroMedia?.id).slice(0, 2);

  return (
    <header className={`project-experience-hero${supportingMedia.length ? ' project-experience-hero--with-supporting' : ''}`}>
      <ProjectMedia
        fallbackLabel={project.title}
        media={heroMedia}
        priority
        variant="hero"
      />
      <ProjectIdentity project={project} />
      {supportingMedia.length ? (
        <div className="project-experience-hero-supporting" aria-label="Supporting project media">
          {supportingMedia.map((item) => (
            <ProjectMedia fallbackLabel={project.title} key={item.id} media={item} variant="supporting" />
          ))}
        </div>
      ) : null}
    </header>
  );
}
