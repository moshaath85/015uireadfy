import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { EditorialDetail, EditorialRelated, type EditorialIndexItem } from '@/components/public/EditorialExperience';
import { mediaRepository } from '@/lib/repositories/media';
import { newsRepository } from '@/lib/repositories/news';
import { SITE } from '@/lib/metadata';

interface Props { params: Promise<{ slug: string }> }
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = (await newsRepository.getPublicAll()).find(c => c.slug === slug);
  if (!item) return { title: 'Article Not Found' };
  const desc = (item.excerpt_en ?? '').slice(0, 155).replace(/\n/g, ' ') || '015 Journal article.';
  return { title: `${item.title_en} | ${SITE.name}`, description: desc };
}

const fullDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

function formatCategory(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function readingTime(body: string): string {
  const words = body.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = (await newsRepository.getPublicAll()).find((candidate) => candidate.slug === slug);
  if (!item) notFound();

  const image = item.image_id ? await mediaRepository.getPublicById(item.image_id) : null;
  const allNews = await newsRepository.getPublicAll();
  const related: EditorialIndexItem[] = await Promise.all(
    allNews
      .filter((candidate) => candidate.id !== item.id)
      .slice(0, 3)
      .map(async (candidate) => {
        const relatedImage = candidate.image_id ? await mediaRepository.getPublicById(candidate.image_id) : null;
        return {
          href: `/news/${candidate.slug}`,
          title: candidate.title_en,
          meta: fullDate(candidate.publish_date),
          image: relatedImage ? { src: relatedImage.url, alt: relatedImage.alt_en || candidate.title_en } : null,
        };
      }),
  );

  return (
    <EditorialDetail
      eyebrow={formatCategory(item.category)}
      title={item.title_en}
      subtitle={item.title_ar}
      image={image ? { src: image.url, alt: image.alt_en || item.title_en } : null}
      facts={[
        { label: 'Published', value: fullDate(item.publish_date) },
        { label: 'Category', value: formatCategory(item.category) },
        { label: 'Reading time', value: readingTime(item.content_en || item.excerpt_en) },
      ]}
      body={item.content_en || item.excerpt_en}
      backHref="/news"
      backLabel="All journal"
      ctaTitle="Contact the gallery"
    >
      <EditorialRelated
        eyebrow="Further reading"
        title="Related articles"
        items={related}
      />
    </EditorialDetail>
  );
}
