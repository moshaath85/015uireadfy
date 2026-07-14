import { notFound } from 'next/navigation';
import { EditorialDetail } from '@/components/public/EditorialExperience';
import { exhibitionsRepository } from '@/lib/repositories/exhibitions';
import { mediaRepository } from '@/lib/repositories/media';

interface Props { params: { slug: string } }
export const dynamic = 'force-dynamic';
function formatDate(value: string) { return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T00:00:00.000Z`)); }

export default async function ExhibitionDetailPage({ params }: Props) {
  const exhibition = (await exhibitionsRepository.getPublicAll()).find((item) => item.slug === params.slug);
  if (!exhibition) notFound();
  const cover = exhibition.cover_media_id ? await mediaRepository.getById(exhibition.cover_media_id) : null;
  return <EditorialDetail eyebrow="Exhibition" title={exhibition.title_en} subtitle={exhibition.title_ar} image={cover ? { src: cover.url, alt: cover.alt_en || exhibition.title_en } : null} facts={[{ label: 'Venue', value: exhibition.venue_en }, { label: 'Dates', value: `${formatDate(exhibition.start_date)} — ${formatDate(exhibition.end_date)}` }]} body={exhibition.description_en} backHref="/exhibitions" backLabel="All exhibitions" ctaTitle="Arrange a private viewing" />;
}
