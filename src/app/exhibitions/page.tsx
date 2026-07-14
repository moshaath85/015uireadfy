import { EditorialIndex } from '@/components/public/EditorialExperience';
import { exhibitionsRepository } from '@/lib/repositories/exhibitions';
import { mediaRepository } from '@/lib/repositories/media';

export const dynamic = 'force-dynamic';

function dates(start: string, end: string) { return `${start} — ${end}`; }

export default async function ExhibitionsPage() {
  const exhibitions = await exhibitionsRepository.getPublicAll();
  const items = await Promise.all(exhibitions.map(async (exhibition) => {
    const media = exhibition.cover_media_id ? await mediaRepository.getById(exhibition.cover_media_id) : null;
    return { href: `/exhibitions/${exhibition.slug}`, title: exhibition.title_en, kicker: exhibition.venue_en, meta: dates(exhibition.start_date, exhibition.end_date), description: exhibition.description_en, image: media ? { src: media.url, alt: media.alt_en || exhibition.title_en } : null };
  }));
  return <EditorialIndex eyebrow="Programme" title="Exhibitions" introduction="Current, forthcoming, and archival exhibitions presented with clarity and context." items={items} />;
}
