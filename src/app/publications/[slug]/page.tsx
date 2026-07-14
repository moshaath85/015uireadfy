import { notFound } from "next/navigation";
import PageContainer, {
  PublicBreadcrumbs,
  PublicCTASection,
  PublicHero,
  PublicMetadataSection,
  PublicRichContentSection,
} from "@/components/public/PageContainer";
import { mediaRepository } from "@/lib/repositories/media";
import { publicationsRepository } from "@/lib/repositories/publications";

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

export default async function PublicationDetailPage({ params }: Props) {
  const publication = (await publicationsRepository.getPublicAll()).find((item) => item.slug === params.slug);

  if (!publication) {
    notFound();
  }

  const cover = publication.cover_image_id ? await mediaRepository.getById(publication.cover_image_id) : null;

  return (
    <PageContainer>
      <PublicBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Publications", href: "/publications" },
          { label: publication.title_en },
        ]}
      />
      <PublicHero
        eyebrow="Publication"
        title={publication.title_en}
        subtitle={publication.title_ar}
        image={cover ? { src: cover.url, alt: cover.alt_en || publication.title_en } : null}
      />
      <PublicMetadataSection
        items={[
          { label: "Type", value: formatLabel(publication.type) },
          { label: "Published", value: formatDate(publication.publish_date) },
        ]}
      />
      <PublicRichContentSection title="Publication note" body={publication.description_en} />
      {publication.file_url ? (
        <PublicCTASection title="Publication file" href={publication.file_url} label="Open publication" />
      ) : (
        <PublicCTASection title="Return to publications" href="/publications" label="View all publications" />
      )}
    </PageContainer>
  );
}
