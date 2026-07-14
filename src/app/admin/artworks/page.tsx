import Link from "next/link";
import { revalidatePath } from "next/cache";
import { AdminShell } from "@/components/admin";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { SearchBar } from "@/components/admin/SearchBar";
import { StatusBadge, type StatusBadgeValue } from "@/components/admin/StatusBadge";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { archiveArtworkRecord, listArtworkRecords } from "@/lib/cms/production-prisma";
import type { Artwork } from "@/types";

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

const artworkColumns: readonly DataTableColumn<Artwork>[] = [
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
  }
];

async function archiveArtworkAction(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("artworkId") ?? "").trim();
  const adminContext = await requireAdminServerAction("artworks.update");
  if (!id) return;
  await archiveArtworkRecord(id, { organizationId: adminContext.organizationId });
  revalidatePath("/artworks");
  revalidatePath("/admin/artworks");
}

export default async function AdminArtworksPage() {
  const organizationId = getAdminAuthConfig()?.organizationId;
  const artworks = organizationId ? await listArtworkRecords(organizationId) : [];

  return (
    <AdminShell
      title="Artworks"
      description="Read-only artwork records prepared for future create, edit, and delete workflows."
    >
      <PageToolbar
        title="Artworks"
        description="Read-only artwork records prepared for future create, edit, and delete workflows."
        search={<SearchBar label="Search artworks" placeholder="Search artwork records" />}
      />
      <DataTable
        caption="Artworks"
        columns={artworkColumns}
        rows={artworks}
        getRowKey={(artwork) => artwork.id}
        emptyTitle="No artwork records are currently available."
        emptyDescription="Artwork records will appear here when they are ready."
      />
    </AdminShell>
  );
}