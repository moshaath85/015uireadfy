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
import { archiveCollectionRecord, listArchivedCollectionRecords, listCollectionRecords, unarchiveCollectionRecord } from "@/lib/cms/production-prisma";
import type { Collection } from "@/types";

interface AdminCollectionsPageProps {
  readonly searchParams?: Promise<{
    readonly q?: string;
    readonly view?: string;
  }>;
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

function normalize(value?: string | number | null): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim().toLowerCase();
}

function includesSearch(collection: Collection, query: string): boolean {
  if (!query) {
    return true;
  }

  return [
    collection.id,
    collection.title_en,
    collection.title_ar,
    collection.slug,
    collection.visibility_status,
  ].some((value) => normalize(value).includes(query));
}

async function archiveCollectionAction(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("collectionId") ?? "").trim();
  const adminContext = await requireAdminServerAction("collections.update");
  if (!id) return;
  await archiveCollectionRecord(id, { organizationId: adminContext.organizationId });
  revalidatePath("/collections");
  revalidatePath("/admin/collections");
}

async function restoreCollectionAction(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("collectionId") ?? "").trim();
  const adminContext = await requireAdminServerAction("collections.update");
  if (!id) return;
  await unarchiveCollectionRecord(id, { organizationId: adminContext.organizationId });
  revalidatePath("/collections");
  revalidatePath("/admin/collections");
}

function buildColumns(mode: "active" | "archived"): readonly DataTableColumn<Collection>[] {
  return [
    {
      key: "collection",
      header: "Collection",
      render: (collection) => (
        <div>
          <strong>{collection.title_en}</strong>
          <br />
          <span dir="rtl">{collection.title_ar}</span>
          <br />
          <span>{collection.id}</span>
        </div>
      )
    },
    {
      key: "title",
      header: "Title",
      render: (collection) => formatValue(collection.title_en)
    },
    {
      key: "slug",
      header: "Slug",
      render: (collection) => formatValue(collection.slug)
    },
    {
      key: "visibility_status",
      header: "Visibility",
      render: (collection) =>
        isStatusBadgeValue(collection.visibility_status) ? (
          <StatusBadge status={collection.visibility_status} />
        ) : (
          formatValue(collection.visibility_status)
        )
    },
    {
      key: "actions",
      header: "Actions",
      render: (collection) => (
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <Link href={`/admin/collections/${collection.id}/edit`}>Edit</Link>
          <Link href={`/collections/${collection.slug}`}>View</Link>
          {mode === "active" ? (
            <form action={archiveCollectionAction}>
              <input type="hidden" name="collectionId" value={collection.id} />
              <button type="submit">Archive</button>
            </form>
          ) : (
            <form action={restoreCollectionAction}>
              <input type="hidden" name="collectionId" value={collection.id} />
              <button type="submit">Restore</button>
            </form>
          )}
        </div>
      )
    }
  ];
}

export default async function AdminCollectionsPage({ searchParams }: AdminCollectionsPageProps) {
  const resolvedSearchParams = await searchParams;
  const organizationId = getAdminAuthConfig()?.organizationId;
  const capability = getCmsModuleCapability("collections");
  const query = normalize(resolvedSearchParams?.q);
  const viewingArchived = resolvedSearchParams?.view === "archived";

  const collections = organizationId
    ? await (viewingArchived ? listArchivedCollectionRecords(organizationId) : listCollectionRecords(organizationId))
    : [];
  const filteredCollections = collections.filter((collection) => includesSearch(collection, query));

  return (
    <AdminShell
      title="Collections"
      description={capability.messaging.listDescription}
    >
      <PageToolbar
        title={viewingArchived ? "Collections — Archived" : "Collections"}
        capability={capability}
        description={viewingArchived
          ? "Records removed from the live site. Restore returns a record to Hidden — re-publish it from Edit."
          : "Create and manage collection records."}
        search={<SearchBar label="Search collections" placeholder="Search collection records" defaultValue={resolvedSearchParams?.q ?? ""} queryParam="q" />}
        action={
          <Link className="admin-inline-link" href={viewingArchived ? "/admin/collections" : "/admin/collections?view=archived"}>
            {viewingArchived ? "Back to active collections" : "View archived"}
          </Link>
        }
      />
      <DataTable
        caption={viewingArchived ? "Archived collections" : "Collections"}
        columns={buildColumns(viewingArchived ? "archived" : "active")}
        rows={filteredCollections}
        getRowKey={(collection) => collection.id}
        emptyTitle={viewingArchived ? "No collections are currently archived." : "No collection records are currently available."}
        emptyDescription={query
          ? "No collection records match the current search query."
          : viewingArchived
            ? "Archived records will appear here after they are removed from the live site."
            : "Collection records will appear here after they are saved."}
      />
    </AdminShell>
  );
}
