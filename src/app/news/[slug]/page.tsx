import { notFound } from "next/navigation";
import PageContainer, {
  PublicBreadcrumbs,
  PublicCTASection,
  PublicHero,
  PublicMetadataSection,
  PublicRichContentSection,
} from "@/components/public/PageContainer";
import { mediaRepository } from "@/lib/repositories/media";
import { newsRepository } from "@/lib/repositories/news";

interface Props {
  params: { slug: string };
}

export const dynamic = "force-dynamic";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(`${value}T00:00:00.000Z`),
  );
}

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export default async function NewsDetailPage({ params }: Props) {
  const item = (await newsRepository.getPublicAll()).find((candidate) => candidate.slug === params.slug);

  if (!item) {
    notFound();
  }

  const image = item.image_id ? await mediaRepository.getById(item.image_id) : null;

  return (
    <PageContainer>
      <PublicBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "News", href: "/news" },
          { label: item.title_en },
        ]}
      />
      <PublicHero
        eyebrow={formatLabel(item.category)}
        title={item.title_en}
        subtitle={item.title_ar}
        image={image ? { src: image.url, alt: image.alt_en || item.title_en } : null}
      />
      <PublicMetadataSection
        items={[
          { label: "Published", value: formatDate(item.publish_date) },
          { label: "Category", value: formatLabel(item.category) },
        ]}
      />
      <PublicRichContentSection title="Story" body={item.content_en || item.excerpt_en} />
      <PublicCTASection title="Return to news" href="/news" label="View all news" />
    </PageContainer>
  );
}
