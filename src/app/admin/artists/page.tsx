import Link from "next/link";
import { revalidatePath } from "next/cache";
import { AdminShell } from "@/components/admin";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { SearchBar } from "@/components/admin/SearchBar";
import { StatusBadge, type StatusBadgeValue } from "@/components/admin/StatusBadge";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { archiveArtistPrismaRecord, listArtistPrismaRecords } from "@/lib/cms/artists/artists-prisma-adapter";
import type { Artist } from "@/types";

function formatBooleanStatus(value: boolean): string {
  return value ? "Yes" : "No";
}

function formatValue(value?: string | number | null): string {
  return value === undefined || value === null || value === "" ? "Not configured" : String(value);
}

function isStatusBadgeValue(value: string): value is StatusBadgeValue {
  return [
    "public",
    "private",
    "hidden",
    "featured",
    "draft",
    "published",
    "archived",
    "available",
    "reserved",
    "sold"
  ].includes(value);
}

async function archiveArtistAction(formData: FormData): Promise<void> {
  "use server";

  const artistId = String(formData.get("artistId") ?? "").trim();
  const adminContext = await requireAdminServerAction("artists.update");

  if (!artistId) {
    return;
  }

  await archiveArtistPrismaRecord(artistId, {
    organizationId: adminContext.organizationId,
  });

  revalidatePath("/");
  revalidatePath("/artists");
  revalidatePath("/admin/artists");
}

const artistColumns: readonly DataTableColumn<Artist>[] = [
  {
    key: "artist",
    header: "Artist",
    render: (artist) => (
      <div>
        <strong>{artist.name_en}</strong>
        <br />
        <span dir="rtl">{artist.name_ar}</span>
      </div>
    )
  },
  {
    key: "nationality_en",
    header: "Nationality, English",
    render: (artist) => formatValue(artist.nationality_en)
  },
  {
    key: "visibility_status",
    header: "Visibility",
    render: (artist) =>
      isStatusBadgeValue(artist.visibility_status) ? (
        <StatusBadge status={artist.visibility_status} />
      ) : (
        formatValue(artist.visibility_status)
      )
  },
  {
    key: "featured",
    header: "Featured",
    render: (artist) =>
      artist.featured ? <StatusBadge status="featured" label="Yes" /> : formatBooleanStatus(false)
  },
  {
    key: "display_order",
    header: "Display order",
    render: (artist) => artist.display_order
  },
  {
    key: "actions",
    header: "Actions",
    render: (artist) => (
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <Link href={`/admin/artists/${artist.id}/edit`}>Edit</Link>
        <Link href={`/artists/${artist.slug}`}>View</Link>
        <form action={archiveArtistAction}>
          <input type="hidden" name="artistId" value={artist.id} />
          <button type="submit">Archive</button>
        </form>
      </div>
    )
  }
];

export default async function AdminArtistsPage() {
  const organizationId = getAdminAuthConfig()?.organizationId;
  const artists = organizationId ? await listArtistPrismaRecords(organizationId) : [];

  return (
    <AdminShell
      title="Artists"
      description="Artist records available in the CMS."
    >
      <PageToolbar
        title="Artists"
        description="Create and manage artist records."
        search={<SearchBar label="Search artists" placeholder="Search artist records" />}
      />
      <DataTable
        caption="Artists"
        columns={artistColumns}
        rows={artists}
        getRowKey={(artist) => artist.id}
        emptyTitle="No artist records are currently available."
        emptyDescription="Artist records will appear here after they are saved."
      />
    </AdminShell>
  );
}