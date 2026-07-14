import { EditorialIndex } from '@/components/public/EditorialExperience';
import { collectionsRepository } from '@/lib/repositories/collections';
import { mediaRepository } from '@/lib/repositories/media';

export const dynamic = 'force-dynamic';

export default async function CollectionsPage() {
  const collections = await collectionsRepository.getPublicAll();
  const items = await Promise.all(collections.map(async (collection) => {
    const media = collection.cover_media_id ? await mediaRepository.getById(collection.cover_media_id) : null;
    return { href: `/collections/${collection.slug}`, title: collection.title_en, kicker: 'Collection', description: collection.description_en, image: media ? { src: media.url, alt: media.alt_en || collection.title_en } : null };
  }));
  return <EditorialIndex eyebrow="Curated narratives" title="Collections" introduction="Works brought together through material, memory, place, and artistic dialogue." items={items} />;
}
