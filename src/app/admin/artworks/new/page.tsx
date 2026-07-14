import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { ArtworkForm } from "@/components/admin/ArtworkForm";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { prepareCreateArtworkAction } from "@/lib/cms/artworks";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";

async function createArtworkAction(formData: FormData) {
  "use server";

  const adminContext = await requireAdminServerAction("artworks.create");
  const result = await prepareCreateArtworkAction(formData, {
    mutationEnabled: true,
    organizationId: adminContext.organizationId,
    environment: process.env.NODE_ENV,
  });

  if (!result.ok) {
    redirect(`/admin/artworks/new?status=error&message=${encodeURIComponent(result.message)}`);
  }

  redirect(`/admin/artworks/${result.artworkId}/edit?created=1`);
}

export default function NewArtworkPage({ searchParams }: { readonly searchParams?: { readonly status?: string; readonly message?: string } }) {
  const status = searchParams?.status === "success" || searchParams?.status === "error" ? searchParams.status : undefined;

  return (
    <AdminShell title="Create Artwork" description="Create a PostgreSQL-backed artwork record.">
      <PageToolbar title="Create Artwork" description="Save a new artwork record to PostgreSQL." />
      <ArtworkForm
        action={createArtworkAction}
        message={searchParams?.message}
        status={status}
      />
    </AdminShell>
  );
}
