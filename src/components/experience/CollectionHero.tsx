import type { CollectionExperienceData } from '@/lib/experience/collection-experience';
import { CollectionIdentity } from './CollectionIdentity';
import { CollectionMedia } from './CollectionMedia';

interface CollectionHeroProps {
  artistsCount: number;
  artworksCount: number;
  collection: CollectionExperienceData['collection'];
  coverMedia: CollectionExperienceData['coverMedia'];
  exhibitionsCount: number;
}

export function CollectionHero({
  artistsCount,
  artworksCount,
  collection,
  coverMedia,
  exhibitionsCount,
}: CollectionHeroProps) {
  return (
    <header className={`collection-experience-hero${coverMedia ? ' collection-experience-hero--with-cover' : ''}`}>
      <CollectionMedia fallbackLabel={collection.title} media={coverMedia} priority variant="hero" />
      <CollectionIdentity
        artistsCount={artistsCount}
        artworksCount={artworksCount}
        collection={collection}
        exhibitionsCount={exhibitionsCount}
      />
    </header>
  );
}
