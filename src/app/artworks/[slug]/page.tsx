import { notFound } from 'next/navigation';
import { ArtworkExperience } from '@/components/experience';
import { artworksRepository } from '@/lib/repositories/artworks';

interface Props { params: Promise<{ slug: string }> }
export const dynamic = 'force-dynamic';

export default async function ArtworkDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await artworksRepository.getPublicExperienceBySlug(slug);
  if (!data) notFound();

  return <ArtworkExperience data={data} />;
}
