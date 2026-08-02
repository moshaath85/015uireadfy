import Link from 'next/link';
import type { ExhibitionExperienceData } from '@/lib/experience/exhibition-experience';
import { ExhibitionArtists } from './ExhibitionArtists';
import { ExhibitionArtworks } from './ExhibitionArtworks';
import { ExhibitionHero } from './ExhibitionHero';
import { ExhibitionInformation } from './ExhibitionInformation';
import { ExhibitionInquiry } from './ExhibitionInquiry';
import { ExhibitionStatement } from './ExhibitionStatement';

interface ExhibitionExperienceProps {
  data: ExhibitionExperienceData;
}

export function ExhibitionExperience({ data }: ExhibitionExperienceProps) {
  return (
    <main className="exhibition-experience-page">
      <nav className="exhibition-experience-back" aria-label="Exhibition navigation">
        <Link href="/exhibitions"><span aria-hidden="true">←</span> All exhibitions</Link>
      </nav>
      <ExhibitionHero coverMedia={data.coverMedia} exhibition={data.exhibition} />
      <div className="exhibition-experience-body">
        <ExhibitionInformation exhibition={data.exhibition} />
        <ExhibitionStatement statement={data.exhibition.statement} />
        <ExhibitionArtists artists={data.artists} />
        <ExhibitionArtworks artworks={data.artworks} />
        <ExhibitionInquiry exhibitionTitle={data.exhibition.title} />
      </div>
    </main>
  );
}
