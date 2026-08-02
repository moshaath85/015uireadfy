import Link from "next/link";
import { revalidatePath } from "next/cache";
import { AdminShell } from "@/components/admin";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { SearchBar } from "@/components/admin/SearchBar";
import { ProjectsTable } from "@/components/admin/ProjectsTable";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { getCmsModuleCapability } from "@/lib/cms/capabilities/capability-registry";
import { archiveProjectRecord, listProjectRecords } from "@/lib/cms/production-prisma";
import type { Project } from "@/types";

interface AdminProjectPageProps {
  readonly searchParams?: Promise<{
    readonly q?: string;
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

export default async function AdminProjectPage({ searchParams }: AdminProjectPageProps) {
  const resolvedSearchParams = await searchParams;
  const organizationId = getAdminAuthConfig()?.organizationId;
  const capability = getCmsModuleCapability("projects");
  const query = normalize(resolvedSearchParams?.q);
  const records = organizationId ? await listProjectRecords(organizationId) : [];
  const filteredRecords = records.filter((record) => includesSearch(record, query));

  return (
    <AdminShell title="Projects" description={capability.messaging.listDescription}>
      <PageToolbar
        title="Projects"
        capability={capability}
        description="Create and manage PostgreSQL-backed project records."
        search={<SearchBar label="Search projects" placeholder="Search project records" defaultValue={resolvedSearchParams?.q ?? ""} queryParam="q" />}
        action={<Link className="admin-button admin-button--primary" href="/admin/projects/new">Create Project</Link>}
      />
      <ProjectsTable projects={filteredRecords} archiveAction={archiveProjectAction} />
    </AdminShell>
  );
}
