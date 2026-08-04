'use client';

import { useState } from 'react';
import { ArtistMonogram } from '@/components/public/ArtistMonogram';
import type { ExhibitionExperienceMedia as ExhibitionMediaData } from '@/lib/experience/exhibition-experience';

interface ExhibitionMediaProps {
  fallbackLabel: string;
  media: ExhibitionMediaData | null;
  priority?: boolean;
  variant: 'hero' | 'artist' | 'artwork';
}

export function ExhibitionMedia({ fallbackLabel, media, priority = false, variant }: ExhibitionMediaProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const visibleMedia = media && media.url !== failedSource ? media : null;

  return (
    <figure className={`exhibition-experience-media exhibition-experience-media--${variant}`}>
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
          className="exhibition-experience-media__fallback"
          role="img"
        >
          <span aria-hidden="true">015</span>
          <small>Image forthcoming</small>
        </span>
      )}
    </figure>
  );
}
