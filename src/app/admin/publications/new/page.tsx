import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { PublicationForm } from "@/components/admin/PublicationForm";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { prepareCreatePublicationAction } from "@/lib/cms/publications/publications-actions";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";

async function createPublicationAction(formData: FormData) {
  "use server";

  const adminContext = await requireAdminServerAction("publications.create");
  const result = await prepareCreatePublicationAction(formData, {
    mutationEnabled: true,
    organizationId: adminContext.organizationId,
    environment: process.env.NODE_ENV,
  });

  if (!result.ok) {
    redirect(`/admin/publications/new?status=error&message=${encodeURIComponent(result.message)}`);
  }

  redirect(`/admin/publications/${result.publicationId}/edit?created=1`);
}

export default function NewPublicationPage({ searchParams }: { readonly searchParams?: { readonly status?: string; readonly message?: string } }) {
  const status = searchParams?.status === "success" || searchParams?.status === "error" ? searchParams.status : undefined;

  return (
    <AdminShell title="Create Publication" description="Create a PostgreSQL-backed publication record.">
      <PageToolbar title="Create Publication" description="Save a new publication record to PostgreSQL." />
      <PublicationForm
        action={createPublicationAction}
        message={searchParams?.message}
        status={status}
      />
    </AdminShell>
  );
}
