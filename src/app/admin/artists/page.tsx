import Link from "next/link";
import { revalidatePath } from "next/cache";
import { AdminShell } from "@/components/admin";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { SearchBar } from "@/components/admin/SearchBar";
import { StatusBadge, type StatusBadgeValue } from "@/components/admin/StatusBadge";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { getCmsModuleCapability } from "@/lib/cms/capabilities/capability-registry";
import { archiveArtistPrismaRecord, listArtistPrismaRecords } from "@/lib/cms/artists/artists-prisma-adapter";
import type { Artist } from "@/types";

interface AdminArtistsPageProps {
  readonly searchParams?: Promise<{
    readonly q?: string;
  }>;
}

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

function normalize(value?: string): string {
  return value?.trim().toLowerCase() ?? "";
}

function includesSearch(artist: Artist, query: string): boolean {
  if (!query) {
    return true;
  }

  return [
    artist.id,
    artist.name_en,
    artist.name_ar,
    artist.slug,
    artist.nationality_en,
    artist.nationality_ar,
    artist.visibility_status,
  ].some((value) => normalize(value).includes(query));
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

export default async function AdminArtistsPage({ searchParams }: AdminArtistsPageProps) {
  const resolvedSearchParams = await searchParams;
  const organizationId = getAdminAuthConfig()?.organizationId;
  const capability = getCmsModuleCapability("artists");
  const query = normalize(resolvedSearchParams?.q);
  const artists = organizationId ? await listArtistPrismaRecords(organizationId) : [];
  const filteredArtists = artists.filter((artist) => includesSearch(artist, query));

  return (
    <AdminShell
      title="Artists"
      description={capability.messaging.listDescription}
    >
      <PageToolbar
        title="Artists"
        capability={capability}
        description="Create and manage artist records."
        search={<SearchBar label="Search artists" placeholder="Search artist records" defaultValue={resolvedSearchParams?.q ?? ""} queryParam="q" />}
      />
      <DataTable
        caption="Artists"
        columns={artistColumns}
        rows={filteredArtists}
        getRowKey={(artist) => artist.id}
        emptyTitle="No artist records are currently available."
        emptyDescription={query ? "No artist records match the current search query." : "Artist records will appear here after they are saved."}
      />
    </AdminShell>
  );
}
