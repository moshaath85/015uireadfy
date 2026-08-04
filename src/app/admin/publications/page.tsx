import Link from "next/link";
import { revalidatePath } from "next/cache";
import { AdminShell } from "@/components/admin";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { SearchBar } from "@/components/admin/SearchBar";

import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { getCmsModuleCapability } from "@/lib/cms/capabilities/capability-registry";
import { archivePublicationRecord, listArchivedPublicationRecords, listPublicationRecords, unarchivePublicationRecord } from "@/lib/cms/production-prisma";
import type { Publication } from "@/types";

interface AdminPublicationsPageProps {
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

function normalize(value?: string | number | null): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim().toLowerCase();
}

function includesSearch(publication: Publication, query: string): boolean {
  if (!query) {
    return true;
  }

  return [
    publication.id,
    publication.title_en,
    publication.title_ar,
    publication.slug,
    publication.type,
    publication.file_url,
    publication.visibility_status,
    publication.publish_date,
  ].some((value) => normalize(value).includes(query));
}

async function archivePublicationAction(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("publicationId") ?? "").trim();
  const adminContext = await requireAdminServerAction("publications.update");
  if (!id) return;
  await archivePublicationRecord(id, { organizationId: adminContext.organizationId });
  revalidatePath("/publications");
  revalidatePath("/admin/publications");
}

async function restorePublicationAction(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("publicationId") ?? "").trim();
  const adminContext = await requireAdminServerAction("publications.update");
  if (!id) return;
  await unarchivePublicationRecord(id, { organizationId: adminContext.organizationId });
  revalidatePath("/publications");
  revalidatePath("/admin/publications");
}

function buildColumns(mode: "active" | "archived"): readonly DataTableColumn<Publication>[] {
  return [
    {
      key: "title",
      header: "Publication",
      render: (publication) => (
        <div>
          <strong>{publication.title_en}</strong>
          <br />
          <span dir="rtl">{publication.title_ar}</span>
        </div>
      )
    },
    {
      key: "type",
      header: "Type",
      render: (publication) => formatValue(publication.type)
    },
    {
      key: "file_url",
      header: "File URL",
      render: (publication) => formatValue(publication.file_url)
    },
    {
      key: "publish_date",
      header: "Publish date",
      render: (publication) => formatValue(publication.publish_date)
    },
    {
      key: "visibility_status",
      header: "Visibility",
      render: (publication) => (
        <span className="admin-status-badge">
          <span className="admin-status-badge__label">{formatStatus(publication.visibility_status)}</span>
        </span>
      )
    },
    {
      key: "actions",
      header: "Actions",
      render: (publication) => (
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <Link className="admin-inline-link" href={`/admin/publications/${publication.id}/edit`}>
            Edit
          </Link>
          <Link className="admin-inline-link" href={`/publications/${publication.slug}`}>
            View
          </Link>
          {mode === "active" ? (
            <form action={archivePublicationAction}>
              <input type="hidden" name="publicationId" value={publication.id} />
              <button type="submit">Archive</button>
            </form>
          ) : (
            <form action={restorePublicationAction}>
              <input type="hidden" name="publicationId" value={publication.id} />
              <button type="submit">Restore</button>
            </form>
          )}
        </div>
      )
    }
  ];
}

export default async function AdminPublicationsPage({ searchParams }: AdminPublicationsPageProps) {
  const resolvedSearchParams = await searchParams;
  const organizationId = getAdminAuthConfig()?.organizationId;
  const capability = getCmsModuleCapability("publications");
  const query = normalize(resolvedSearchParams?.q);
  const viewingArchived = resolvedSearchParams?.view === "archived";

  const publications = organizationId
    ? await (viewingArchived ? listArchivedPublicationRecords(organizationId) : listPublicationRecords(organizationId))
    : [];
  const filteredPublications = publications.filter((publication) => includesSearch(publication, query));

  return (
    <AdminShell
      title="Publications"
      description={capability.messaging.listDescription}
    >
      <PageToolbar
        title={viewingArchived ? "Publications — Archived" : "Publications"}
        capability={capability}
        description={viewingArchived
          ? "Records removed from the live site. Restore returns a record to Hidden — re-publish it from Edit."
          : "Create and manage PostgreSQL-backed publication records."}
        search={<SearchBar label="Search publications" placeholder="Search publication records" defaultValue={resolvedSearchParams?.q ?? ""} queryParam="q" />}
        action={
          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <Link className="admin-inline-link" href={viewingArchived ? "/admin/publications" : "/admin/publications?view=archived"}>
              {viewingArchived ? "Back to active publications" : "View archived"}
            </Link>
            {!viewingArchived ? (
              <Link className="admin-button admin-button--primary" href="/admin/publications/new">
                Create Publication
              </Link>
            ) : null}
          </div>
        }
      />
      <DataTable
        caption={viewingArchived ? "Archived publications" : "Publications"}
        columns={buildColumns(viewingArchived ? "archived" : "active")}
        rows={filteredPublications}
        getRowKey={(publication) => publication.id}
        emptyTitle={viewingArchived ? "No publications are currently archived." : "No publication records are currently available."}
        emptyDescription={query
          ? "No publication records match the current search query."
          : viewingArchived
            ? "Archived records will appear here after they are removed from the live site."
            : "Publication records will appear here after they are saved."}
      />
    </AdminShell>
  );
}
