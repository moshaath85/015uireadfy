import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { ExhibitionForm } from "@/components/admin/ExhibitionForm";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { prepareCreateExhibitionAction } from "@/lib/cms/exhibitions";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";

async function createExhibitionAction(formData: FormData) {
  "use server";

  const adminContext = await requireAdminServerAction("exhibitions.create");
  const result = await prepareCreateExhibitionAction(formData, {
    mutationEnabled: true,
    organizationId: adminContext.organizationId,
    environment: process.env.NODE_ENV,
  });

  if (!result.ok) {
    redirect(`/admin/exhibitions/new?status=error&message=${encodeURIComponent(result.message)}`);
  }

  redirect(`/admin/exhibitions/${result.exhibitionId}/edit?created=1`);
}

export default function NewExhibitionPage({ searchParams }: { readonly searchParams?: { readonly status?: string; readonly message?: string } }) {
  const status = searchParams?.status === "success" || searchParams?.status === "error" ? searchParams.status : undefined;

  return (
    <AdminShell title="Create Exhibition" description="Create a PostgreSQL-backed exhibition record.">
      <PageToolbar title="Create Exhibition" description="Save a new exhibition record to PostgreSQL." />
      <ExhibitionForm
        action={createExhibitionAction}
        message={searchParams?.message}
        status={status}
      />
    </AdminShell>
  );
}
