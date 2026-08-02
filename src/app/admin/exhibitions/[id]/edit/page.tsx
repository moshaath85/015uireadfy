import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { ExhibitionForm } from "@/components/admin/ExhibitionForm";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { listArtistPrismaRecords } from "@/lib/cms/artists/artists-prisma-adapter";
import { prepareUpdateExhibitionAction, type ExhibitionsFormEntity } from "@/lib/cms/exhibitions";
import {
  findExhibitionRecord,
  getExhibitionRelationshipSelection,
  listArtworkRecords,
} from "@/lib/cms/production-prisma";
import { VisibilityStatus } from "@/types";

export interface EditExhibitionPageProps {
  readonly params: Promise<{ readonly id: string }>;
  readonly searchParams?: Promise<{ readonly status?: string; readonly message?: string; readonly created?: string }>;
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
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const organizationId = getAdminAuthConfig()?.organizationId;
  const [record, artistRecords, artworkRecords, relationshipSelection] = organizationId
    ? await Promise.all([
        findExhibitionRecord(id, organizationId),
        listArtistPrismaRecords(organizationId),
        listArtworkRecords(organizationId),
        getExhibitionRelationshipSelection(id, organizationId),
      ])
    : [null, [], [], { artistIds: [], artworkIds: [] }];

  if (!record) {
    notFound();
  }

  const status = resolvedSearchParams?.status === "success" || resolvedSearchParams?.status === "error" ? resolvedSearchParams.status : undefined;
  const message = resolvedSearchParams?.message ?? (resolvedSearchParams?.created === "1" ? "Exhibition was created successfully. You can continue editing it here." : undefined);
  const action = updateExhibitionAction.bind(null, record.id);
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

  return (
    <AdminShell title="Edit Exhibition" description="Update one exhibition record and its Arabic and English content.">
      <PageToolbar title="Edit Exhibition" description="Update this record." />
      <ExhibitionForm
        action={action}
        artistOptions={artistOptions}
        initialArtistIds={relationshipSelection.artistIds}
        initialArtworkIds={relationshipSelection.artworkIds}
        artworkOptions={artworkOptions}
        message={message}
        mode="edit"
        status={status}
        values={record as ExhibitionsFormEntity}
      />
    </AdminShell>
  );
}
