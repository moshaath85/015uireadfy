import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArtworkExperience } from '@/components/experience';
import { artworksRepository } from '@/lib/repositories/artworks';
import { SITE } from '@/lib/metadata';
import { getServerLanguage } from '@/lib/i18n/server-language';
import type { ArtworkExperienceData } from '@/lib/experience/artwork-experience';
import { VisualArtworkLd, BreadcrumbListLd } from '@/lib/jsonld';

interface Props { params: Promise<{ slug: string }> }
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await artworksRepository.getPublicExperienceBySlug(slug);
  if (!data) return { title: 'Artwork Not Found' };
  const title = data.artwork.title;
  const desc = (data.artwork.description ?? '').slice(0, 155).replace(/\n/g, ' ') || `${title} at ${SITE.name}.`;
  return {
    title: `${title} | ${SITE.name}`,
    description: desc,
    openGraph: { title, description: desc },
  };
}

function localizeData(data: ArtworkExperienceData, ar: boolean): ArtworkExperienceData {
  if (!ar) return data;
  return {
    ...data,
    artwork: {
      ...data.artwork,
      title: data.artwork.titleAr || data.artwork.title,
      description: data.artwork.descriptionAr || data.artwork.description,
    },
    artist: {
      ...data.artist,
      name: data.artist.nameAr || data.artist.name,
    },
    collection: data.collection ? {
      ...data.collection,
      title: data.collection.titleAr || data.collection.title,
    } : null,
    exhibitions: data.exhibitions.map((e) => ({
      ...e,
      title: e.titleAr || e.title,
    })),
    projects: data.projects.map((p) => ({
      ...p,
      title: p.titleAr || p.title,
    })),
    relatedWorks: data.relatedWorks.map((w) => ({
      ...w,
      title: w.titleAr || w.title,
    })),
  };
}

export default async function ArtworkDetailPage({ params }: Props) {
  const { slug } = await params;
  const lang = await getServerLanguage();
  const ar = lang === 'ar';
  const data = await artworksRepository.getPublicExperienceBySlug(slug);
  if (!data) notFound();
  const localized = localizeData(data, ar);
  return (
    <>
      <VisualArtworkLd
        name={data.artwork.title}
        alternateName={data.artwork.titleAr || undefined}
        description={data.artwork.description?.slice(0, 300)}
        creatorName={data.artist.name}
        creatorUrl={`https://gallery015.com/artists/${data.artist.slug}`}
        /* year 0 means the creation date is not recorded; emitting "0" would be
           invalid structured data, so omit the property instead. */
        dateCreated={data.artwork.year ? String(data.artwork.year) : undefined}
        artMedium={data.artwork.medium}
        url={`https://gallery015.com/artworks/${slug}`}
      />
      <BreadcrumbListLd items={[{ name: 'Gallery 015', url: 'https://gallery015.com' }, { name: 'Artworks', url: 'https://gallery015.com/artworks' }, { name: data.artwork.title, url: `https://gallery015.com/artworks/${slug}` }]} />
      <ArtworkExperience data={localized} />
    </>
  );
}
