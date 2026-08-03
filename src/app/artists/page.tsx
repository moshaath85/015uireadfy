import { ArtistRoster, type ArtistRosterItem } from '@/components/experience';
import { artistsRepository } from '@/lib/repositories/artists';
import { artworksRepository } from '@/lib/repositories/artworks';
import { mediaRepository } from '@/lib/repositories/media';
import type { Artwork } from '@/types';
import type { Metadata } from 'next';
import { BreadcrumbListLd } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'Artists | Gallery 015',
  description: 'Browse the roster of artists represented by Gallery 015 — from the founding generation of Saudi modernism to contemporary and international voices.',
};

export const dynamic = 'force-dynamic';

/* Only returns a label where the relationship actually distinguishes an
   artist. Every artist on a gallery's roster is a gallery artist, so the
   generic case says nothing and repeats down the whole page. */
function representationLabel(status: string): string | null {
  switch (status.trim().toLowerCase()) {
    case 'represented':
    case 'exclusive':
      return 'Exclusive Artist';
    case 'collaborating':
    case 'non_exclusive':
      return 'Collaborating Artist';
    default:
      return null;
  }
}

function compareWorks(left: Artwork, right: Artwork): number {
  if (left.featured !== right.featured) return left.featured ? -1 : 1;
  return left.display_order - right.display_order;
}

export default async function ArtistsPage() {
  const [artists, artworks] = await Promise.all([
    artistsRepository.getPublicAll(),
    artworksRepository.getPublicAll(),
  ]);

  const items: ArtistRosterItem[] = await Promise.all(artists.map(async (artist) => {
    const artistWorks = artworks
      .filter((work) => work.artist_id === artist.id)
      .sort(compareWorks)
      .slice(0, 4);
    const [profileMedia, workItems] = await Promise.all([
      mediaRepository.getPublicArtistProfileMedia(artist),
      Promise.all(artistWorks.map(async (work) => {
        const media = await mediaRepository.getPublicArtworkPrimaryMedia(work);
        return {
          id: work.slug,
          title: work.title_en,
          image: media ? { src: media.url, alt: media.alt_en || work.title_en } : null,
        };
      })),
    ]);

    return {
      id: artist.id,
      slug: artist.slug,
      name: artist.name_en,
      biography: artist.bio_en,
      birthYear: artist.birth_year > 1900 ? artist.birth_year : null,
      nationality: artist.nationality_en,
      representationLabel: representationLabel(artist.representation_status),
      profileImage: profileMedia ? { src: profileMedia.url, alt: profileMedia.alt_en || artist.name_en } : null,
      works: workItems,
    };
  }));

  return (
    <>
      <BreadcrumbListLd items={[{ name: 'Gallery 015', url: 'https://gallery015.com' }, { name: 'Artists', url: 'https://gallery015.com/artists' }]} />
    <main className="artist-roster-page">
      <header className="artist-roster-hero">
        <h1>The roster</h1>
        <p>A curated collective of artists represented by 015.<br />Each voice is distinct. Together, they shape our vision.</p>
      </header>
      <section className="artist-roster-section" aria-label="Artists roster">
        <ArtistRoster artists={items} />
      </section>
    </main>
    </>
  );
}
