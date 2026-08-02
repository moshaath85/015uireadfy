import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { ArtworkForm } from "@/components/admin/ArtworkForm";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { prepareCreateArtworkAction } from "@/lib/cms/artworks";
import { listArtistPrismaRecords } from "@/lib/cms/artists/artists-prisma-adapter";
import { listCollectionRecords } from "@/lib/cms/production-prisma";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";

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

export default async function NewArtworkPage({ searchParams }: { readonly searchParams?: Promise<{ readonly status?: string; readonly message?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const organizationId = getAdminAuthConfig()?.organizationId;
  const [artistRecords, collectionRecords] = organizationId
    ? await Promise.all([
        listArtistPrismaRecords(organizationId),
        listCollectionRecords(organizationId),
      ])
    : [[], []];

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

  const status = resolvedSearchParams?.status === "success" || resolvedSearchParams?.status === "error" ? resolvedSearchParams.status : undefined;

  return (
    <AdminShell title="Create Artwork" description="Create a PostgreSQL-backed artwork record.">
      <PageToolbar title="Create Artwork" description="Save a new artwork record to PostgreSQL." />
      <ArtworkForm
        action={createArtworkAction}
        artistOptions={artistOptions}
        collectionOptions={collectionOptions}
        message={resolvedSearchParams?.message}
        status={status}
      />
    </AdminShell>
  );
}
