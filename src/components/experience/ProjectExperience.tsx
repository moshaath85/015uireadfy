import Link from 'next/link';
import type { ProjectExperienceData } from '@/lib/experience/project-experience';
import { ProjectArtists } from './ProjectArtists';
import { ProjectArtworks } from './ProjectArtworks';
import { ProjectGallery } from './ProjectGallery';
import { ProjectHero } from './ProjectHero';
import { ProjectInformation } from './ProjectInformation';
import { ProjectInquiry } from './ProjectInquiry';
import { ProjectStory } from './ProjectStory';

interface ProjectExperienceProps {
  data: ProjectExperienceData;
}

export function ProjectExperience({ data }: ProjectExperienceProps) {
  return (
    <main className="project-experience-page">
      <nav className="project-experience-back" aria-label="Project navigation">
        <Link href="/projects"><span aria-hidden="true">←</span> All projects</Link>
      </nav>

      <ProjectHero coverMedia={data.coverMedia} media={data.media} project={data.project} />

      <div className="project-experience-body project-experience-body--archive">
        <ProjectStory description={data.project.description} />
        <ProjectInformation project={data.project} />
        <ProjectGallery media={data.media} title={data.project.title} />
        <ProjectArtists artists={data.artists} />
        <ProjectArtworks artworks={data.artworks} />
        <ProjectInquiry projectTitle={data.project.title} />
      </div>
    </main>
  );
}
