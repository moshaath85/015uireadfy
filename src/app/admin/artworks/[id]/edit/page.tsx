import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { ArtworkForm } from "@/components/admin/ArtworkForm";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { prepareUpdateArtworkAction, type ArtworksFormEntity } from "@/lib/cms/artworks";
import { findArtworkRecord } from "@/lib/cms/production-prisma";

export interface EditArtworkPageProps {
  readonly params: { readonly id: string };
  readonly searchParams?: { readonly status?: string; readonly message?: string; readonly created?: string };
}

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [];
}

async function updateArtworkAction(artworkId: string, formData: FormData) {
  "use server";

  const adminContext = await requireAdminServerAction("artworks.update");
  const result = await prepareUpdateArtworkAction(artworkId, formData, {
    existingArtworkId: artworkId,
    mutationEnabled: true,
    organizationId: adminContext.organizationId,
    environment: process.env.NODE_ENV,
  });

  if (!result.ok) {
    redirect(`/admin/artworks/${artworkId}/edit?status=error&message=${encodeURIComponent(result.message)}`);
  }

  redirect(`/admin/artworks/${result.artworkId ?? artworkId}/edit?status=success&message=${encodeURIComponent(result.message || "Artwork was updated.")}`);
}

export default async function EditArtworkPage({ params, searchParams }: EditArtworkPageProps) {
  const organizationId = getAdminAuthConfig()?.organizationId;
  const record = organizationId ? await findArtworkRecord(params.id, organizationId) : null;

  if (!record) {
    notFound();
  }

  const status = searchParams?.status === "success" || searchParams?.status === "error" ? searchParams.status : undefined;
  const message = searchParams?.message ?? (searchParams?.created === "1" ? "Artwork was created successfully. You can continue editing it here." : undefined);
  const action = updateArtworkAction.bind(null, record.id);

  return (
    <AdminShell title="Edit Artwork" description="Update one artwork record and its Arabic and English content.">
      <PageToolbar title="Edit Artwork" description="Update this record." />
      <ArtworkForm
        action={action}
        message={message}
        mode="edit"
        status={status}
        values={record as ArtworksFormEntity}
      />
    </AdminShell>
  );
}
