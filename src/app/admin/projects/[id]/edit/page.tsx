import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { prepareUpdateProjectAction, type ProjectsFormEntity } from "@/lib/cms/projects";
import { findProjectRecord } from "@/lib/cms/production-prisma";

export interface EditProjectPageProps {
  readonly params: { readonly id: string };
  readonly searchParams?: { readonly status?: string; readonly message?: string; readonly created?: string };
}

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [];
}

async function updateProjectAction(projectId: string, formData: FormData) {
  "use server";

  const adminContext = await requireAdminServerAction("projects.update");
  const result = await prepareUpdateProjectAction(projectId, formData, {
    existingProjectId: projectId,
    mutationEnabled: true,
    organizationId: adminContext.organizationId,
    environment: process.env.NODE_ENV,
  });

  if (!result.ok) {
    redirect(`/admin/projects/${projectId}/edit?status=error&message=${encodeURIComponent(result.message)}`);
  }

  redirect(`/admin/projects/${result.projectId ?? projectId}/edit?status=success&message=${encodeURIComponent(result.message || "Project was updated.")}`);
}

export default async function EditProjectPage({ params, searchParams }: EditProjectPageProps) {
  const organizationId = getAdminAuthConfig()?.organizationId;
  const record = organizationId ? await findProjectRecord(params.id, organizationId) : null;

  if (!record) {
    notFound();
  }

  const status = searchParams?.status === "success" || searchParams?.status === "error" ? searchParams.status : undefined;
  const message = searchParams?.message ?? (searchParams?.created === "1" ? "Project was created successfully. You can continue editing it here." : undefined);
  const action = updateProjectAction.bind(null, record.id);

  return (
    <AdminShell title="Edit Project" description="Update one project record and its Arabic and English content.">
      <PageToolbar title="Edit Project" description="Update this record." />
      <ProjectForm
        action={action}
        message={message}
        mode="edit"
        status={status}
        values={record as ProjectsFormEntity}
      />
    </AdminShell>
  );
}
