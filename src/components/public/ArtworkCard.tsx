import type { Artwork } from '@/types';
import { mediaRepository } from '@/lib/repositories/media';
import { PublicCard } from '@/components/public/PageContainer';

export default async function ArtworkCard({ artwork }: { artwork: Artwork }) {
  const media = await mediaRepository.getArtworkPrimaryMedia(artwork);

  return (
    <PublicCard
      href={`/artworks/${artwork.slug}`}
      title={artwork.title_en}
      subtitle={artwork.year}
      meta={artwork.availability_status}
      variant="artwork"
      image={media ? { src: media.url, alt: media.alt_en } : null}
    />
  );
}
