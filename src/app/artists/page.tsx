import { ArtistRoster, type ArtistRosterItem } from '@/components/experience';
import { artistsRepository } from '@/lib/repositories/artists';
import { artworksRepository } from '@/lib/repositories/artworks';
import { mediaRepository } from '@/lib/repositories/media';
import { getServerLanguage, getText } from '@/lib/i18n/server-language';
import type { Language } from '@/lib/i18n/language';
import type { Artwork } from '@/types';
import type { Metadata } from 'next';
import { BreadcrumbListLd } from '@/lib/jsonld';

const T = {
  title: { ar: 'قائمة الفنانين', en: 'The roster' },
  intro_1: { ar: 'مجموعة منتقاة من الفنانين الذين يمثلهم غاليري ٠١٥.', en: 'A curated collective of artists represented by 015.' },
  intro_2: { ar: 'لكل صوت خصوصيته. ومعًا يصوغون رؤيتنا.', en: 'Each voice is distinct. Together, they shape our vision.' },
  viewArtist: { ar: 'عرض الفنان', en: 'View artist' },
  selectedWorks: { ar: 'أعمال مختارة لـ', en: 'Selected works by' },
  born: { ar: 'مواليد', en: 'Born' },
  exclusive: { ar: 'فنان حصري', en: 'Exclusive Artist' },
  collaborating: { ar: 'فنان متعاون', en: 'Collaborating Artist' },
};

function t(key: keyof typeof T, lang: Language): string {
  return lang === 'ar' ? T[key].ar : T[key].en;
}

export const metadata: Metadata = {
  title: 'Artists | Gallery 015',
  description: 'Browse the roster of artists represented by Gallery 015 — from the founding generation of Saudi modernism to contemporary and international voices.',
};

export const revalidate = 300;

/* Only returns a label where the relationship actually distinguishes an
   artist. Every artist on a gallery's roster is a gallery artist, so the
   generic case says nothing and repeats down the whole page. */
function representationLabel(status: string, lang: Language): string | null {
  switch (status.trim().toLowerCase()) {
    case 'represented':
    case 'exclusive':
      return t('exclusive', lang);
    case 'collaborating':
    case 'non_exclusive':
      return t('collaborating', lang);
    default:
      return null;
  }
}

function compareWorks(left: Artwork, right: Artwork): number {
  if (left.featured !== right.featured) return left.featured ? -1 : 1;
  return left.display_order - right.display_order;
}

export default async function ArtistsPage() {
  const lang = await getServerLanguage();
  const [artists, artworks, allMedia] = await Promise.all([
    artistsRepository.getPublicAll(),
    artworksRepository.getPublicAll(),
    mediaRepository.getPublicAll(),
  ]);

  /* Resolve every portrait and work image in memory instead of issuing one
     database query per artist per work. The old per-call lookups were ~300
     sequential queries, which blew past the Netlify serverless function
     timeout and rendered /artists empty on the live site. */
  const mediaById = new Map(allMedia.map((media) => [media.id, media]));
  const mediaFor = (id: string | null | undefined) => (id ? mediaById.get(id) ?? null : null);

  const items: ArtistRosterItem[] = artists.map((artist) => {
    const artistWorks = artworks
      .filter((work) => work.artist_id === artist.id)
      .sort(compareWorks)
      .slice(0, 4);
    const profileMedia = mediaFor(artist.profile_image_id);

    const workItems = artistWorks.map((work) => {
      const media = mediaFor(work.primary_image_id);
      const title = getText(work.title_ar, work.title_en, lang);
      return {
        id: work.slug,
        title,
        image: media ? { src: media.url, alt: getText(media.alt_ar, media.alt_en, lang) || title } : null,
      };
    });

    /* The roster read English names, biographies and nationalities on the
       Arabic page. That was always wrong; it became visible once the missing
       portraits started resolving to initials drawn from the name. */
    const name = getText(artist.name_ar, artist.name_en, lang);

    return {
      id: artist.id,
      slug: artist.slug,
      name,
      biography: getText(artist.bio_ar, artist.bio_en, lang),
      birthYear: artist.birth_year > 1900 ? artist.birth_year : null,
      nationality: getText(artist.nationality_ar, artist.nationality_en, lang),
      representationLabel: representationLabel(artist.representation_status, lang),
      profileImage: profileMedia ? { src: profileMedia.url, alt: getText(profileMedia.alt_ar, profileMedia.alt_en, lang) || name } : null,
      works: workItems,
    };
  });

  return (
    <>
      <BreadcrumbListLd items={[{ name: 'Gallery 015', url: 'https://gallery015.com' }, { name: 'Artists', url: 'https://gallery015.com/artists' }]} />
    <main className="artist-roster-page">
      <header className="artist-roster-hero">
        <h1>{t('title', lang)}</h1>
        <p>{t('intro_1', lang)}<br />{t('intro_2', lang)}</p>
      </header>
      <section className="artist-roster-section" aria-label={t('title', lang)}>
        <ArtistRoster
          artists={items}
          labels={{
            viewArtist: t('viewArtist', lang),
            selectedWorks: t('selectedWorks', lang),
            born: t('born', lang),
          }}
        />
      </section>
    </main>
    </>
  );
}
