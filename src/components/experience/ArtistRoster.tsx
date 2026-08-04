'use client';

import { useCallback, useState } from 'react';
import { ArtistEntry, type ArtistRosterItem, type ArtistRosterLabels } from './ArtistEntry';

interface ArtistRosterProps {
  artists: ArtistRosterItem[];
  labels: ArtistRosterLabels;
}

export function ArtistRoster({ artists, labels }: ArtistRosterProps) {
  const [openArtistId, setOpenArtistId] = useState<string | null>(null);

  const handleToggle = useCallback((artistId: string) => {
    setOpenArtistId((current) => current === artistId ? null : artistId);
  }, []);

  if (!artists.length) {
    return <p className="artist-roster-empty">No published artists are currently available.</p>;
  }

  return (
    <div className="artist-roster-list">
      {artists.map((artist, index) => (
        <ArtistEntry
          artist={artist}
          index={index}
          isOpen={openArtistId === artist.id}
          key={artist.id}
          labels={labels}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
}
