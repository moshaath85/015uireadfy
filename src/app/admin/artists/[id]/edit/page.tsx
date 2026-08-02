import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { ArtistForm } from "@/components/admin/ArtistForm";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import type { ArtistsFormEntity } from "@/lib/cms/artists";
import { initialArtistUpdateFormState, submitUpdateArtistFormAction } from "@/lib/cms/artists/artists-actions";
import { findArtistPrismaRecord } from "@/lib/cms/artists/artists-prisma-adapter";
import { listMediaRecords } from "@/lib/cms/production-prisma";

export interface EditArtistPageProps {
  readonly params: Promise<{
    readonly id: string;
  }>;
  readonly searchParams?: Promise<{
    readonly created?: string;
  }>;
}

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [];
}

export default async function EditArtistPage({ params, searchParams }: EditArtistPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const organizationId = getAdminAuthConfig()?.organizationId;
  const [artist, mediaOptions] = organizationId
    ? await Promise.all([
        findArtistPrismaRecord(id, organizationId),
        listMediaRecords(organizationId),
      ])
    : [null, []];

  if (!artist) {
    notFound();
  }

  const updateArtistAction = submitUpdateArtistFormAction.bind(null, artist.id);
  const initialState =
    resolvedSearchParams?.created === "1"
      ? {
          ...initialArtistUpdateFormState,
          status: "success" as const,
          message: "Artist was created successfully. You can continue editing it here.",
          artistId: artist.id,
        }
      : initialArtistUpdateFormState;

  return (
    <AdminShell
      title="Edit Artist"
      description="Update one artist record and its Arabic and English content."
    >
      <PageToolbar
        title="Edit Artist"
        description={`Update ${artist.name_en}.`}
      />
      <ArtistForm
        action={updateArtistAction}
        initialState={initialState}
        mediaOptions={mediaOptions}
        mode="edit"
        values={artist as ArtistsFormEntity}
      />
    </AdminShell>
  );
}