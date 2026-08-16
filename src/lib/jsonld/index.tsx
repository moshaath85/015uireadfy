import type { ReactNode } from "react";

export function JsonLd({ data }: { data: Record<string, unknown> }): ReactNode {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationLd(): ReactNode {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Gallery 015",
        alternateName: "غاليري ٠١٥",
        url: "https://gallery015.com",
        logo: "https://gallery015.com/brand/015-logo-black.svg",
        contactPoint: {
          "@type": "ContactPoint",
          email: "info@gallery015.com",
          contactType: "customer service",
          availableLanguage: ["English", "Arabic"],
        },
        address: {
          "@type": "PostalAddress",
          addressCountry: "SA",
          addressLocality: "Riyadh",
        },
      }}
    />
  );
}

export function ArtGalleryLd(): ReactNode {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ArtGallery",
        name: "Gallery 015",
        alternateName: "غاليري ٠١٥",
        url: "https://gallery015.com",
        address: {
          "@type": "PostalAddress",
          addressCountry: "SA",
          addressLocality: "Riyadh",
        },
      }}
    />
  );
}

export interface PersonLdProps {
  name: string;
  alternateName?: string;
  description?: string;
  birthDate?: string;
  nationality?: string;
  url: string;
  image?: string;
  sameAs?: string[];
}

export function PersonLd({
  name,
  alternateName,
  description,
  birthDate,
  nationality,
  url,
  image,
  sameAs,
}: PersonLdProps): ReactNode {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url,
  };
  if (alternateName) ld.alternateName = alternateName;
  if (description) ld.description = description;
  if (birthDate) ld.birthDate = birthDate;
  if (nationality) ld.nationality = nationality;
  if (image) ld.image = image;
  if (sameAs?.length) ld.sameAs = sameAs;
  return <JsonLd data={ld} />;
}

export interface VisualArtworkLdProps {
  name: string;
  alternateName?: string;
  description?: string;
  creatorName: string;
  creatorUrl: string;
  /** Omitted when the creation date is not recorded. */
  dateCreated?: string;
  artMedium?: string;
  image?: string;
  url: string;
  artform?: string;
}

export function VisualArtworkLd({
  name,
  alternateName,
  description,
  creatorName,
  creatorUrl,
  dateCreated,
  artMedium,
  image,
  url,
  artform,
}: VisualArtworkLdProps): ReactNode {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name,
    url,
    creator: {
      "@type": "Person",
      name: creatorName,
      url: creatorUrl,
    },
  };
  if (dateCreated) ld.dateCreated = dateCreated;
  if (alternateName) ld.alternateName = alternateName;
  if (description) ld.description = description;
  if (artMedium) ld.artMedium = artMedium;
  if (artform) ld.artform = artform;
  if (image) ld.image = image;
  return <JsonLd data={ld} />;
}

export interface ExhibitionEventLdProps {
  name: string;
  alternateName?: string;
  description?: string;
  startDate: string;
  endDate: string;
  locationName: string;
  url: string;
  image?: string;
}

export function ExhibitionEventLd({
  name,
  alternateName,
  description,
  startDate,
  endDate,
  locationName,
  url,
  image,
}: ExhibitionEventLdProps): ReactNode {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ExhibitionEvent",
    name,
    url,
    startDate,
    endDate,
    location: {
      "@type": "Place",
      name: locationName,
      address: {
        "@type": "PostalAddress",
        addressCountry: "SA",
        addressLocality: "Riyadh",
      },
    },
  };
  if (alternateName) ld.alternateName = alternateName;
  if (description) ld.description = description;
  if (image) ld.image = image;
  return <JsonLd data={ld} />;
}

export interface ArticleLdProps {
  headline: string;
  alternateName?: string;
  description?: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  image?: string;
  publisherName?: string;
}

export function ArticleLd({
  headline,
  alternateName,
  description,
  author,
  datePublished,
  dateModified,
  url,
  image,
  publisherName = "Gallery 015",
}: ArticleLdProps): ReactNode {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    url,
    author: {
      "@type": "Organization",
      name: author,
    },
    datePublished,
    publisher: {
      "@type": "Organization",
      name: publisherName,
    },
  };
  if (alternateName) ld.alternateName = alternateName;
  if (description) ld.description = description;
  if (dateModified) ld.dateModified = dateModified;
  if (image) ld.image = image;
  return <JsonLd data={ld} />;
}

export interface BreadcrumbLdProps {
  items: Array<{ name: string; url: string }>;
}

export function BreadcrumbListLd({ items }: BreadcrumbLdProps): ReactNode {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}
