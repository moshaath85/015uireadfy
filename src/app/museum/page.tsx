import { artworksRepository } from '@/lib/repositories/artworks';
import { artistsRepository } from '@/lib/repositories/artists';
import { mediaRepository } from '@/lib/repositories/media';
import Museum3DPage from './Museum3DPage';

export const dynamic = 'force-dynamic';

export default async function MuseumPage() {
  const [artworks, artists] = await Promise.all([
    artworksRepository.getPublicAll(),
    artistsRepository.getPublicAll(),
  ]);

  const artistMap = new Map(artists.map((a) => [a.id, a.name_en]));

  const candidates = await Promise.all(
    artworks
      .filter((w) => w.visibility_status === 'public')
      .map(async (work) => {
        const primaryMedia = await mediaRepository.getPublicArtworkPrimaryMedia(work);
        return {
          id: work.id, slug: work.slug, title: work.title_en,
          artist: artistMap.get(work.artist_id) ?? 'Unknown',
          year: work.year ?? 0, medium: work.medium_en ?? '',
          dimensions: work.dimensions ?? '',
          imageUrl: primaryMedia?.url ?? null,
          pixelArea: (primaryMedia?.width ?? 0) * (primaryMedia?.height ?? 0),
          featured: Boolean(work.featured || work.is_featured_homepage),
          physicalMax: Number(work.dimensions?.match(/([\d.]+)\s*[×xX]\s*([\d.]+)/)?.[1] ?? 0),
        };
      }),
  );

  const usable = candidates.filter((w) => w.imageUrl !== null);
  const bySize = [...usable].sort((a, b) =>
    Number(b.featured) - Number(a.featured) ||
    Number(b.physicalMax >= 140) - Number(a.physicalMax >= 140) ||
    b.pixelArea - a.pixelArea,
  );
  const first = bySize[0];
  const second = bySize.find((w) => w.id !== first?.id) ?? bySize[1];
  const heroes = [first, second].filter(Boolean);
  const rest = bySize.filter((w) => !heroes.includes(w)).slice(0, 2);
  const selected = [...heroes, ...rest].slice(0, 4);

  const display = selected.map((w, i) => ({
    id: w.id, slug: w.slug, title: w.title, artist: w.artist,
    year: w.year, medium: w.medium, dimensions: w.dimensions,
    imageUrl: w.imageUrl!,
    sceneRole: (i < 2 ? 'hero' : 'secondary') as 'hero' | 'secondary',
  }));

  return <Museum3DPage artworks={display} />;
}
