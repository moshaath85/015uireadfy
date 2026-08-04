import Link from "next/link";
import { revalidatePath } from "next/cache";
import { AdminShell } from "@/components/admin";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { SearchBar } from "@/components/admin/SearchBar";
import { ProjectsTable } from "@/components/admin/ProjectsTable";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { getCmsModuleCapability } from "@/lib/cms/capabilities/capability-registry";
import { archiveProjectRecord, listArchivedProjectRecords, listProjectRecords, unarchiveProjectRecord } from "@/lib/cms/production-prisma";
import type { Project } from "@/types";

interface AdminProjectPageProps {
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

function includesSearch(project: Project, query: string): boolean {
  if (!query) {
    return true;
  }

  return [
    project.id,
    project.title_en,
    project.title_ar,
    project.slug,
    project.client_en,
    project.client_ar,
    project.type,
    project.year,
    project.status,
    project.visibility_status,
  ].some((value) => normalize(value).includes(query));
}

async function archiveProjectAction(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("projectId") ?? "").trim();
  const adminContext = await requireAdminServerAction("projects.update");
  if (!id) return;
  await archiveProjectRecord(id, { organizationId: adminContext.organizationId });
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
}

async function restoreProjectAction(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("projectId") ?? "").trim();
  const adminContext = await requireAdminServerAction("projects.update");
  if (!id) return;
  await unarchiveProjectRecord(id, { organizationId: adminContext.organizationId });
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
}

export default async function AdminProjectPage({ searchParams }: AdminProjectPageProps) {
  const resolvedSearchParams = await searchParams;
  const organizationId = getAdminAuthConfig()?.organizationId;
  const capability = getCmsModuleCapability("projects");
  const query = normalize(resolvedSearchParams?.q);
  const viewingArchived = resolvedSearchParams?.view === "archived";
  const records = organizationId
    ? await (viewingArchived ? listArchivedProjectRecords(organizationId) : listProjectRecords(organizationId))
    : [];
  const filteredRecords = records.filter((record) => includesSearch(record, query));

  return (
    <AdminShell title="Projects" description={capability.messaging.listDescription}>
      <PageToolbar
        title={viewingArchived ? "Projects — Archived" : "Projects"}
        capability={capability}
        description={viewingArchived
          ? "Records removed from the live site. Restore returns a record to Hidden — re-publish it from Edit."
          : "Create and manage PostgreSQL-backed project records."}
        search={<SearchBar label="Search projects" placeholder="Search project records" defaultValue={resolvedSearchParams?.q ?? ""} queryParam="q" />}
        action={
          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <Link className="admin-inline-link" href={viewingArchived ? "/admin/projects" : "/admin/projects?view=archived"}>
              {viewingArchived ? "Back to active projects" : "View archived"}
            </Link>
            {!viewingArchived ? (
              <Link className="admin-button admin-button--primary" href="/admin/projects/new">Create Project</Link>
            ) : null}
          </div>
        }
      />
      <ProjectsTable projects={filteredRecords} archiveAction={archiveProjectAction} restoreAction={restoreProjectAction} mode={viewingArchived ? "archived" : "active"} />
    </AdminShell>
  );
}
