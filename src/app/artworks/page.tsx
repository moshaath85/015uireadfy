import ArtworkExplorer, { type ExplorerFacets, type ExplorerWork } from '@/components/public/ArtworkExplorer';
import { artistsRepository } from '@/lib/repositories/artists';
import { artworksRepository } from '@/lib/repositories/artworks';
import { mediaRepository } from '@/lib/repositories/media';
import { getServerLanguage, getText } from '@/lib/i18n/server-language';
import type { Language } from '@/lib/i18n/language';
import type { Metadata } from 'next';
import { BreadcrumbListLd } from '@/lib/jsonld';

const T = {
  eyebrow: { ar: 'أعمال مختارة', en: 'Selected works' },
  title: { ar: 'الأعمال', en: 'Artworks' },
  introduction: {
    ar: 'أرشيف الأعمال المتاحة عبر غاليري ٠١٥. ابحث بالفنان أو الوسيط أو السنة.',
    en: 'The archive of works held by Gallery 015. Search the collection, or narrow it by artist, medium, or year.',
  },
  search: { ar: 'بحث', en: 'Search' },
  searchPlaceholder: { ar: 'عنوان، فنان، وسيط…', en: 'Title, artist, medium…' },
  artist: { ar: 'الفنان', en: 'Artist' },
  medium: { ar: 'الوسيط', en: 'Medium' },
  year: { ar: 'السنة', en: 'Year' },
  all: { ar: 'الكل', en: 'All' },
  clear: { ar: 'إعادة ضبط', en: 'Clear filters' },
  loadMore: { ar: 'عرض المزيد', en: 'Load more' },
  showing: { ar: 'معروض', en: 'Showing' },
  works: { ar: 'عمل', en: 'works' },
  emptyTitle: { ar: 'لا توجد أعمال مطابقة', en: 'No works match this search' },
  emptyBody: {
    ar: 'الأرشيف كامل، لكن هذا المزيج من المرشحات لا يطابق أي عمل. أعد الضبط للعودة إلى المجموعة كاملة.',
    en: 'The archive is complete, but nothing in it answers this combination. Clear the filters to return to the full collection.',
  },
  filters: { ar: 'تصفية الأعمال', en: 'Filter the archive' },
  undated: { ar: 'غير مؤرخ', en: 'Undated' },
  unrecorded: { ar: 'غير مسجّل', en: 'Unrecorded' },
};

/** The bucket for works whose year or medium the archive has not recorded.
    It is a fact about the catalogue, not a value invented for one. */
const UNRECORDED = '__unrecorded__';

function t(key: keyof typeof T, lang: Language): string {
  return lang === 'ar' ? T[key].ar : T[key].en;
}

export const metadata: Metadata = {
  title: 'Artworks | Gallery 015',
  description: 'The archive of contemporary and modern works held by Gallery 015 in Riyadh — searchable by artist, medium, and year.',
};

export const dynamic = 'force-dynamic';

