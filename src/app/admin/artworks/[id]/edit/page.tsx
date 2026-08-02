import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { ArtworkForm } from "@/components/admin/ArtworkForm";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { listArtistPrismaRecords } from "@/lib/cms/artists/artists-prisma-adapter";
import { prepareUpdateArtworkAction, type ArtworksFormEntity } from "@/lib/cms/artworks";
import { findArtworkRecord, listCollectionRecords, listMediaRecords } from "@/lib/cms/production-prisma";

export interface EditArtworkPageProps {
  readonly params: Promise<{ readonly id: string }>;
  readonly searchParams?: Promise<{ readonly status?: string; readonly message?: string; readonly created?: string }>;
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
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const organizationId = getAdminAuthConfig()?.organizationId;
  const [record, mediaOptions, artistRecords, collectionRecords] = organizationId
    ? await Promise.all([
        findArtworkRecord(id, organizationId),
        listMediaRecords(organizationId),
        listArtistPrismaRecords(organizationId),
        listCollectionRecords(organizationId),
      ])
    : [null, [], [], []];

  if (!record) {
    notFound();
  }

  const status = resolvedSearchParams?.status === "success" || resolvedSearchParams?.status === "error" ? resolvedSearchParams.status : undefined;
  const message = resolvedSearchParams?.message ?? (resolvedSearchParams?.created === "1" ? "Artwork was created successfully. You can continue editing it here." : undefined);
  const action = updateArtworkAction.bind(null, record.id);
  const artistOptions = artistRecords.map((artist) => ({
    id: artist.id,
    label: artist.name_en || artist.name_ar || artist.slug || artist.id,
    description: artist.slug ? `Slug: ${artist.slug}` : undefined,
  }));
  const collectionOptions = collectionRecords.map((collection) => ({
    id: collection.id,
    label: collection.title_en || collection.title_ar || collection.slug || collection.id,
    description: collection.slug ? `Slug: ${collection.slug}` : undefined,
  }));

  return (
    <AdminShell title="Edit Artwork" description="Update one artwork record and its Arabic and English content.">
      <PageToolbar title="Edit Artwork" description="Update this record." />
      <ArtworkForm
        action={action}
        artistOptions={artistOptions}
        collectionOptions={collectionOptions}
        mediaOptions={mediaOptions}
        message={message}
        mode="edit"
        status={status}
        values={record as ArtworksFormEntity}
      />
    </AdminShell>
  );
}
