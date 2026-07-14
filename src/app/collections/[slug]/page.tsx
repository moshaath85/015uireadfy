import { notFound } from 'next/navigation';
import { EditorialDetail, EditorialRelated } from '@/components/public/EditorialExperience';
import { collectionsRepository } from '@/lib/repositories/collections';
import { artworksRepository } from '@/lib/repositories/artworks';
import { mediaRepository } from '@/lib/repositories/media';

interface Props { params: { slug: string } }
export const dynamic = 'force-dynamic';

export default async function CollectionDetailPage({ params }: Props) {
  const collection = (await collectionsRepository.getPublicAll()).find((item) => item.slug === params.slug);
  if (!collection) notFound();
  const cover = collection.cover_media_id ? await mediaRepository.getById(collection.cover_media_id) : null;
  const works = (await artworksRepository.getPublicAll()).filter((work) => work.collection_id === collection.id).slice(0, 8);
  const related = await Promise.all(works.map(async (work) => {
    const media = await mediaRepository.getArtworkPrimaryMedia(work);
    return { href: `/artworks/${work.slug}`, title: work.title_en, meta: `${work.year} · ${work.medium_en}`, image: media ? { src: media.url, alt: media.alt_en || work.title_en } : null };
  }));
  return <EditorialDetail eyebrow="Collection" title={collection.title_en} subtitle={collection.title_ar} image={cover ? { src: cover.url, alt: cover.alt_en || collection.title_en } : null} body={collection.description_en} backHref="/collections" backLabel="All collections" ctaTitle="Discuss this collection"><EditorialRelated eyebrow="In this collection" title="Selected works" items={related} /></EditorialDetail>;
}
