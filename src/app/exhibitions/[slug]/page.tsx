import { notFound } from 'next/navigation';
import { ExhibitionExperience } from '@/components/experience';
import { exhibitionsRepository } from '@/lib/repositories/exhibitions';
import { getServerLanguage } from '@/lib/i18n/server-language';
import type { ExhibitionExperienceData } from '@/lib/experience/exhibition-experience';

interface Props { params: Promise<{ slug: string }> }
export const dynamic = 'force-dynamic';

function localizeData(data: ExhibitionExperienceData, ar: boolean): ExhibitionExperienceData {
  if (!ar) return data;
  return {
    ...data,
    exhibition: {
      ...data.exhibition,
      title: data.exhibition.titleAr || data.exhibition.title,
      statement: data.exhibition.statementAr || data.exhibition.statement,
      venue: data.exhibition.venueAr || data.exhibition.venue,
    },
    artists: data.artists.map((a) => ({
      ...a,
      name: a.nameAr || a.name,
    })),
    artworks: data.artworks.map((w) => ({
      ...w,
      title: w.titleAr || w.title,
      artist: {
        ...w.artist,
        name: w.artist.nameAr || w.artist.name,
      },
      collection: w.collection ? {
        ...w.collection,
        title: w.collection.titleAr || w.collection.title,
      } : null,
    })),
  };
}

export default async function ExhibitionDetailPage({ params }: Props) {
  const { slug } = await params;
  const lang = await getServerLanguage();
  const ar = lang === 'ar';
  const data = await exhibitionsRepository.getPublicExperienceBySlug(slug);
  if (!data) notFound();

  return <ExhibitionExperience data={localizeData(data, ar)} />;
}
