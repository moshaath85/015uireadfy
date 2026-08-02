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
import { getServerLanguage } from "@/lib/i18n/server-language";
import type { Language } from "@/lib/i18n/language";
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

const T = {
  home: { ar: "الرئيسية", en: "Home" },
  services: { ar: "الخدمات", en: "Services" },
  eyebrow: { ar: "غاليري ٠١٥", en: "Gallery 015" },
  title: { ar: "الخدمات", en: "Services" },
  subtitle: { ar: "خدمات استشارية وتكليف وجمع تقدم من خلال الغاليري.", en: "Advisory, commissioning, and collection services offered through the gallery." },
  category: { ar: "الفئة", en: "Category" },
  ordering: { ar: "الترتيب", en: "Ordering" },
  cta: { ar: "الدعوة للإجراء", en: "CTA" },
  seo_title_label: { ar: "عنوان SEO", en: "SEO title" },
  seo_desc_label: { ar: "وصف SEO", en: "SEO description" },
  cta_description: { ar: "تواصل مع فريق الغاليري لترتيب استشارة خدمية.", en: "Contact the gallery team to arrange a service consultation." },
  pricing_on_request: { ar: "التسعير عند الطلب", en: "Pricing on request" },
  related_services: { ar: "خدمات ذات صلة", en: "Related services" },
};

function t(key: keyof typeof T, lang: Language): string { return lang === "ar" ? T[key].ar : T[key].en; }

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

function formatPriceInfo(value: Record<string, unknown> | undefined, lang: Language): string {
  if (!value) {
    return t("pricing_on_request", lang);
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
  const lang = await getServerLanguage();
  const ar = lang === "ar";
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
          { label: t("home", lang), href: "/" },
          { label: t("services", lang) },
        ]}
      />
      <PublicHero
        eyebrow={t("eyebrow", lang)}
        title={t("title", lang)}
        subtitle={t("subtitle", lang)}
        image={featuredService ? await getServiceImage(featuredService) : null}
      />
      {featuredService ? (
        <>
          <PublicMetadataSection
            items={[
              { label: t("category", lang), value: formatLabel(getServiceCategory(featuredService)) },
              { label: t("ordering", lang), value: featuredService.display_order ?? "Default" },
              { label: t("cta", lang), value: featuredService.cta_label_en ?? "Contact the gallery" },
              { label: t("seo_title_label", lang), value: featuredService.seo_title_en ?? featuredService.title_en },
              { label: t("seo_desc_label", lang), value: featuredService.seo_description_en ?? featuredService.description_en },
            ]}
          />
          <PublicCTASection
            title={featuredService.cta_label_en ?? "Discuss this service"}
            description={t("cta_description", lang)}
            href={featuredService.cta_href ?? "/contact"}
            label={featuredService.cta_label_en ?? "Contact Gallery 015"}
          />
        </>
      ) : null}
      <PublicGrid>
        {serviceCards.map(({ service, image }) => (
          <PublicCard
            key={service.id}
            title={ar && service.title_ar ? service.title_ar : service.title_en}
            subtitle={
              <>
                {ar && service.description_ar ? service.description_ar : service.description_en}
                {ar && service.features_ar && service.features_ar.length > 0 ? (
                  <>
                    <br />
                    {service.features_ar.slice(0, 3).join(" · ")}
                  </>
                ) : service.features_en.length > 0 ? (
                  <>
                    <br />
                    {service.features_en.slice(0, 3).join(" · ")}
                  </>
                ) : null}
              </>
            }
            meta={`${formatLabel(getServiceCategory(service))} · ${formatPriceInfo(service.price_info, lang)}`}
            href={`/services#${service.slug}`}
            image={image}
            variant="service"
          />
        ))}
      </PublicGrid>
      <PublicRelatedSection
        title={t("related_services", lang)}
        items={relatedServices.map((service) => ({
          title: ar && service.title_ar ? service.title_ar : service.title_en,
          href: `/services#${service.slug}`,
          meta: formatLabel(getServiceCategory(service)),
        }))}
      />
    </PageContainer>
  );
}
