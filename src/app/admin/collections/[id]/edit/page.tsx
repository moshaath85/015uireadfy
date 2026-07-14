import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { CollectionForm } from "@/components/admin/CollectionForm";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { prepareUpdateCollectionAction, type CollectionsFormEntity } from "@/lib/cms/collections";
import { findCollectionRecord } from "@/lib/cms/production-prisma";

export interface EditCollectionPageProps {
  readonly params: { readonly id: string };
  readonly searchParams?: { readonly status?: string; readonly message?: string; readonly created?: string };
}

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [];
}

async function updateCollectionAction(collectionId: string, formData: FormData) {
  "use server";

  const adminContext = await requireAdminServerAction("collections.update");
  const result = await prepareUpdateCollectionAction(collectionId, formData, {
    existingCollectionId: collectionId,
    mutationEnabled: true,
    organizationId: adminContext.organizationId,
    environment: process.env.NODE_ENV,
  });

  if (!result.ok) {
    redirect(`/admin/collections/${collectionId}/edit?status=error&message=${encodeURIComponent(result.message)}`);
  }

  redirect(`/admin/collections/${result.collectionId ?? collectionId}/edit?status=success&message=${encodeURIComponent(result.message || "Collection was updated.")}`);
}

export default async function EditCollectionPage({ params, searchParams }: EditCollectionPageProps) {
  const organizationId = getAdminAuthConfig()?.organizationId;
  const record = organizationId ? await findCollectionRecord(params.id, organizationId) : null;

  if (!record) {
    notFound();
  }

  const status = searchParams?.status === "success" || searchParams?.status === "error" ? searchParams.status : undefined;
  const message = searchParams?.message ?? (searchParams?.created === "1" ? "Collection was created successfully. You can continue editing it here." : undefined);
  const action = updateCollectionAction.bind(null, record.id);

  return (
    <AdminShell title="Edit Collection" description="Update one collection record and its Arabic and English content.">
      <PageToolbar title="Edit Collection" description="Update this record." />
      <CollectionForm
        action={action}
        message={message}
        mode="edit"
        status={status}
        values={record as CollectionsFormEntity}
      />
    </AdminShell>
  );
}
