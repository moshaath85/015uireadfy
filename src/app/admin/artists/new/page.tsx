import { AdminShell } from "@/components/admin";
import { ArtistForm } from "@/components/admin/ArtistForm";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { initialArtistCreateFormState, submitCreateArtistFormAction } from "@/lib/cms/artists/artists-actions";

export default function NewArtistPage() {
  return (
    <AdminShell
      title="Create Artist"
      description="Foundation screen for the development-only artist creation workflow."
    >
      <PageToolbar
        title="Create Artist"
        description="Prepare and save a new artist record through the guarded development-only JSON workflow."
      />
      <ArtistForm action={submitCreateArtistFormAction} initialState={initialArtistCreateFormState} />
    </AdminShell>
  );
}