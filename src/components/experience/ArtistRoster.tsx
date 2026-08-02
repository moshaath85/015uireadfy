'use client';

import { useCallback, useState } from 'react';
import { ArtistEntry, type ArtistRosterItem } from './ArtistEntry';

interface ArtistRosterProps {
  artists: ArtistRosterItem[];
}

export function ArtistRoster({ artists }: ArtistRosterProps) {
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
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
}
