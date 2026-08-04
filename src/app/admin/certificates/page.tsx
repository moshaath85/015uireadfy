import Link from "next/link";
import { revalidatePath } from "next/cache";
import { AdminShell } from "@/components/admin";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { SearchBar } from "@/components/admin/SearchBar";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getCmsModuleCapability } from "@/lib/cms/capabilities/capability-registry";
import { archiveCertificateRecord } from "@/lib/cms/production-prisma";
import { artworksRepository } from "@/lib/repositories/artworks";
import { certificatesRepository } from "@/lib/repositories/certificates";
import type { Artwork, Certificate } from "@/types";

interface AdminCertificatesPageProps {
  readonly searchParams?: Promise<{
    readonly q?: string;
    readonly view?: string;
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

async function revokeCertificateAction(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("certificateId") ?? "").trim();
  const adminContext = await requireAdminServerAction("certificates.update");
  if (!id) return;
  await archiveCertificateRecord(id, { organizationId: adminContext.organizationId });
  revalidatePath("/verify");
  revalidatePath("/admin/certificates");
}

function createCertificateColumns(artworks: readonly Artwork[], mode: "active" | "revoked"): readonly DataTableColumn<Certificate>[] {
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
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <Link className="admin-inline-link" href={`/admin/certificates/${certificate.id}/edit`}>
          Edit
        </Link>
        {mode === "active" && certificate.status !== "revoked" ? (
          <form action={revokeCertificateAction}>
            <input type="hidden" name="certificateId" value={certificate.id} />
            <button type="submit">Revoke</button>
          </form>
        ) : null}
      </div>
    ),
  },
];
}

export default async function AdminCertificatesPage({ searchParams }: AdminCertificatesPageProps) {
  const resolvedSearchParams = await searchParams;
  const capability = getCmsModuleCapability("certificates");
  const query = normalize(resolvedSearchParams?.q);
  const viewingRevoked = resolvedSearchParams?.view === "revoked";
  const [certificates, artworks] = await Promise.all([
    viewingRevoked ? certificatesRepository.getRevoked() : certificatesRepository.getAll(),
    artworksRepository.getAll(),
  ]);
  const filteredCertificates = certificates.filter((certificate) => includesSearch(certificate, artworks, query));
  const certificateColumns = createCertificateColumns(artworks, viewingRevoked ? "revoked" : "active");

  return (
    <AdminShell
      title="Certificates"
      description={capability.messaging.listDescription}
    >
      <PageToolbar
        title={viewingRevoked ? "Certificates — Revoked" : "Certificates"}
        capability={capability}
        description={viewingRevoked
          ? "Certificates that have been revoked. Revoking is a one-way action: revoked certificates are not reissued from here."
          : capability.messaging.listDescription}
        search={<SearchBar label="Search certificates" placeholder="Search certificate records" defaultValue={resolvedSearchParams?.q ?? ""} queryParam="q" />}
        action={
          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <Link className="admin-inline-link" href={viewingRevoked ? "/admin/certificates" : "/admin/certificates?view=revoked"}>
              {viewingRevoked ? "Back to active certificates" : "View revoked"}
            </Link>
            {!viewingRevoked ? (
              <Link className="admin-button admin-button--primary" href="/admin/certificates/new">
                Create Certificate
              </Link>
            ) : null}
          </div>
        }
      />
      <DataTable
        caption={viewingRevoked ? "Revoked certificates" : "Certificates"}
        columns={certificateColumns}
        rows={filteredCertificates}
        getRowKey={(certificate) => certificate.id}
        emptyTitle={viewingRevoked ? "No certificates are currently revoked." : "No certificate records are currently available."}
        emptyDescription={query
          ? "No certificate records match the current search query."
          : viewingRevoked
            ? "Revoked certificates will appear here."
            : "Certificate records will appear here when available."}
      />
    </AdminShell>
  );
}
