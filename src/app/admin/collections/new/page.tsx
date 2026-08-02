import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { CollectionForm } from "@/components/admin/CollectionForm";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { prepareCreateCollectionAction } from "@/lib/cms/collections";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";

async function createCollectionAction(formData: FormData) {
  "use server";

  const adminContext = await requireAdminServerAction("collections.create");
  const result = await prepareCreateCollectionAction(formData, {
    mutationEnabled: true,
    organizationId: adminContext.organizationId,
    environment: process.env.NODE_ENV,
  });

  if (!result.ok) {
    redirect(`/admin/collections/new?status=error&message=${encodeURIComponent(result.message)}`);
  }

  redirect(`/admin/collections/${result.collectionId}/edit?created=1`);
}

export default async function NewCollectionPage({ searchParams }: { readonly searchParams?: Promise<{ readonly status?: string; readonly message?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const status = resolvedSearchParams?.status === "success" || resolvedSearchParams?.status === "error" ? resolvedSearchParams.status : undefined;

  return (
    <AdminShell title="Create Collection" description="Create a PostgreSQL-backed collection record.">
      <PageToolbar title="Create Collection" description="Save a new collection record to PostgreSQL." />
      <CollectionForm
        action={createCollectionAction}
        message={resolvedSearchParams?.message}
        status={status}
      />
    </AdminShell>
  );
}
