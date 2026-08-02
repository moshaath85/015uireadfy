import { EditorialIndex } from '@/components/public/EditorialExperience';
import { exhibitionsRepository } from '@/lib/repositories/exhibitions';
import { mediaRepository } from '@/lib/repositories/media';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Exhibitions | Gallery 015',
  description: 'Current, forthcoming, and archival exhibitions presented by Gallery 015 with clarity and context.',
};

export const dynamic = 'force-dynamic';

const longDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

// A record whose closing date is unknown stores end === start; show the opening date alone
// rather than implying a one-day run.
function dates(start: string, end: string) {
  if (!start) return '';
  if (!end || end === start) return longDate(start);
  return `${longDate(start)} — ${longDate(end)}`;
}

export default async function ExhibitionsPage() {
  const exhibitions = await exhibitionsRepository.getPublicAll();
  const items = await Promise.all(exhibitions.map(async (exhibition) => {
    const media = exhibition.cover_media_id ? await mediaRepository.getPublicById(exhibition.cover_media_id) : null;
    return { href: `/exhibitions/${exhibition.slug}`, title: exhibition.title_en, kicker: exhibition.venue_en, meta: dates(exhibition.start_date, exhibition.end_date), description: exhibition.description_en, image: media ? { src: media.url, alt: media.alt_en || exhibition.title_en } : null };
  }));
  return <EditorialIndex eyebrow="Programme" title="Exhibitions" introduction="Current, forthcoming, and archival exhibitions presented with clarity and context." items={items} variant="exhibitions" />;
}
