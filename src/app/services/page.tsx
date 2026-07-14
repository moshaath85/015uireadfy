import type { Metadata } from "next";
import PageContainer, {
  PublicBreadcrumbs,
  PublicCTASection,
  PublicCard,
  PublicGrid,
  PublicHero,
  PublicMetadataSection,
  PublicRelatedSection,
} from "@/components/public/PageContainer";
import { mediaRepository } from "@/lib/repositories/media";
import { servicesRepository } from "@/lib/repositories/services";
import type { Service } from "@/types";

type ServiceWithMetadata = Service & {
  category?: string;
  display_order?: number;
  hero_media_id?: string | null;
  cta_label_en?: string;
  cta_href?: string;
  seo_title_en?: string;
  seo_description_en?: string;
  related_service_ids?: string[];
};

export const metadata: Metadata = {
  title: "Services | Gallery 015",
  description: "Advisory, commissioning, and collection services offered through Gallery 015.",
};

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function formatPriceInfo(value: Record<string, unknown> | undefined): string {
  if (!value) {
    return "Pricing on request";
  }

  const type = typeof value.type === "string" ? value.type : "upon_request";

  return formatLabel(type);
}

async function getServices(): Promise<ServiceWithMetadata[]> {
  return ((await servicesRepository.getAll()) as ServiceWithMetadata[])
    .filter((service) => service.visibility_status === "public")
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0) || a.title_en.localeCompare(b.title_en));
}

async function getServiceImage(service: ServiceWithMetadata) {
  if (!service.hero_media_id) {
    return null;
  }

  const media = await mediaRepository.getById(service.hero_media_id);

  if (!media) {
    return null;
  }

  return {
    src: media.url,
    alt: media.alt_en,
  };
}

function getServiceCategory(service: ServiceWithMetadata): string {
  return service.category ?? "gallery_service";
}

function getRelatedServices(service: ServiceWithMetadata, allServices: ServiceWithMetadata[]) {
  const explicitRelated = service.related_service_ids
    ?.map((relatedId) => allServices.find((candidate) => candidate.id === relatedId))
    .filter((candidate): candidate is ServiceWithMetadata => Boolean(candidate));

  if (explicitRelated && explicitRelated.length > 0) {
    return explicitRelated;
  }

  return allServices
    .filter((candidate) => candidate.id !== service.id && getServiceCategory(candidate) === getServiceCategory(service))
    .slice(0, 3);
}

export default async function ServicesPage() {
  const services = await getServices();
  const featuredService = services[0];
  const relatedServices = featuredService ? getRelatedServices(featuredService, services) : [];
  const serviceCards = await Promise.all(
    services.map(async (service) => ({
      service,
      image: await getServiceImage(service),
    })),
  );

  return (
    <PageContainer>
      <PublicBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Services" },
        ]}
      />
      <PublicHero
        eyebrow="Gallery 015"
        title="Services"
        subtitle="Advisory, commissioning, and collection services offered through the gallery."
        image={featuredService ? await getServiceImage(featuredService) : null}
      />
      {featuredService ? (
        <>
          <PublicMetadataSection
            items={[
              { label: "Category", value: formatLabel(getServiceCategory(featuredService)) },
              { label: "Ordering", value: featuredService.display_order ?? "Default" },
              { label: "CTA", value: featuredService.cta_label_en ?? "Contact the gallery" },
              { label: "SEO title", value: featuredService.seo_title_en ?? featuredService.title_en },
              { label: "SEO description", value: featuredService.seo_description_en ?? featuredService.description_en },
            ]}
          />
          <PublicCTASection
            title={featuredService.cta_label_en ?? "Discuss this service"}
            description="Contact the gallery team to arrange a service consultation."
            href={featuredService.cta_href ?? "/contact"}
            label={featuredService.cta_label_en ?? "Contact Gallery 015"}
          />
        </>
      ) : null}
      <PublicGrid>
        {serviceCards.map(({ service, image }) => (
          <PublicCard
            key={service.id}
            title={service.title_en}
            subtitle={
              <>
                {service.description_en}
                {service.features_en.length > 0 ? (
                  <>
                    <br />
                    {service.features_en.slice(0, 3).join(" · ")}
                  </>
                ) : null}
              </>
            }
            meta={`${formatLabel(getServiceCategory(service))} · ${formatPriceInfo(service.price_info)}`}
            href={`/services#${service.slug}`}
            image={image}
            variant="service"
          />
        ))}
      </PublicGrid>
      <PublicRelatedSection
        title="Related services"
        items={relatedServices.map((service) => ({
          title: service.title_en,
          href: `/services#${service.slug}`,
          meta: formatLabel(getServiceCategory(service)),
        }))}
      />
    </PageContainer>
  );
}