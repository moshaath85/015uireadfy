import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { prepareCreateProjectAction } from "@/lib/cms/projects";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";

async function createProjectAction(formData: FormData) {
  "use server";

  const adminContext = await requireAdminServerAction("projects.create");
  const result = await prepareCreateProjectAction(formData, {
    mutationEnabled: true,
    organizationId: adminContext.organizationId,
    environment: process.env.NODE_ENV,
  });

  if (!result.ok) {
    redirect(`/admin/projects/new?status=error&message=${encodeURIComponent(result.message)}`);
  }

  redirect(`/admin/projects/${result.projectId}/edit?created=1`);
}

export default async function NewProjectPage({ searchParams }: { readonly searchParams?: Promise<{ readonly status?: string; readonly message?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const status = resolvedSearchParams?.status === "success" || resolvedSearchParams?.status === "error" ? resolvedSearchParams.status : undefined;

  return (
    <AdminShell title="Create Project" description="Create a PostgreSQL-backed project record.">
      <PageToolbar title="Create Project" description="Save a new project record to PostgreSQL." />
      <ProjectForm
        action={createProjectAction}
        message={resolvedSearchParams?.message}
        status={status}
      />
    </AdminShell>
  );
}
