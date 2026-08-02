import Link from 'next/link';
import type { ProjectExperienceData } from '@/lib/experience/project-experience';
import { ProjectMedia } from './ProjectMedia';

interface ProjectArtworksProps {
  artworks: ProjectExperienceData['artworks'];
}

export function ProjectArtworks({ artworks }: ProjectArtworksProps) {
  if (!artworks.length) return null;

  return (
    <section className="project-experience-artworks" aria-labelledby="project-artworks-title">
      <header>
        <p className="project-experience-kicker">Project artworks</p>
        <h2 id="project-artworks-title">Works in project context</h2>
      </header>
      <ul className="project-experience-artworks__list">
        {artworks.map((artwork) => (
          <li key={artwork.id}>
            <Link className="project-experience-artworks__entry" href={`/artworks/${artwork.slug}`}>
              <ProjectMedia fallbackLabel={artwork.title} media={artwork.media} variant="artwork" />
              <div className="project-experience-artworks__copy">
                <h3>{artwork.title}</h3>
                <p>{artwork.artist.name}</p>
                <p>{[String(artwork.year), artwork.medium].filter(Boolean).join(' · ')}</p>
                {artwork.inclusionNote?.trim() ? (
                  <p className="project-experience-artworks__context">{artwork.inclusionNote}</p>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
