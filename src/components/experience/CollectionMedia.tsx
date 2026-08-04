'use client';

import { useState } from 'react';
import { ArtistMonogram } from '@/components/public/ArtistMonogram';
import type { CollectionExperienceMedia as CollectionMediaData } from '@/lib/experience/collection-experience';

interface CollectionMediaProps {
  fallbackLabel: string;
  media: CollectionMediaData | null;
  priority?: boolean;
  variant: 'hero' | 'artwork' | 'artist' | 'exhibition';
}

export function CollectionMedia({ fallbackLabel, media, priority = false, variant }: CollectionMediaProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const visibleMedia = media && media.url !== failedSource ? media : null;

  return (
    <figure className={`collection-experience-media collection-experience-media--${variant}`}>
      {visibleMedia ? (
        <img
          alt={visibleMedia.alt}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          height={visibleMedia.height ?? undefined}
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setFailedSource(visibleMedia.url)}
          src={visibleMedia.url}
          width={visibleMedia.width ?? undefined}
        />
      ) : variant === 'artist' ? (
        /* A missing portrait is answered by the artist's own initials, not by
           a placeholder that says the gallery has not finished. */
        <ArtistMonogram name={fallbackLabel} />
      ) : (
        <span
          aria-label={`${fallbackLabel} image unavailable`}
          className="collection-experience-media__fallback"
          role="img"
        >
          <span aria-hidden="true">015</span>
          <small>Image forthcoming</small>
        </span>
      )}
    </figure>
  );
}
