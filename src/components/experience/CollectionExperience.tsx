import Link from 'next/link';
import type { CollectionExperienceData } from '@/lib/experience/collection-experience';
import { CollectionArtists } from './CollectionArtists';
import { CollectionArtworks } from './CollectionArtworks';
import { CollectionExhibitions } from './CollectionExhibitions';
import { CollectionHero } from './CollectionHero';
import { CollectionInquiry } from './CollectionInquiry';
import { CollectionStory } from './CollectionStory';

interface CollectionExperienceProps {
  data: CollectionExperienceData;
}

export function CollectionExperience({ data }: CollectionExperienceProps) {
  return (
    <main className="collection-experience-page">
      <nav className="collection-experience-back" aria-label="Collection navigation">
        <Link href="/collections"><span aria-hidden="true">←</span> All collections</Link>
      </nav>
      <CollectionHero
        artistsCount={data.artists.length}
        artworksCount={data.artworks.length}
        collection={data.collection}
        coverMedia={data.coverMedia}
        exhibitionsCount={data.exhibitions.length}
      />
      <div className="collection-experience-body collection-experience-body--catalogue">
        <CollectionStory description={data.collection.description} />
        <CollectionArtworks artworks={data.artworks} />
        <CollectionArtists artists={data.artists} />
        <CollectionExhibitions exhibitions={data.exhibitions} />
        <CollectionInquiry collectionTitle={data.collection.title} />
      </div>
    </main>
  );
}
