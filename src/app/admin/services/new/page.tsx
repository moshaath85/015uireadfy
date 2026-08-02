import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { prepareCreateServiceAction } from "@/lib/cms/services";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";

async function createServiceAction(formData: FormData) {
  "use server";

  const adminContext = await requireAdminServerAction("services.create");
  const result = await prepareCreateServiceAction(formData, {
    mutationEnabled: true,
    organizationId: adminContext.organizationId,
    environment: process.env.NODE_ENV,
  });

  if (!result.ok) {
    redirect(`/admin/services/new?status=error&message=${encodeURIComponent(result.message)}`);
  }

  redirect(`/admin/services/${result.serviceId}/edit?created=1`);
}

export default async function NewServicePage({ searchParams }: { readonly searchParams?: Promise<{ readonly status?: string; readonly message?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const status = resolvedSearchParams?.status === "success" || resolvedSearchParams?.status === "error" ? resolvedSearchParams.status : undefined;

  return (
    <AdminShell title="Create Service" description="Create a PostgreSQL-backed service record.">
      <PageToolbar title="Create Service" description="Save a new service record to PostgreSQL." />
      <ServiceForm
        action={createServiceAction}
        message={resolvedSearchParams?.message}
        status={status}
      />
    </AdminShell>
  );
}
