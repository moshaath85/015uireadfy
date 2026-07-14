import Link from "next/link";
import { revalidatePath } from "next/cache";
import { AdminShell } from "@/components/admin";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { SearchBar } from "@/components/admin/SearchBar";
import { ProjectsTable } from "@/components/admin/ProjectsTable";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { archiveProjectRecord, listProjectRecords } from "@/lib/cms/production-prisma";

async function archiveProjectAction(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("projectId") ?? "").trim();
  const adminContext = await requireAdminServerAction("projects.update");
  if (!id) return;
  await archiveProjectRecord(id, { organizationId: adminContext.organizationId });
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
}

export default async function AdminProjectPage() {
  const organizationId = getAdminAuthConfig()?.organizationId;
  const records = organizationId ? await listProjectRecords(organizationId) : [];

  return (
    <AdminShell title="Projects" description="Project records available in the CMS.">
      <PageToolbar
        title="Projects"
        description="Create and manage PostgreSQL-backed project records."
        search={<SearchBar label="Search projects" placeholder="Search project records" />}
        action={<Link className="admin-button admin-button--primary" href="/admin/projects/new">Create Project</Link>}
      />
      <ProjectsTable projects={records} archiveAction={archiveProjectAction} />
    </AdminShell>
  );
}
