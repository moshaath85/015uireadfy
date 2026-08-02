import { notFound } from 'next/navigation';
import { CollectionExperience } from '@/components/experience';
import { collectionsRepository } from '@/lib/repositories/collections';

interface Props { params: Promise<{ slug: string }> }
export const dynamic = 'force-dynamic';

export default async function CollectionDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await collectionsRepository.getPublicExperienceBySlug(slug);
  if (!data) notFound();

  return <CollectionExperience data={data} />;
}
