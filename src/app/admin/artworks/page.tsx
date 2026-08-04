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
import { archiveArtworkRecord, listArchivedArtworkRecords, listArtworkRecords, unarchiveArtworkRecord } from "@/lib/cms/production-prisma";
import type { Artwork } from "@/types";

interface AdminArtworksPageProps {
  readonly searchParams?: Promise<{
    readonly q?: string;
    readonly view?: string;
  }>;
}

function formatBooleanStatus(value: boolean): string {
  return value ? "Yes" : "No";
}

function formatValue(value?: string | number | null): string {
  return value === undefined || value === null || value === "" ? "Not configured" : String(value);
}

function formatPriceValue(artwork: Artwork): string {
  if (artwork.price === undefined || artwork.price === null) {
    return "Not configured";
  }

  return `${artwork.currency} ${artwork.price}`;
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

function normalize(value?: string | number | null): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim().toLowerCase();
}

function includesSearch(artwork: Artwork, query: string): boolean {
  if (!query) {
    return true;
  }

  return [
    artwork.id,
    artwork.title_en,
    artwork.title_ar,
    artwork.slug,
    artwork.year,
    artwork.medium_en,
    artwork.medium_ar,
    artwork.availability_status,
    artwork.price_status,
    artwork.visibility_status,
  ].some((value) => normalize(value).includes(query));
}

async function archiveArtworkAction(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("artworkId") ?? "").trim();
  const adminContext = await requireAdminServerAction("artworks.update");
  if (!id) return;
  await archiveArtworkRecord(id, { organizationId: adminContext.organizationId });
  revalidatePath("/");
  revalidatePath("/artworks");
  revalidatePath("/admin/artworks");
}

async function restoreArtworkAction(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("artworkId") ?? "").trim();
  const adminContext = await requireAdminServerAction("artworks.update");
  if (!id) return;
  await unarchiveArtworkRecord(id, { organizationId: adminContext.organizationId });
  revalidatePath("/");
  revalidatePath("/artworks");
  revalidatePath("/admin/artworks");
}

function buildColumns(mode: "active" | "archived"): readonly DataTableColumn<Artwork>[] {
  return [
    {
      key: "artwork",
      header: "Artwork",
      render: (artwork) => (
        <div>
          <strong>{artwork.title_en}</strong>
          <br />
          <span dir="rtl">{artwork.title_ar}</span>
          <br />
          <span>{artwork.id}</span>
        </div>
      )
    },
    {
      key: "year",
      header: "Year",
      render: (artwork) => artwork.year
    },
    {
      key: "availability_status",
      header: "Availability status",
      render: (artwork) =>
        isStatusBadgeValue(artwork.availability_status) ? (
          <StatusBadge status={artwork.availability_status} />
        ) : (
          formatValue(artwork.availability_status)
        )
    },
    {
      key: "price_status",
      header: "Price status",
      render: (artwork) => formatValue(artwork.price_status)
    },
    {
      key: "price",
      header: "Price",
      render: (artwork) => formatPriceValue(artwork)
    },
    {
      key: "visibility_status",
      header: "Visibility",
      render: (artwork) =>
        isStatusBadgeValue(artwork.visibility_status) ? (
          <StatusBadge status={artwork.visibility_status} />
        ) : (
          formatValue(artwork.visibility_status)
        )
    },
    {
      key: "featured",
      header: "Featured",
      render: (artwork) =>
        artwork.featured ? <StatusBadge status="featured" label="Yes" /> : formatBooleanStatus(false)
    },
    {
      key: "is_featured_homepage",
      header: "Featured homepage",
      render: (artwork) => formatBooleanStatus(artwork.is_featured_homepage)
    },
    {
      key: "display_order",
      header: "Display order",
      render: (artwork) => artwork.display_order
    },
    {
      key: "actions",
      header: "Actions",
      render: (artwork) => (
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <Link href={`/admin/artworks/${artwork.id}/edit`}>Edit</Link>
          <Link href={`/artworks/${artwork.slug}`}>View</Link>
          {mode === "active" ? (
            <form action={archiveArtworkAction}>
              <input type="hidden" name="artworkId" value={artwork.id} />
              <button type="submit">Archive</button>
            </form>
          ) : (
            <form action={restoreArtworkAction}>
              <input type="hidden" name="artworkId" value={artwork.id} />
              <button type="submit">Restore</button>
            </form>
          )}
        </div>
      )
    }
  ];
}

export default async function AdminArtworksPage({ searchParams }: AdminArtworksPageProps) {
  const resolvedSearchParams = await searchParams;
  const organizationId = getAdminAuthConfig()?.organizationId;
  const capability = getCmsModuleCapability("artworks");
  const query = normalize(resolvedSearchParams?.q);
  const viewingArchived = resolvedSearchParams?.view === "archived";

  const artworks = organizationId
    ? await (viewingArchived ? listArchivedArtworkRecords(organizationId) : listArtworkRecords(organizationId))
    : [];
  const filteredArtworks = artworks.filter((artwork) => includesSearch(artwork, query));

  return (
    <AdminShell
      title="Artworks"
      description={capability.messaging.listDescription}
    >
      <PageToolbar
        title={viewingArchived ? "Artworks — Archived" : "Artworks"}
        capability={capability}
        description={viewingArchived
          ? "Records removed from the live site. Restore returns a record to Hidden — re-publish it from Edit."
          : "Create and manage artwork records."}
        search={<SearchBar label="Search artworks" placeholder="Search artwork records" defaultValue={resolvedSearchParams?.q ?? ""} queryParam="q" />}
        action={
          <Link className="admin-inline-link" href={viewingArchived ? "/admin/artworks" : "/admin/artworks?view=archived"}>
            {viewingArchived ? "Back to active artworks" : "View archived"}
          </Link>
        }
      />
      <DataTable
        caption={viewingArchived ? "Archived artworks" : "Artworks"}
        columns={buildColumns(viewingArchived ? "archived" : "active")}
        rows={filteredArtworks}
        getRowKey={(artwork) => artwork.id}
        emptyTitle={viewingArchived ? "No artworks are currently archived." : "No artwork records are currently available."}
        emptyDescription={query
          ? "No artwork records match the current search query."
          : viewingArchived
            ? "Archived records will appear here after they are removed from the live site."
            : "Artwork records will appear here after they are saved."}
      />
    </AdminShell>
  );
}
