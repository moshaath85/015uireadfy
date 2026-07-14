import { EditorialIndex } from '@/components/public/EditorialExperience';
import { artistsRepository } from '@/lib/repositories/artists';
import { mediaRepository } from '@/lib/repositories/media';

export const dynamic = 'force-dynamic';

export default async function ArtistsPage() {
  const artists = await artistsRepository.getPublicAll();
  const items = await Promise.all(artists.map(async (artist) => {
    const media = await mediaRepository.getArtistProfileMedia(artist);
    return {
      href: `/artists/${artist.slug}`,
      title: artist.name_en,
      kicker: artist.representation_status?.replaceAll('_', ' '),
      meta: [artist.nationality_en, artist.birth_year ? `b. ${artist.birth_year}` : null].filter(Boolean).join(' · '),
      description: artist.bio_en,
      image: media ? { src: media.url, alt: media.alt_en || artist.name_en } : null,
    };
  }));

  return <EditorialIndex eyebrow="Gallery 015 artists" title="Artists" introduction="Distinct practices, considered voices, and enduring artistic relationships." items={items} />;
}
