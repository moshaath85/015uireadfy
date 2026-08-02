import Link from 'next/link';
import type { ArtworkExperienceData } from '@/lib/experience/artwork-experience';

interface ArtworkConnectionsProps {
  collection: ArtworkExperienceData['collection'];
  exhibitions: ArtworkExperienceData['exhibitions'];
  projects: ArtworkExperienceData['projects'];
}

const dateFormatter = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
  year: 'numeric',
});

function formatDate(value: string): string {
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  return start === end ? start : `${start} — ${end}`;
}

export function ArtworkConnections({ collection, exhibitions, projects }: ArtworkConnectionsProps) {
  if (!collection && !exhibitions.length && !projects.length) return null;

  return (
    <section className="artwork-experience-connections" aria-labelledby="artwork-context-title">
      <header>
        <p className="artwork-experience-kicker">Institutional context</p>
        <h2 id="artwork-context-title">Where this work belongs</h2>
      </header>
      <div className="artwork-experience-connections__groups">
        {collection ? (
          <div className="artwork-experience-connections__group">
            <h3>Collection</h3>
            <Link href={`/collections/${collection.slug}`}>
              <span>{collection.title}</span><span aria-hidden="true">↗</span>
            </Link>
          </div>
        ) : null}
        {exhibitions.length ? (
          <div className="artwork-experience-connections__group">
            <h3>Exhibitions</h3>
            {exhibitions.map((exhibition) => (
              <Link href={`/exhibitions/${exhibition.slug}`} key={exhibition.id}>
                <span>
                  <strong>{exhibition.title}</strong>
                  <small>{[exhibition.venue, formatDateRange(exhibition.startDate, exhibition.endDate)].filter(Boolean).join(' · ')}</small>
                </span>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        ) : null}
        {projects.length ? (
          <div className="artwork-experience-connections__group">
            <h3>Projects</h3>
            {projects.map((project) => (
              <Link href={`/projects/${project.slug}`} key={project.id}>
                <span>
                  <strong>{project.title}</strong>
                  {project.year ? <small>{project.year}</small> : null}
                </span>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
