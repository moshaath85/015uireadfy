import type { Metadata } from "next";
import PageContainer, {
  PublicBreadcrumbs,
  PublicCTASection,
  PublicCard,
  PublicGrid,
  PublicHero,
  PublicMetadataSection,
  PublicRelatedSection,
  PublicRichContentSection,
} from "@/components/public/PageContainer";
import { mediaRepository } from "@/lib/repositories/media";
import { publicationsRepository } from "@/lib/repositories/publications";
import type { Publication } from "@/types";

type PublicationWithMetadata = Publication & {
  category?: string;
  author_en?: string;
  content_en?: string;
  seo_title_en?: string;
  seo_description_en?: string;
  related_publication_ids?: string[];
};

export const metadata: Metadata = {
  title: "Publications | Gallery 015",
  description: "Catalogues, texts, and published references connected to the Gallery 015 programme.",
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

async function getPublications(): Promise<PublicationWithMetadata[]> {
  return ((await publicationsRepository.getAll()) as PublicationWithMetadata[])
    .filter((publication) => publication.visibility_status === "public")
    .sort(
      (a, b) =>
        new Date(`${b.publish_date}T00:00:00.000Z`).getTime() -
        new Date(`${a.publish_date}T00:00:00.000Z`).getTime(),
    );
}

async function getPublicationImage(publication: PublicationWithMetadata) {
  if (!publication.cover_image_id) {
    return null;
  }

  const media = await mediaRepository.getById(publication.cover_image_id);

  if (!media) {
    return null;
  }

  return {
    src: media.url,
    alt: media.alt_en,
  };
}

function getRelatedPublications(publication: PublicationWithMetadata, allPublications: PublicationWithMetadata[]) {
  const explicitRelated = publication.related_publication_ids
    ?.map((relatedId) => allPublications.find((candidate) => candidate.id === relatedId))
    .filter((candidate): candidate is PublicationWithMetadata => Boolean(candidate));

  if (explicitRelated && explicitRelated.length > 0) {
    return explicitRelated;
  }

  const category = publication.category ?? publication.type;

  return allPublications
    .filter((candidate) => candidate.id !== publication.id && (candidate.category ?? candidate.type) === category)
    .slice(0, 3);
}

export default async function PublicationsPage() {
  const publications = await getPublications();
  const featuredPublication = publications[0];
  const relatedPublications = featuredPublication ? getRelatedPublications(featuredPublication, publications) : [];
  const publicationCards = await Promise.all(
    publications.map(async (publication) => ({
      publication,
      image: await getPublicationImage(publication),
    })),
  );

  return (
    <PageContainer>
      <PublicBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Publications" },
        ]}
      />
      <PublicHero
        eyebrow="Gallery 015"
        title="Publications"
        subtitle="Catalogues, texts, and published references connected to the gallery programme."
        image={featuredPublication ? await getPublicationImage(featuredPublication) : null}
      />
      {featuredPublication ? (
        <>
          <PublicMetadataSection
            items={[
              { label: "Category", value: formatLabel(featuredPublication.category ?? featuredPublication.type) },
              { label: "Type", value: formatLabel(featuredPublication.type) },
              { label: "Author", value: featuredPublication.author_en ?? "Gallery 015" },
              { label: "Published", value: formatDate(featuredPublication.publish_date) },
              { label: "SEO title", value: featuredPublication.seo_title_en ?? featuredPublication.title_en },
              {
                label: "SEO description",
                value: featuredPublication.seo_description_en ?? featuredPublication.description_en,
              },
            ]}
          />
          <PublicRichContentSection
            title="Publication note"
            body={featuredPublication.content_en ?? featuredPublication.description_en}
          />
          {featuredPublication.file_url ? (
            <PublicCTASection
              title="Download attachment"
              description="Access the publication attachment provided for this entry."
              href={featuredPublication.file_url}
              label="Download publication"
            />
          ) : null}
        </>
      ) : null}
      <PublicGrid>
        {publicationCards.map(({ publication, image }) => (
          <PublicCard
            key={publication.id}
            title={publication.title_en}
            subtitle={publication.description_en}
            meta={`${formatLabel(publication.category ?? publication.type)} · ${formatDate(publication.publish_date)}`}
            href={publication.file_url || `/publications#${publication.slug}`}
            image={image}
            variant="publication"
          />
        ))}
      </PublicGrid>
      <PublicRelatedSection
        title="Related publications"
        items={relatedPublications.map((publication) => ({
          title: publication.title_en,
          href: publication.file_url || `/publications#${publication.slug}`,
          meta: formatLabel(publication.category ?? publication.type),
        }))}
      />
    </PageContainer>
  );
}