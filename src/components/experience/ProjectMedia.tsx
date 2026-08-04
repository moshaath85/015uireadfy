'use client';

import { useState } from 'react';
import { ArtistMonogram } from '@/components/public/ArtistMonogram';
import type { ProjectExperienceMedia } from '@/lib/experience/project-experience';

interface ProjectMediaProps {
  fallbackLabel: string;
  media: ProjectExperienceMedia | null;
  priority?: boolean;
  variant: 'hero' | 'supporting' | 'documentary' | 'artist' | 'artwork';
}

export function ProjectMedia({ fallbackLabel, media, priority = false, variant }: ProjectMediaProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const visibleMedia = media && media.url !== failedSource ? media : null;

  return (
    <figure className={`project-experience-media project-experience-media--${variant}`}>
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
          className="project-experience-media__fallback"
          role="img"
        >
          <span>015 / Image forthcoming</span>
        </span>
      )}
    </figure>
  );
}
