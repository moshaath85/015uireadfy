import { EditorialIndex, type EditorialIndexItem } from '@/components/public/EditorialExperience';
import { mediaRepository } from '@/lib/repositories/media';
import { newsRepository } from '@/lib/repositories/news';

export const dynamic = 'force-dynamic';

const monthYear = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(date);
};

function formatCategory(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default async function NewsPage() {
  const allNews = await newsRepository.getPublicAll();

  const sortedNews = [...allNews].sort(
    (a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime(),
  );

  const items: EditorialIndexItem[] = await Promise.all(
    sortedNews.map(async (item) => {
        const image = item.image_id ? await mediaRepository.getPublicById(item.image_id) : null;
        return {
          href: `/news/${item.slug}`,
          title: item.title_en,
          kicker: formatCategory(item.category),
          meta: monthYear(item.publish_date),
          description: item.excerpt_en,
          image: image ? { src: image.url, alt: image.alt_en || item.title_en } : null,
        };
      }),
  );

  return (
    <EditorialIndex
      eyebrow="015 Journal"
      title="Journal"
      introduction="Essays, criticism, interviews, and gallery notes on the Saudi and regional art scene."
      items={items}
    />
  );
}
