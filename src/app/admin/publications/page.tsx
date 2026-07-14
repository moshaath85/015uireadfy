import Link from "next/link";
import { revalidatePath } from "next/cache";
import { AdminShell } from "@/components/admin";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { SearchBar } from "@/components/admin/SearchBar";

import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { archivePublicationRecord, listPublicationRecords } from "@/lib/cms/production-prisma";
import type { Publication } from "@/types";

function formatValue(value?: string | number | null): string {
  return value === undefined || value === null || value === "" ? "Not configured" : String(value);
}

function formatStatus(value: string): string {
  return value
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

const publicationColumns: readonly DataTableColumn<Publication>[] = [
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
      <Link className="admin-inline-link" href={`/admin/publications/${publication.id}/edit`}>
        Edit
      </Link>
    )
  }
];

async function archivePublicationAction(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("publicationId") ?? "").trim();
  const adminContext = await requireAdminServerAction("publications.update");
  if (!id) return;
  await archivePublicationRecord(id, { organizationId: adminContext.organizationId });
  revalidatePath("/publications");
  revalidatePath("/admin/publications");
}

export default async function AdminPublicationsPage() {
  const organizationId = getAdminAuthConfig()?.organizationId;
  const publications = organizationId ? await listPublicationRecords(organizationId) : [];

  return (
    <AdminShell
      title="Publications"
      description="Publication records prepared for guarded create, edit, and JSON-backed runtime workflows."
    >
      <PageToolbar
        title="Publications"
        description="Publication records prepared for guarded create, edit, and JSON-backed runtime workflows."
        search={<SearchBar label="Search publications" placeholder="Search publication records" />}
        action={
          <Link className="admin-button admin-button--primary" href="/admin/publications/new">
            Create Publication
          </Link>
        }
      />
      <DataTable
        caption="Publications"
        columns={publicationColumns}
        rows={publications}
        getRowKey={(publication) => publication.id}
        emptyTitle="No publication records are currently available."
        emptyDescription="Publication records will appear here when they are ready."
      />
    </AdminShell>
  );
}