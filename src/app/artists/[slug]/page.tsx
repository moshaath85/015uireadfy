import { notFound } from 'next/navigation';
import { EditorialDetail, EditorialRelated } from '@/components/public/EditorialExperience';
import { artistsRepository } from '@/lib/repositories/artists';
import { artworksRepository } from '@/lib/repositories/artworks';
import { mediaRepository } from '@/lib/repositories/media';

interface Props { params: { slug: string } }
export const dynamic = 'force-dynamic';

export default async function ArtistDetailPage({ params }: Props) {
  const artist = await artistsRepository.getPublicBySlug(params.slug);
  if (!artist) notFound();

  const profile = await mediaRepository.getArtistProfileMedia(artist);
  const works = (await artworksRepository.getPublicAll()).filter((work) => work.artist_id === artist.id).slice(0, 6);
  const related = await Promise.all(works.map(async (work) => {
    const media = await mediaRepository.getArtworkPrimaryMedia(work);
    return { href: `/artworks/${work.slug}`, title: work.title_en, meta: `${work.year} · ${work.medium_en}`, image: media ? { src: media.url, alt: media.alt_en || work.title_en } : null };
  }));

  return (
    <EditorialDetail eyebrow="Artist" title={artist.name_en} subtitle={artist.name_ar} image={profile ? { src: profile.url, alt: profile.alt_en || artist.name_en } : null}
      facts={[{ label: 'Nationality', value: artist.nationality_en }, { label: 'Born', value: artist.birth_year }, { label: 'Representation', value: artist.representation_status?.replaceAll('_', ' ') }, { label: 'Instagram', value: artist.instagram }]}
      body={artist.bio_en} backHref="/artists" backLabel="All artists" ctaTitle={`Enquire about ${artist.name_en}`}>
      <EditorialRelated eyebrow="Selected works" title={`Works by ${artist.name_en}`} items={related} />
    </EditorialDetail>
  );
}
