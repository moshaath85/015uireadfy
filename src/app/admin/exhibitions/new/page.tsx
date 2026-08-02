import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { ExhibitionForm } from "@/components/admin/ExhibitionForm";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { listArtistPrismaRecords } from "@/lib/cms/artists/artists-prisma-adapter";
import { prepareCreateExhibitionAction } from "@/lib/cms/exhibitions";
import { listArtworkRecords } from "@/lib/cms/production-prisma";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { VisibilityStatus } from "@/types";

async function createExhibitionAction(formData: FormData) {
  "use server";

  const adminContext = await requireAdminServerAction("exhibitions.create");
  const result = await prepareCreateExhibitionAction(formData, {
    mutationEnabled: true,
    organizationId: adminContext.organizationId,
    environment: process.env.NODE_ENV,
  });

  if (!result.ok) {
    redirect(`/admin/exhibitions/new?status=error&message=${encodeURIComponent(result.message)}`);
  }

  redirect(`/admin/exhibitions/${result.exhibitionId}/edit?created=1`);
}

export default async function NewExhibitionPage({ searchParams }: { readonly searchParams?: Promise<{ readonly status?: string; readonly message?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const organizationId = getAdminAuthConfig()?.organizationId;
  const [artistRecords, artworkRecords] = organizationId
    ? await Promise.all([
        listArtistPrismaRecords(organizationId),
        listArtworkRecords(organizationId),
      ])
    : [[], []];
  const artistOptions = artistRecords
    .filter((artist) => artist.visibility_status === VisibilityStatus.Public)
    .map((artist) => ({
      id: artist.id,
      label: artist.name_en || artist.name_ar || artist.slug || artist.id,
      description: artist.slug ? `Slug: ${artist.slug}` : undefined,
    }));
  const artworkOptions = artworkRecords
    .filter((artwork) => artwork.visibility_status === VisibilityStatus.Public)
    .map((artwork) => ({
      id: artwork.id,
      label: artwork.title_en || artwork.title_ar || artwork.slug || artwork.id,
      description: artwork.slug ? `Slug: ${artwork.slug}` : undefined,
    }));
  const status = resolvedSearchParams?.status === "success" || resolvedSearchParams?.status === "error" ? resolvedSearchParams.status : undefined;

  return (
    <AdminShell title="Create Exhibition" description="Create a PostgreSQL-backed exhibition record.">
      <PageToolbar title="Create Exhibition" description="Save a new exhibition record to PostgreSQL." />
      <ExhibitionForm
        action={createExhibitionAction}
        artistOptions={artistOptions}
        artworkOptions={artworkOptions}
        message={resolvedSearchParams?.message}
        status={status}
      />
    </AdminShell>
  );
}
