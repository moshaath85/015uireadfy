'use client';

import { useState } from 'react';
import { ArtistMonogram } from '@/components/public/ArtistMonogram';

export interface ArtistMediaSource {
  src: string;
  alt: string;
}

interface ArtistMediaProps {
  image?: ArtistMediaSource | null;
  priority?: boolean;
  variant: 'thumbnail' | 'portrait' | 'work';
  fallbackLabel: string;
}

export function ArtistMedia({ image, priority = false, variant, fallbackLabel }: ArtistMediaProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const visibleImage = image && image.src !== failedSource ? image : null;

  return (
    <figure className={`artist-roster-media artist-roster-media--${variant}`}>
      {visibleImage ? (
        <img
          alt={visibleImage.alt}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setFailedSource(visibleImage.src)}
          src={visibleImage.src}
        />
      ) : variant === 'work' ? (
        /* An artwork plate is not a portrait: a monogram there would read as
           the work's own title. It keeps the house mark. */
        <span className="artist-roster-media__fallback" role="img" aria-label={`${fallbackLabel} image unavailable`}>
          <span aria-hidden="true">015</span>
          <small>Image forthcoming</small>
        </span>
      ) : (
        <ArtistMonogram name={fallbackLabel} />
      )}
    </figure>
  );
}
