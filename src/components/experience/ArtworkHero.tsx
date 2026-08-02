import type { ArtworkExperienceData } from '@/lib/experience/artwork-experience';
import { ArtworkIdentity } from './ArtworkIdentity';
import { ArtworkMedia } from './ArtworkMedia';

interface ArtworkHeroProps {
  artist: ArtworkExperienceData['artist'];
  artwork: ArtworkExperienceData['artwork'];
  media: ArtworkExperienceData['media'];
}

export function ArtworkHero({ artist, artwork, media }: ArtworkHeroProps) {
  return (
    <header className="artwork-experience-hero artwork-experience-hero--catalogue">
      <ArtworkMedia media={media} fallbackLabel={artwork.title} priority variant="hero" />
      <ArtworkIdentity artist={artist} artwork={artwork} />
    </header>
  );
}
