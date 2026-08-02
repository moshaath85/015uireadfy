import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { PublicationForm } from "@/components/admin/PublicationForm";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { prepareUpdatePublicationAction } from "@/lib/cms/publications/publications-actions";
import { findPublicationRecord } from "@/lib/cms/production-prisma";

export interface EditPublicationPageProps {
  readonly params: Promise<{ readonly id: string }>;
  readonly searchParams?: Promise<{ readonly status?: string; readonly message?: string; readonly created?: string }>;
}

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [];
}

async function updatePublicationAction(publicationId: string, formData: FormData) {
  "use server";

  const adminContext = await requireAdminServerAction("publications.update");
  const result = await prepareUpdatePublicationAction(publicationId, formData, {
    existingPublicationId: publicationId,
    mutationEnabled: true,
    organizationId: adminContext.organizationId,
    environment: process.env.NODE_ENV,
  });

  if (!result.ok) {
    redirect(`/admin/publications/${publicationId}/edit?status=error&message=${encodeURIComponent(result.message)}`);
  }

  redirect(`/admin/publications/${result.publicationId ?? publicationId}/edit?status=success&message=${encodeURIComponent(result.message || "Publication was updated.")}`);
}

export default async function EditPublicationPage({ params, searchParams }: EditPublicationPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const organizationId = getAdminAuthConfig()?.organizationId;
  const record = organizationId ? await findPublicationRecord(id, organizationId) : null;

  if (!record) {
    notFound();
  }

  const status = resolvedSearchParams?.status === "success" || resolvedSearchParams?.status === "error" ? resolvedSearchParams.status : undefined;
  const message = resolvedSearchParams?.message ?? (resolvedSearchParams?.created === "1" ? "Publication was created successfully. You can continue editing it here." : undefined);
  const action = updatePublicationAction.bind(null, record.id);

  return (
    <AdminShell title="Edit Publication" description="Update one publication record and its Arabic and English content.">
      <PageToolbar title="Edit Publication" description="Update this record." />
      <PublicationForm
        action={action}
        message={message}
        mode="edit"
        status={status}
        values={record as unknown as Record<string, unknown>}
      />
    </AdminShell>
  );
}
