import { notFound } from 'next/navigation';
import { ExhibitionExperience } from '@/components/experience';
import { exhibitionsRepository } from '@/lib/repositories/exhibitions';
import { getServerLanguage } from '@/lib/i18n/server-language';
import type { ExhibitionExperienceData } from '@/lib/experience/exhibition-experience';
import { ExhibitionEventLd, BreadcrumbListLd } from '@/lib/jsonld';

interface Props { params: Promise<{ slug: string }> }
export const revalidate = 300;

function localizeData(data: ExhibitionExperienceData, ar: boolean): ExhibitionExperienceData {
  // English view shows no Arabic: the secondary Arabic title line is
  // dropped rather than rendered alongside the English one.
  if (!ar) return { ...data, exhibition: { ...data.exhibition, titleAr: '' } };
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

  return (
    <>
      <ExhibitionEventLd
        name={data.exhibition.title}
        alternateName={data.exhibition.titleAr || undefined}
        description={data.exhibition.statement?.slice(0, 300)}
        startDate={data.exhibition.startDate}
        endDate={data.exhibition.endDate}
        locationName={data.exhibition.venue}
        url={`https://gallery015.com/exhibitions/${slug}`}
        image={data.coverMedia?.url}
      />
      <BreadcrumbListLd items={[{ name: 'Gallery 015', url: 'https://gallery015.com' }, { name: 'Exhibitions', url: 'https://gallery015.com/exhibitions' }, { name: data.exhibition.title, url: `https://gallery015.com/exhibitions/${slug}` }]} />
      <ExhibitionExperience data={localizeData(data, ar)} />
    </>
  );
}
