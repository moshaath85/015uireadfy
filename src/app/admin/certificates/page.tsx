import Link from "next/link";
import { AdminShell } from "@/components/admin";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { SearchBar } from "@/components/admin/SearchBar";
import { getCmsModuleCapability } from "@/lib/cms/capabilities/capability-registry";
import { artworksRepository } from "@/lib/repositories/artworks";
import { certificatesRepository } from "@/lib/repositories/certificates";
import type { Artwork, Certificate } from "@/types";

interface AdminCertificatesPageProps {
  readonly searchParams?: Promise<{
    readonly q?: string;
  }>;
}

function formatValue(value?: string | number | null): string {
  return value === undefined || value === null || value === "" ? "Not configured" : String(value);
}

function formatStatus(value: string): string {
  return value
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function artworkLabel(artworkId: string, artworks: readonly Artwork[]): string {
  const artwork = artworks.find((item) => item.id === artworkId);

  return artwork ? `${artwork.title_en} (${artwork.year})` : artworkId;
}

function normalize(value?: string | number | null): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim().toLowerCase();
}

function includesSearch(certificate: Certificate, artworks: readonly Artwork[], query: string): boolean {
  if (!query) {
    return true;
  }

  const artworkTitle = artworkLabel(certificate.artwork_id, artworks);

  return [
    certificate.id,
    certificate.certificate_number,
    certificate.template_id,
    certificate.artwork_id,
    artworkTitle,
    certificate.status,
    certificate.issued_date,
    certificate.verification_url,
  ].some((value) => normalize(value).includes(query));
}

function createCertificateColumns(artworks: readonly Artwork[]): readonly DataTableColumn<Certificate>[] {
  return [
  {
    key: "certificate_number",
    header: "Certificate",
    render: (certificate) => (
      <div>
        <strong>{certificate.certificate_number}</strong>
        <br />
        <span>{formatValue(certificate.template_id)}</span>
      </div>
    ),
  },
  {
    key: "artwork_id",
    header: "Artwork",
    render: (certificate) => artworkLabel(certificate.artwork_id, artworks),
  },
  {
    key: "issued_date",
    header: "Issued date",
    render: (certificate) => formatValue(certificate.issued_date),
  },
  {
    key: "verification_url",
    header: "Verification",
    render: (certificate) => formatValue(certificate.verification_url),
  },
  {
    key: "status",
    header: "Status",
    render: (certificate) => (
      <span className="admin-status-badge">
        <span className="admin-status-badge__label">{formatStatus(certificate.status)}</span>
      </span>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    render: (certificate) => (
      <Link className="admin-inline-link" href={`/admin/certificates/${certificate.id}/edit`}>
        Edit
      </Link>
    ),
  },
];
}

export default async function AdminCertificatesPage({ searchParams }: AdminCertificatesPageProps) {
  const resolvedSearchParams = await searchParams;
  const capability = getCmsModuleCapability("certificates");
  const query = normalize(resolvedSearchParams?.q);
  const [certificates, artworks] = await Promise.all([
    certificatesRepository.getAll(),
    artworksRepository.getAll(),
  ]);
  const filteredCertificates = certificates.filter((certificate) => includesSearch(certificate, artworks, query));
  const certificateColumns = createCertificateColumns(artworks);

  return (
    <AdminShell
      title="Certificates"
      description={capability.messaging.listDescription}
    >
      <PageToolbar
        title="Certificates"
        capability={capability}
        description={capability.messaging.listDescription}
        search={<SearchBar label="Search certificates" placeholder="Search certificate records" defaultValue={resolvedSearchParams?.q ?? ""} queryParam="q" />}
        action={
          <Link className="admin-button admin-button--primary" href="/admin/certificates/new">
            Create Certificate
          </Link>
        }
      />
      <DataTable
        caption="Certificates"
        columns={certificateColumns}
        rows={filteredCertificates}
        getRowKey={(certificate) => certificate.id}
        emptyTitle="No certificate records are currently available."
        emptyDescription={query ? "No certificate records match the current search query." : "Certificate records will appear here when available."}
      />
    </AdminShell>
  );
}
