import Link from 'next/link';
import type { ArtworkExperienceData } from '@/lib/experience/artwork-experience';

interface ArtworkIdentityProps {
  artist: ArtworkExperienceData['artist'];
  artwork: ArtworkExperienceData['artwork'];
}

export function ArtworkIdentity({ artist, artwork }: ArtworkIdentityProps) {
  const catalogueFacts = [
    artwork.year ? String(artwork.year) : null,
    artwork.medium || null,
    artwork.dimensions || null,
  ].filter((fact): fact is string => Boolean(fact));

  return (
    <div className="artwork-experience-identity">
      <p className="artwork-experience-kicker">Catalogue entry</p>
      <h1>{artwork.title}</h1>
      {artwork.titleAr ? <p className="artwork-experience-identity__arabic" lang="ar" dir="rtl">{artwork.titleAr}</p> : null}
      <div className="artwork-experience-identity__artist">
        <span>Artist</span>
        <Link href={`/artists/${artist.slug}`}>{artist.name}</Link>
      </div>
      {catalogueFacts.length ? (
        <p className="artwork-experience-identity__facts">{catalogueFacts.join(' · ')}</p>
      ) : null}
    </div>
  );
}
