'use client';

import Link from 'next/link';
import { ArtistMedia, type ArtistMediaSource } from './ArtistMedia';
import { ArtistMetadata } from './ArtistMetadata';

export interface ArtistRosterWork {
  id: string;
  image?: ArtistMediaSource | null;
  title: string;
}

export interface ArtistRosterItem {
  id: string;
  slug: string;
  name: string;
  biography: string;
  birthYear?: number | null;
  discipline?: string | null;
  nationality?: string | null;
  representationLabel: string | null;
  profileImage?: ArtistMediaSource | null;
  works: ArtistRosterWork[];
}

interface ArtistEntryProps {
  artist: ArtistRosterItem;
  index: number;
  isOpen: boolean;
  onToggle: (artistId: string) => void;
}

export function ArtistEntry({ artist, index, isOpen, onToggle }: ArtistEntryProps) {
  const number = String(index + 1).padStart(2, '0');

  return (
    <details
      className="artist-roster-entry"
      open={isOpen}
    >
      <summary
        className="artist-roster-entry__summary"
        onClick={(event) => {
          event.preventDefault();
          onToggle(artist.id);
        }}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          onToggle(artist.id);
        }}
      >
        <span className="artist-roster-entry__number" aria-hidden="true">{number}</span>
        <ArtistMedia image={artist.profileImage} variant="thumbnail" fallbackLabel={artist.name} />
        <span className="artist-roster-entry__identity">
          <ArtistMetadata
            birthYear={artist.birthYear}
            discipline={artist.discipline}
            nationality={artist.nationality}
            representationLabel={artist.representationLabel}
            variant="identity"
          />
          <strong>{artist.name}</strong>
        </span>
        <span className="artist-roster-entry__toggle" aria-hidden="true" />
      </summary>

      <div className="artist-roster-entry__panel">
        <ArtistMedia image={artist.profileImage} variant="portrait" fallbackLabel={artist.name} />
        <div className="artist-roster-entry__details">
          <ArtistMetadata
            birthYear={artist.birthYear}
            discipline={artist.discipline}
            nationality={artist.nationality}
            representationLabel={artist.representationLabel}
            variant="panel"
          />
          <p className="artist-roster-entry__biography">{artist.biography}</p>
          <Link className="artist-roster-entry__link" href={`/artists/${artist.slug}`}>
            <span>View artist</span><span aria-hidden="true">↗</span>
          </Link>
          {artist.works.length ? (
            <div className="artist-roster-entry__works" aria-label={`Selected works by ${artist.name}`}>
              {artist.works.map((work) => (
                <Link href={`/artworks/${work.id}`} key={work.id} aria-label={`View ${work.title}`}>
                  <ArtistMedia image={work.image} variant="work" fallbackLabel={work.title} />
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </details>
  );
}
