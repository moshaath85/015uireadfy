import type { Metadata } from "next";
import PageContainer, {
  PublicBreadcrumbs,
  PublicCard,
  PublicGrid,
  PublicHero,
  PublicMetadataSection,
  PublicRelatedSection,
} from "@/components/public/PageContainer";
import { mediaRepository } from "@/lib/repositories/media";
import { newsRepository } from "@/lib/repositories/news";
import type { News } from "@/types";

type NewsWithMetadata = News & {
  seo_title_en?: string;
  seo_description_en?: string;
  scheduled_at?: string | null;
  related_news_ids?: string[];
};

export const metadata: Metadata = {
  title: "News | Gallery 015",
  description: "Announcements, gallery notes, and institutional updates from Gallery 015.",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function getPublishTime(item: NewsWithMetadata): number {
  return new Date(`${item.scheduled_at ?? item.publish_date}T00:00:00.000Z`).getTime();
}

async function getPublishedNews(): Promise<NewsWithMetadata[]> {
  const today = Date.now();

  return ((await newsRepository.getAll()) as NewsWithMetadata[])
    .filter((item) => item.visibility_status === "public")
    .filter((item) => getPublishTime(item) <= today)
    .sort((a, b) => getPublishTime(b) - getPublishTime(a));
}

async function getNewsImage(item: NewsWithMetadata) {
  if (!item.image_id) {
    return null;
  }

  const media = await mediaRepository.getById(item.image_id);

  if (!media) {
    return null;
  }

  return {
    src: media.url,
    alt: media.alt_en,
  };
}

function getRelatedNews(item: NewsWithMetadata, allNews: NewsWithMetadata[]) {
  const explicitRelated = item.related_news_ids
    ?.map((relatedId) => allNews.find((candidate) => candidate.id === relatedId))
    .filter((candidate): candidate is NewsWithMetadata => Boolean(candidate));

  if (explicitRelated && explicitRelated.length > 0) {
    return explicitRelated;
  }

  return allNews.filter((candidate) => candidate.id !== item.id && candidate.category === item.category).slice(0, 3);
}

export default async function NewsPage() {
  const news = await getPublishedNews();
  const featuredNews = news[0];
  const relatedNews = featuredNews ? getRelatedNews(featuredNews, news) : [];
  const newsCards = await Promise.all(
    news.map(async (item) => ({
      item,
      image: await getNewsImage(item),
    })),
  );

  return (
    <PageContainer>
      <PublicBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "News" },
        ]}
      />
      <PublicHero
        eyebrow="Gallery 015"
        title="News"
        subtitle="Announcements, gallery notes, and institutional updates from the programme."
        image={featuredNews ? await getNewsImage(featuredNews) : null}
      />
      {featuredNews ? (
        <PublicMetadataSection
          items={[
            { label: "Category", value: formatLabel(featuredNews.category) },
            { label: "Published", value: formatDate(featuredNews.publish_date) },
            { label: "Status", value: "Published" },
            { label: "SEO title", value: featuredNews.seo_title_en ?? featuredNews.title_en },
            { label: "SEO description", value: featuredNews.seo_description_en ?? featuredNews.excerpt_en },
          ]}
        />
      ) : null}
      <PublicGrid>
        {newsCards.map(({ item, image }) => (
          <PublicCard
            key={item.id}
            title={item.title_en}
            subtitle={item.excerpt_en}
            meta={`${formatLabel(item.category)} · ${formatDate(item.publish_date)}`}
            href={`/news#${item.slug}`}
            image={image}
            variant="news"
          />
        ))}
      </PublicGrid>
      <PublicRelatedSection
        title="Related news"
        items={relatedNews.map((item) => ({
          title: item.title_en,
          href: `/news#${item.slug}`,
          meta: formatDate(item.publish_date),
        }))}
      />
    </PageContainer>
  );
}