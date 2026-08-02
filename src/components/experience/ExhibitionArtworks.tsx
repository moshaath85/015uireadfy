import Link from 'next/link';
import type { ExhibitionExperienceData } from '@/lib/experience/exhibition-experience';
import { ExhibitionMedia } from './ExhibitionMedia';

interface ExhibitionArtworksProps {
  artworks: ExhibitionExperienceData['artworks'];
}

export function ExhibitionArtworks({ artworks }: ExhibitionArtworksProps) {
  if (!artworks.length) return null;

  return (
    <section className="exhibition-experience-artworks" aria-labelledby="exhibition-artworks-title">
      <header>
        <p className="exhibition-experience-kicker">Archive</p>
        <h2 id="exhibition-artworks-title">Exhibited works</h2>
      </header>
      <ol className="exhibition-experience-artworks__sequence">
        {artworks.map((artwork, index) => (
          <li className={`exhibition-experience-artworks__item exhibition-experience-artworks__item--${(index % 3) + 1}`} key={artwork.id}>
            <Link className="exhibition-experience-artworks__image-link" href={`/artworks/${artwork.slug}`}>
              <ExhibitionMedia fallbackLabel={artwork.title} media={artwork.media} variant="artwork" />
            </Link>
            <div className="exhibition-experience-artworks__caption">
              <span className="exhibition-experience-artworks__number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <p className="exhibition-experience-artworks__meta">Work {String(index + 1).padStart(2, '0')}</p>
                <Link href={`/artworks/${artwork.slug}`}><h3>{artwork.title}</h3></Link>
                <Link href={`/artists/${artwork.artist.slug}`}>{artwork.artist.name}</Link>
                <p>{[artwork.year, artwork.medium].filter(Boolean).join(' · ')}</p>
                {artwork.collection ? <Link href={`/collections/${artwork.collection.slug}`}>{artwork.collection.title}</Link> : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
