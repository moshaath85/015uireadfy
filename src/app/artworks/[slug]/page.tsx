import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArtworkExperience } from '@/components/experience';
import { artworksRepository } from '@/lib/repositories/artworks';
import { SITE } from '@/lib/metadata';

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

export default async function ArtworkDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await artworksRepository.getPublicExperienceBySlug(slug);
  if (!data) notFound();

  return <ArtworkExperience data={data} />;
}
