import { EditorialIndex } from '@/components/public/EditorialExperience';
import { artistsRepository } from '@/lib/repositories/artists';
import { artworksRepository } from '@/lib/repositories/artworks';
import { mediaRepository } from '@/lib/repositories/media';

export const dynamic = 'force-dynamic';

export default async function ArtworksPage() {
  const [artworks, artists] = await Promise.all([artworksRepository.getPublicAll(), artistsRepository.getPublicAll()]);
  const items = await Promise.all(artworks.map(async (artwork) => {
    const media = await mediaRepository.getArtworkPrimaryMedia(artwork);
    const artist = artists.find((item) => item.id === artwork.artist_id);
    return {
      href: `/artworks/${artwork.slug}`,
      title: artwork.title_en,
      kicker: artwork.availability_status?.replaceAll('_', ' '),
      meta: [artist?.name_en, artwork.year, artwork.medium_en].filter(Boolean).join(' · '),
      description: artwork.description_en,
      image: media ? { src: media.url, alt: media.alt_en || artwork.title_en } : null,
    };
  }));

  return <EditorialIndex eyebrow="Selected works" title="Artworks" introduction="A focused selection of contemporary works available through Gallery 015." items={items} />;
}
