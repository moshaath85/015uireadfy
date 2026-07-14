import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EditorialDetail, EditorialRelated } from '@/components/public/EditorialExperience';
import { artistsRepository } from '@/lib/repositories/artists';
import { artworksRepository } from '@/lib/repositories/artworks';
import { mediaRepository } from '@/lib/repositories/media';

interface Props { params: { slug: string } }
export const dynamic = 'force-dynamic';

export default async function ArtworkDetailPage({ params }: Props) {
  const artwork = await artworksRepository.getPublicBySlug(params.slug);
  if (!artwork) notFound();

  const [artists, media, allWorks] = await Promise.all([artistsRepository.getPublicAll(), mediaRepository.getArtworkPrimaryMedia(artwork), artworksRepository.getPublicAll()]);
  const artist = artists.find((item) => item.id === artwork.artist_id);
  const relatedWorks = allWorks.filter((item) => item.artist_id === artwork.artist_id && item.id !== artwork.id).slice(0, 4);
  const related = await Promise.all(relatedWorks.map(async (item) => {
    const relatedMedia = await mediaRepository.getArtworkPrimaryMedia(item);
    return { href: `/artworks/${item.slug}`, title: item.title_en, meta: `${item.year} · ${item.medium_en}`, image: relatedMedia ? { src: relatedMedia.url, alt: relatedMedia.alt_en || item.title_en } : null };
  }));

  const price = artwork.price_status === 'price_visible' && artwork.price != null ? `${artwork.price} ${artwork.currency}` : artwork.price_status?.replaceAll('_', ' ');

  return (
    <EditorialDetail eyebrow="Artwork" title={artwork.title_en} subtitle={artwork.title_ar} image={media ? { src: media.url, alt: media.alt_en || artwork.title_en } : null}
      facts={[{ label: 'Artist', value: artist ? <Link href={`/artists/${artist.slug}`}>{artist.name_en}</Link> : null }, { label: 'Year', value: artwork.year }, { label: 'Medium', value: artwork.medium_en }, { label: 'Dimensions', value: artwork.dimensions }, { label: 'Availability', value: artwork.availability_status?.replaceAll('_', ' ') }, { label: 'Price', value: price }]}
      body={artwork.description_en} backHref="/artworks" backLabel="All artworks" ctaTitle={`Enquire about ${artwork.title_en}`}>
      <EditorialRelated eyebrow="Related works" title={artist ? `More by ${artist.name_en}` : 'Related artworks'} items={related} />
    </EditorialDetail>
  );
}
