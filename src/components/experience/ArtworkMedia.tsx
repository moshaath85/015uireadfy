'use client';

import { useState } from 'react';
import type { ArtworkExperienceMedia as ArtworkMediaData } from '@/lib/experience/artwork-experience';

interface ArtworkMediaProps {
  media: ArtworkMediaData | null;
  fallbackLabel: string;
  priority?: boolean;
  variant: 'hero' | 'related';
}

/* Below this the source cannot fill any plate on the site without being
   upscaled, which we do not do. See docs/LOW_RES_ARTWORK_IMAGE_AUDIT.md. */
const ARCHIVAL_SHORT_EDGE = 400;

export function ArtworkMedia({ media, fallbackLabel, priority = false, variant }: ArtworkMediaProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const visibleMedia = media && media.url !== failedSource ? media : null;

  /* Twenty-four works are archival scans of a few hundred pixels. Shown at
     their true size on a full-width hero they occupy about 2% of the plate
     and read as a loading failure rather than as a small work. The answer is
     not to enlarge them — it is to give a small work a small mount, which is
     what the wall would do. */
  const shortEdge = visibleMedia
    ? Math.min(visibleMedia.width ?? 0, visibleMedia.height ?? 0)
    : 0;
  const archival = variant === 'hero' && shortEdge > 0 && shortEdge < ARCHIVAL_SHORT_EDGE;

  return (
    <figure
      className={`artwork-experience-media artwork-experience-media--${variant}`}
      data-source-scale={archival ? 'archival' : undefined}
    >
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