/** "Oil on canvas" and "Oil on Canvas" are the same medium; "-" is not one. */
function mediumKey(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '-') return '';
  return trimmed.toLowerCase();
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function ArtworksPage() {
  const lang = await getServerLanguage();
  const [artworks, artists, allMedia] = await Promise.all([
    artworksRepository.getPublicAll(),
    artistsRepository.getPublicAll(),
    mediaRepository.getPublicAll(),
  ]);

  const mediaById = new Map(allMedia.map((item) => [item.id, item]));
  const artistById = new Map(artists.map((artist) => [artist.id, artist]));

  const works: ExplorerWork[] = artworks.map((artwork) => {
    const media = artwork.primary_image_id ? mediaById.get(artwork.primary_image_id) ?? null : null;
    const artist = artistById.get(artwork.artist_id) ?? null;
    const artistName = artist ? getText(artist.name_ar, artist.name_en, lang) : '';
    const title = getText(artwork.title_ar, artwork.title_en, lang);
    /* Six works carry "-" where the medium should be. That is the archive
       saying "not recorded", so it is filterable — but it is not a caption. */
    const rawMedium = getText(artwork.medium_ar, artwork.medium_en, lang).trim();
    const medium = rawMedium === '-' ? '' : rawMedium;
    const year = Number(artwork.year) > 0 ? Number(artwork.year) : 0;

    return {
      id: artwork.id,
      href: `/artworks/${artwork.slug}`,
      title,
      kicker: artwork.availability_status?.replaceAll('_', ' '),
      meta: [artistName, year || null, medium].filter(Boolean).join(' · '),
      description: getText(artwork.description_ar, artwork.description_en, lang),
      image: media ? { src: media.url, alt: getText(media.alt_ar, media.alt_en, lang) || title } : null,
      artistId: artwork.artist_id,
      mediumKey: mediumKey(artwork.medium_en) || UNRECORDED,
      mediumLabel: medium,
      year,
      /* Pre-lowered on the server so 268 filter passes per keystroke stay
         cheap on a phone. Both languages are always searchable, whichever
         one the interface is in. */
      haystack: [
        artwork.title_en, artwork.title_ar,
        artist?.name_en, artist?.name_ar,
        artwork.medium_en, artwork.medium_ar,
        artwork.dimensions,
        year || '',
      ].filter(Boolean).join(' ').toLowerCase(),
    };
  });

  /* A facet is only offered when it can actually divide the archive.
     Availability is 265 "not for sale" against 3 others, and every public
     work has a null collection with no public collection to belong to, so
     neither is a filter — it is a control that does nothing. */
  const countBy = <T,>(list: T[], key: (item: T) => string | null) => {
    const map = new Map<string, number>();
    list.forEach((item) => {
      const value = key(item);
      if (!value) return;
      map.set(value, (map.get(value) ?? 0) + 1);
    });
    return map;
  };

  const artistCounts = countBy(works, (work) => work.artistId);
  const mediumCounts = countBy(works, (work) => work.mediumKey);
  const yearCounts = countBy(works, (work) => (work.year ? String(work.year) : UNRECORDED));

  const facets: ExplorerFacets = {
    artists: Array.from(artistCounts.entries())
      .map(([id, count]) => {
        const artist = artistById.get(id);
        return { id, label: artist ? getText(artist.name_ar, artist.name_en, lang) : id, count };
      })
      .sort((a, b) => a.label.localeCompare(b.label, lang === 'ar' ? 'ar' : 'en')),
    mediums: Array.from(mediumCounts.entries())
      .map(([key, count]) => ({
        key,
        label: key === UNRECORDED
          ? t('unrecorded', lang)
          : titleCase(works.find((work) => work.mediumKey === key)?.mediumLabel ?? key),
        count,
      }))
      /* the unrecorded bucket is a real part of the archive, but it is not a
         medium, so it sorts last rather than by size */
      .sort((a, b) => Number(a.key === UNRECORDED) - Number(b.key === UNRECORDED)
        || b.count - a.count
        || a.label.localeCompare(b.label)),
    /* 233 of the 265 public works are dated 2020 and 32 carry no date at all,
       so a list of years alone would be a control with one option. "Undated"
       is the distinction that actually exists in the data — and the moment a
       second year is catalogued it appears here on its own. */
    years: Array.from(yearCounts.entries())
      .map(([year, count]) => ({
        year: year === UNRECORDED ? 0 : Number(year),
        label: year === UNRECORDED ? t('undated', lang) : year,
        count,
      }))
      .sort((a, b) => b.year - a.year),
  };

  return (
    <>
      <BreadcrumbListLd items={[{ name: 'Gallery 015', url: 'https://gallery015.com' }, { name: 'Artworks', url: 'https://gallery015.com/artworks' }]} />
      <ArtworkExplorer
        eyebrow={t('eyebrow', lang)}
        title={t('title', lang)}
        introduction={t('introduction', lang)}
        works={works}
        facets={facets}
        labels={{
          search: t('search', lang),
          searchPlaceholder: t('searchPlaceholder', lang),
          artist: t('artist', lang),
          medium: t('medium', lang),
          year: t('year', lang),
          all: t('all', lang),
          clear: t('clear', lang),
          loadMore: t('loadMore', lang),
          showing: t('showing', lang),
          works: t('works', lang),
          emptyTitle: t('emptyTitle', lang),
          emptyBody: t('emptyBody', lang),
          filters: t('filters', lang),
        }}
      />
    </>
  );
}
