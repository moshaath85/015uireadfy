import { artworksRepository } from '@/lib/repositories/artworks';
import { artistsRepository } from '@/lib/repositories/artists';
import { mediaRepository } from '@/lib/repositories/media';
import Museum3DPage from './Museum3DPage';

export const dynamic = 'force-dynamic';

/** Curated exhibition: four works from the 2020 contemporary collection. */
const EXHIBITION = {
  heroes: ['aw-004', 'aw-128'] as const,
  secondary: ['aw-175', 'aw-029'] as const,
  all: ['aw-004', 'aw-128', 'aw-175', 'aw-029'] as const,
};

export default async function MuseumPage() {
  const [artworks, artists] = await Promise.all([
    artworksRepository.getPublicAll(),
    artistsRepository.getPublicAll(),
  ]);

  const artistMap = new Map(artists.map((a) => [a.id, a.name_en]));
  const workMap = new Map(artworks.map((w) => [w.id, w]));

  const selected = await Promise.all(
    EXHIBITION.all.map(async (id) => {
      const work = workMap.get(id);
      if (!work) return null;
      const media = await mediaRepository.getPublicArtworkPrimaryMedia(work);
      if (!media?.url) return null;
      return {
        id: work.id,
        slug: work.slug,
        title: work.title_en,
        artist: artistMap.get(work.artist_id) ?? 'Unknown',
        year: work.year ?? 0,
        medium: work.medium_en ?? '',
        dimensions: work.dimensions ?? '',
        imageUrl: media.url,
        sceneRole: (EXHIBITION.heroes as readonly string[]).includes(id) ? 'hero' as const : 'secondary' as const,
      };
    }),
  );

  const display = selected.filter(Boolean) as NonNullable<(typeof selected)[number]>[];

  return <Museum3DPage artworks={display} />;
}

