import Link from 'next/link';
import type { ExhibitionExperienceData } from '@/lib/experience/exhibition-experience';
import { ExhibitionMedia } from './ExhibitionMedia';

interface ExhibitionArtistsProps {
  artists: ExhibitionExperienceData['artists'];
}

const publicRoleLabels: Readonly<Record<string, string>> = {
  artist: 'Artist',
  collaborator: 'Collaborator',
  featured_participant: 'Featured participant',
  guest_artist: 'Guest artist',
  speaker: 'Speaker',
};

function roleLabel(role: string): string | null {
  return publicRoleLabels[role.trim().toLowerCase()] ?? null;
}

export function ExhibitionArtists({ artists }: ExhibitionArtistsProps) {
  if (!artists.length) return null;

  return (
    <section className="exhibition-experience-artists" aria-labelledby="exhibition-artists-title">
      <header>
        <p className="exhibition-experience-kicker">Participants</p>
        <h2 id="exhibition-artists-title">Artists and contributors</h2>
      </header>
      <ul className="exhibition-experience-artists__list">
        {artists.map((artist, index) => {
          const label = roleLabel(artist.role);
          return (
            <li className="exhibition-experience-artists__item" key={artist.id}>
              <Link href={`/artists/${artist.slug}`}>
                <span className="exhibition-experience-artists__number" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <ExhibitionMedia fallbackLabel={artist.name} media={artist.profileMedia} variant="artist" />
                <span className="exhibition-experience-artists__identity">
                  {label ? <small>{label}</small> : null}
                  <strong>{artist.name}</strong>
                  {artist.nameAr ? <em dir="rtl" lang="ar">{artist.nameAr}</em> : null}
                </span>
                <span className="exhibition-experience-artists__arrow" aria-hidden="true">↗</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
