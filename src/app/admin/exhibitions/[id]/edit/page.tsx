import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { ExhibitionForm } from "@/components/admin/ExhibitionForm";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { prepareUpdateExhibitionAction, type ExhibitionsFormEntity } from "@/lib/cms/exhibitions";
import { findExhibitionRecord } from "@/lib/cms/production-prisma";

export interface EditExhibitionPageProps {
  readonly params: { readonly id: string };
  readonly searchParams?: { readonly status?: string; readonly message?: string; readonly created?: string };
}

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [];
}

async function updateExhibitionAction(exhibitionId: string, formData: FormData) {
  "use server";

  const adminContext = await requireAdminServerAction("exhibitions.update");
  const result = await prepareUpdateExhibitionAction(exhibitionId, formData, {
    existingExhibitionId: exhibitionId,
    mutationEnabled: true,
    organizationId: adminContext.organizationId,
    environment: process.env.NODE_ENV,
  });

  if (!result.ok) {
    redirect(`/admin/exhibitions/${exhibitionId}/edit?status=error&message=${encodeURIComponent(result.message)}`);
  }

  redirect(`/admin/exhibitions/${result.exhibitionId ?? exhibitionId}/edit?status=success&message=${encodeURIComponent(result.message || "Exhibition was updated.")}`);
}

export default async function EditExhibitionPage({ params, searchParams }: EditExhibitionPageProps) {
  const organizationId = getAdminAuthConfig()?.organizationId;
  const record = organizationId ? await findExhibitionRecord(params.id, organizationId) : null;

  if (!record) {
    notFound();
  }

  const status = searchParams?.status === "success" || searchParams?.status === "error" ? searchParams.status : undefined;
  const message = searchParams?.message ?? (searchParams?.created === "1" ? "Exhibition was created successfully. You can continue editing it here." : undefined);
  const action = updateExhibitionAction.bind(null, record.id);

  return (
    <AdminShell title="Edit Exhibition" description="Update one exhibition record and its Arabic and English content.">
      <PageToolbar title="Edit Exhibition" description="Update this record." />
      <ExhibitionForm
        action={action}
        message={message}
        mode="edit"
        status={status}
        values={record as ExhibitionsFormEntity}
      />
    </AdminShell>
  );
}
