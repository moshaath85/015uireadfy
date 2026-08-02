import { artworksRepository } from '@/lib/repositories/artworks';
import { artistsRepository } from '@/lib/repositories/artists';
import { mediaRepository } from '@/lib/repositories/media';
import { getArtists, getArtworks, getMediaById } from '@/lib/data/loaders';
import Museum3DPage from './Museum3DPage';

export const dynamic = 'force-dynamic';

/** Curated exhibition: the four route works lead a restrained salon of public works. */
const EXHIBITION = {
  heroes: ['aw-013', 'aw-128'] as const,
  secondary: ['aw-175', 'aw-029'] as const,
  all: ['aw-013', 'aw-128', 'aw-175', 'aw-029', 'aw-006', 'aw-030', 'aw-037', 'aw-038'] as const,
};

export default async function MuseumPage() {
  let artworks: Awaited<ReturnType<typeof artworksRepository.getPublicAll>> = [];
  let artists: Awaited<ReturnType<typeof artistsRepository.getPublicAll>> = [];
  try {
    [artworks, artists] = await Promise.all([
      artworksRepository.getPublicAll(),
      artistsRepository.getPublicAll(),
    ]);
  } catch {
    // The local public catalog remains the museum's offline-safe source.
  }

  // Local development can have an empty Prisma public slice while the approved
  // catalog is present in the repository. Keep DB first; use catalog only then.
  const localArtworks = getArtworks();
  const hasCompleteDatabaseExhibition = EXHIBITION.all.every((id) => artworks.some((work) => work.id === id));
  const sourceArtworks = hasCompleteDatabaseExhibition ? artworks : localArtworks;
  const sourceArtists = artists.length ? artists : getArtists();
  const artistMap = new Map(sourceArtists.map((a) => [a.id, a.name_en]));
  const workMap = new Map(sourceArtworks.map((w) => [w.id, w]));

  const selected = await Promise.all(
    EXHIBITION.all.map(async (id) => {
      const work = workMap.get(id);
      if (!work) return null;
      const media = await mediaRepository.getPublicArtworkPrimaryMedia(work) ?? getMediaById(work.primary_image_id ?? '');
      const imageUrl = media?.storage_path || media?.url;
      if (!imageUrl) return null;
      return {
        id: work.id,
        slug: work.slug,
        title: work.title_en,
        artist: artistMap.get(work.artist_id) ?? 'Unknown',
        year: work.year ?? 0,
        medium: work.medium_en ?? '',
        dimensions: work.dimensions ?? '',
        imageUrl,
        sceneRole: (EXHIBITION.heroes as readonly string[]).includes(id) ? 'hero' as const : 'secondary' as const,
      };
    }),
  );

  const display = selected.filter(Boolean) as NonNullable<(typeof selected)[number]>[];
  const localMedia = new Map(getArtworks().map((work) => [work.id, getMediaById(work.primary_image_id ?? '')]));
  const localDisplay = EXHIBITION.all.map((id) => {
    const work = localArtworks.find((item) => item.id === id);
    const media = work ? localMedia.get(id) : null;
    const imageUrl = media?.storage_path || media?.url;
    if (!work || !imageUrl) return null;
    return {
      id: work.id,
      slug: work.slug,
      title: work.title_en,
      artist: sourceArtists.find((artist) => artist.id === work.artist_id)?.name_en ?? 'Unknown',
      year: work.year ?? 0,
      medium: work.medium_en ?? '',
      dimensions: work.dimensions ?? '',
      imageUrl,
      sceneRole: (EXHIBITION.heroes as readonly string[]).includes(id) ? 'hero' as const : 'secondary' as const,
    };
  }).filter(Boolean) as NonNullable<(typeof selected)[number]>[];
  const finalDisplay = display.length === EXHIBITION.all.length ? display : localDisplay;
  return <Museum3DPage artworks={finalDisplay} />;
}
