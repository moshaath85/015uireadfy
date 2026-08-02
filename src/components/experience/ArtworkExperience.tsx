import Link from 'next/link';
import type { ArtworkExperienceData } from '@/lib/experience/artwork-experience';
import { ArtworkConnections } from './ArtworkConnections';
import { ArtworkDetails } from './ArtworkDetails';
import { ArtworkHero } from './ArtworkHero';
import { ArtworkInquiry } from './ArtworkInquiry';
import { ArtworkRelated } from './ArtworkRelated';
import { ArtworkStory } from './ArtworkStory';

interface ArtworkExperienceProps {
  data: ArtworkExperienceData;
}

export function ArtworkExperience({ data }: ArtworkExperienceProps) {
  return (
    <main className="artwork-experience-page">
      <nav className="artwork-experience-back" aria-label="Artwork navigation">
        <Link href="/artworks"><span aria-hidden="true">←</span> All artworks</Link>
      </nav>
      <ArtworkHero artist={data.artist} artwork={data.artwork} media={data.media} />
      <div className="artwork-experience-body artwork-experience-body--catalogue">
        <ArtworkStory description={data.artwork.description} />
        <ArtworkDetails artwork={data.artwork} />
        <div className="artwork-experience-context">
          <ArtworkConnections
            collection={data.collection}
            exhibitions={data.exhibitions}
            projects={data.projects}
          />
        </div>
        <ArtworkRelated works={data.relatedWorks} />
        <ArtworkInquiry artworkTitle={data.artwork.title} />
      </div>
    </main>
  );
}
