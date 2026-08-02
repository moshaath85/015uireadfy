import Link from 'next/link';
import type { CollectionExperienceData } from '@/lib/experience/collection-experience';
import { CollectionMedia } from './CollectionMedia';

interface CollectionArtistsProps {
  artists: CollectionExperienceData['artists'];
}

export function CollectionArtists({ artists }: CollectionArtistsProps) {
  if (!artists.length) return null;

  return (
    <section className="collection-experience-artists" aria-labelledby="collection-artists-title">
      <header>
        <p className="collection-experience-kicker">The voices</p>
        <h2 id="collection-artists-title">Participating voices</h2>
      </header>
      <ul className="collection-experience-artists__list">
        {artists.map((artist, index) => (
          <li className="collection-experience-artists__item" key={artist.id}>
            <Link href={`/artists/${artist.slug}`}>
              <span className="collection-experience-artists__number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <CollectionMedia fallbackLabel={artist.name} media={artist.profileMedia} variant="artist" />
              <span className="collection-experience-artists__identity">
                <strong>{artist.name}</strong>
                {artist.nameAr ? <small dir="rtl" lang="ar">{artist.nameAr}</small> : null}
              </span>
              <span aria-hidden="true">↗</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
