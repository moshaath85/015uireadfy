import Link from 'next/link';
import type { CollectionExperienceData } from '@/lib/experience/collection-experience';
import { CollectionMedia } from './CollectionMedia';

interface CollectionArtworksProps {
  artworks: CollectionExperienceData['artworks'];
}

export function CollectionArtworks({ artworks }: CollectionArtworksProps) {
  if (!artworks.length) return null;

  return (
    <section className="collection-experience-artworks" aria-labelledby="collection-artworks-title">
      <header>
        <p className="collection-experience-kicker">The works</p>
        <h2 id="collection-artworks-title">Curated ensemble</h2>
      </header>
      <ol className="collection-experience-artworks__sequence">
        {artworks.map((artwork, index) => (
          <li
            className={`collection-experience-artworks__item collection-experience-artworks__item--${(index % 4) + 1}`}
            key={artwork.id}
          >
            <Link href={`/artworks/${artwork.slug}`}>
              <CollectionMedia fallbackLabel={artwork.title} media={artwork.media} variant="artwork" />
              <div className="collection-experience-artworks__caption">
                <div>
                  <h3>{artwork.title}</h3>
                  <p>{artwork.artist.name}</p>
                </div>
                <p>{[artwork.year, artwork.medium].filter(Boolean).join(' · ')}</p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
