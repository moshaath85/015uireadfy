import Link from "next/link";
import { revalidatePath } from "next/cache";
import { AdminShell } from "@/components/admin";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { SearchBar } from "@/components/admin/SearchBar";
import { ExhibitionsTable } from "@/components/admin/ExhibitionsTable";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { getCmsModuleCapability } from "@/lib/cms/capabilities/capability-registry";
import { archiveExhibitionRecord, listArchivedExhibitionRecords, listExhibitionRecords, unarchiveExhibitionRecord } from "@/lib/cms/production-prisma";
import type { Exhibition } from "@/types";

interface AdminExhibitionPageProps {
  readonly searchParams?: Promise<{
    readonly q?: string;
    readonly view?: string;
  }>;
}

function normalize(value?: string | number | null): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim().toLowerCase();
}

function includesSearch(exhibition: Exhibition, query: string): boolean {
  if (!query) {
    return true;
  }

  return [
    exhibition.id,
    exhibition.title_en,
    exhibition.title_ar,
    exhibition.slug,
    exhibition.venue_en,
    exhibition.venue_ar,
    exhibition.visibility_status,
    exhibition.start_date,
    exhibition.end_date,
  ].some((value) => normalize(value).includes(query));
}

async function archiveExhibitionAction(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("exhibitionId") ?? "").trim();
  const adminContext = await requireAdminServerAction("exhibitions.update");
  if (!id) return;
  await archiveExhibitionRecord(id, { organizationId: adminContext.organizationId });
  revalidatePath("/exhibitions");
  revalidatePath("/admin/exhibitions");
}

async function restoreExhibitionAction(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("exhibitionId") ?? "").trim();
  const adminContext = await requireAdminServerAction("exhibitions.update");
  if (!id) return;
  await unarchiveExhibitionRecord(id, { organizationId: adminContext.organizationId });
  revalidatePath("/exhibitions");
  revalidatePath("/admin/exhibitions");
}

export default async function AdminExhibitionPage({ searchParams }: AdminExhibitionPageProps) {
  const resolvedSearchParams = await searchParams;
  const organizationId = getAdminAuthConfig()?.organizationId;
  const capability = getCmsModuleCapability("exhibitions");
  const query = normalize(resolvedSearchParams?.q);
  const viewingArchived = resolvedSearchParams?.view === "archived";
  const records = organizationId
    ? await (viewingArchived ? listArchivedExhibitionRecords(organizationId) : listExhibitionRecords(organizationId))
    : [];
  const filteredRecords = records.filter((record) => includesSearch(record, query));

  return (
    <AdminShell title="Exhibitions" description={capability.messaging.listDescription}>
      <PageToolbar
        title={viewingArchived ? "Exhibitions — Archived" : "Exhibitions"}
        capability={capability}
        description={viewingArchived
          ? "Records removed from the live site. Restore returns a record to Hidden — re-publish it from Edit."
          : "Create and manage PostgreSQL-backed exhibition records."}
        search={<SearchBar label="Search exhibitions" placeholder="Search exhibition records" defaultValue={resolvedSearchParams?.q ?? ""} queryParam="q" />}
        action={
          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <Link className="admin-inline-link" href={viewingArchived ? "/admin/exhibitions" : "/admin/exhibitions?view=archived"}>
              {viewingArchived ? "Back to active exhibitions" : "View archived"}
            </Link>
            {!viewingArchived ? (
              <Link className="admin-button admin-button--primary" href="/admin/exhibitions/new">Create Exhibition</Link>
            ) : null}
          </div>
        }
      />
      <ExhibitionsTable exhibitions={filteredRecords} archiveAction={archiveExhibitionAction} restoreAction={restoreExhibitionAction} mode={viewingArchived ? "archived" : "active"} />
    </AdminShell>
  );
}
