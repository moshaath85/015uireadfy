import { notFound } from 'next/navigation';
import { ExhibitionExperience } from '@/components/experience';
import { exhibitionsRepository } from '@/lib/repositories/exhibitions';

interface Props { params: Promise<{ slug: string }> }
export const dynamic = 'force-dynamic';

export default async function ExhibitionDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await exhibitionsRepository.getPublicExperienceBySlug(slug);
  if (!data) notFound();

  return <ExhibitionExperience data={data} />;
}
