import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { prepareUpdateServiceAction, type ServicesFormEntity } from "@/lib/cms/services";
import { findServiceRecord } from "@/lib/cms/production-prisma";

export interface EditServicePageProps {
  readonly params: { readonly id: string };
  readonly searchParams?: { readonly status?: string; readonly message?: string; readonly created?: string };
}

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [];
}

async function updateServiceAction(serviceId: string, formData: FormData) {
  "use server";

  const adminContext = await requireAdminServerAction("services.update");
  const result = await prepareUpdateServiceAction(serviceId, formData, {
    existingServiceId: serviceId,
    mutationEnabled: true,
    organizationId: adminContext.organizationId,
    environment: process.env.NODE_ENV,
  });

  if (!result.ok) {
    redirect(`/admin/services/${serviceId}/edit?status=error&message=${encodeURIComponent(result.message)}`);
  }

  redirect(`/admin/services/${result.serviceId ?? serviceId}/edit?status=success&message=${encodeURIComponent(result.message || "Service was updated.")}`);
}

export default async function EditServicePage({ params, searchParams }: EditServicePageProps) {
  const organizationId = getAdminAuthConfig()?.organizationId;
  const record = organizationId ? await findServiceRecord(params.id, organizationId) : null;

  if (!record) {
    notFound();
  }

  const status = searchParams?.status === "success" || searchParams?.status === "error" ? searchParams.status : undefined;
  const message = searchParams?.message ?? (searchParams?.created === "1" ? "Service was created successfully. You can continue editing it here." : undefined);
  const action = updateServiceAction.bind(null, record.id);

  return (
    <AdminShell title="Edit Service" description="Update one service record and its Arabic and English content.">
      <PageToolbar title="Edit Service" description="Update this record." />
      <ServiceForm
        action={action}
        message={message}
        mode="edit"
        status={status}
        values={record as ServicesFormEntity}
      />
    </AdminShell>
  );
}
