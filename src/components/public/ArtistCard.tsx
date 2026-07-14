import type { Artist } from '@/types';
import { mediaRepository } from '@/lib/repositories/media';
import { PublicCard } from '@/components/public/PageContainer';

export default async function ArtistCard({ artist }: { artist: Artist }) {
  const media = await mediaRepository.getArtistProfileMedia(artist);

  return (
    <PublicCard
      href={`/artists/${artist.slug}`}
      title={artist.name_en}
      subtitle={artist.nationality_en}
      meta={artist.representation_status}
      variant="artist"
      image={media ? { src: media.url, alt: media.alt_en } : null}
    />
  );
}
