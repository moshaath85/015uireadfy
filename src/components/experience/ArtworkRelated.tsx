import Link from 'next/link';
import type { ArtworkExperienceData } from '@/lib/experience/artwork-experience';
import { ArtworkMedia } from './ArtworkMedia';

interface ArtworkRelatedProps {
  works: ArtworkExperienceData['relatedWorks'];
}

export function ArtworkRelated({ works }: ArtworkRelatedProps) {
  if (!works.length) return null;

  return (
    <section className="artwork-experience-related" aria-labelledby="related-works-title">
      <header>
        <p className="artwork-experience-kicker">Further works</p>
        <h2 id="related-works-title">In dialogue with this artwork</h2>
      </header>
      <ol className="artwork-experience-related__grid">
        {works.map((work, index) => (
          <li className="artwork-experience-related__entry" key={work.id}>
            <Link className="artwork-experience-related__item" href={`/artworks/${work.slug}`}>
              <ArtworkMedia media={work.media} fallbackLabel={work.title} variant="related" />
              <div>
                <p className="artwork-experience-related__sequence">Work {String(index + 1).padStart(2, '0')}</p>
                <h3>{work.title}</h3>
                <p>{[work.artist.name, work.year, work.medium].filter(Boolean).join(' · ')}</p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
