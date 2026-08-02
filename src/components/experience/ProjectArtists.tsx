import Link from 'next/link';
import type { ProjectExperienceData } from '@/lib/experience/project-experience';
import { ProjectMedia } from './ProjectMedia';

interface ProjectArtistsProps {
  artists: ProjectExperienceData['artists'];
}

const PROJECT_ARTIST_ROLE_LABELS: Record<string, string> = {
  advisor: 'Advisor',
  collaborator: 'Collaborator',
  consultant: 'Consultant',
  curator: 'Curator',
  lead_artist: 'Lead artist',
  participating_artist: 'Participating artist',
};

function mapRole(role: string): string | null {
  return PROJECT_ARTIST_ROLE_LABELS[role] ?? null;
}

export function ProjectArtists({ artists }: ProjectArtistsProps) {
  if (!artists.length) return null;

  return (
    <section className="project-experience-artists" aria-labelledby="project-artists-title">
      <header>
        <p className="project-experience-kicker">Project artists</p>
        <h2 id="project-artists-title">Collaboration record</h2>
      </header>
      <ul className="project-experience-artists__list">
        {artists.map((artist) => {
          const role = mapRole(artist.role);
          return (
            <li key={artist.id}>
              <ProjectMedia fallbackLabel={artist.name} media={artist.profileMedia} variant="artist" />
              <div>
                <Link href={`/artists/${artist.slug}`}>{artist.name}</Link>
                {role ? <p>{role}</p> : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
