'use client';

import { useState } from 'react';
import type { ArtworkExperienceMedia as ArtworkMediaData } from '@/lib/experience/artwork-experience';

interface ArtworkMediaProps {
  media: ArtworkMediaData | null;
  fallbackLabel: string;
  priority?: boolean;
  variant: 'hero' | 'related';
}

export function ArtworkMedia({ media, fallbackLabel, priority = false, variant }: ArtworkMediaProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const visibleMedia = media && media.url !== failedSource ? media : null;

  return (
    <figure className={`artwork-experience-media artwork-experience-media--${variant}`}>
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
      ) : (
        <span
          className="artwork-experience-media__fallback"
          role="img"
          aria-label={`${fallbackLabel} image unavailable`}
        >
          <span aria-hidden="true">015</span>
          <small>Image forthcoming</small>
        </span>
      )}
    </figure>
  );
}
