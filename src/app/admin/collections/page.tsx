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
import { archiveCollectionRecord, listCollectionRecords } from "@/lib/cms/production-prisma";
import type { Collection } from "@/types";

interface AdminCollectionsPageProps {
  readonly searchParams?: Promise<{
    readonly q?: string;
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

const collectionColumns: readonly DataTableColumn<Collection>[] = [
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
  }
];

async function archiveCollectionAction(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("collectionId") ?? "").trim();
  const adminContext = await requireAdminServerAction("collections.update");
  if (!id) return;
  await archiveCollectionRecord(id, { organizationId: adminContext.organizationId });
  revalidatePath("/collections");
  revalidatePath("/admin/collections");
}

export default async function AdminCollectionsPage({ searchParams }: AdminCollectionsPageProps) {
  const resolvedSearchParams = await searchParams;
  const organizationId = getAdminAuthConfig()?.organizationId;
  const capability = getCmsModuleCapability("collections");
  const query = normalize(resolvedSearchParams?.q);
  const collections = organizationId ? await listCollectionRecords(organizationId) : [];
  const filteredCollections = collections.filter((collection) => includesSearch(collection, query));

  return (
    <AdminShell
      title="Collections"
      description={capability.messaging.listDescription}
    >
      <PageToolbar
        title="Collections"
        capability={capability}
        description="Create and manage collection records."
        search={<SearchBar label="Search collections" placeholder="Search collection records" defaultValue={resolvedSearchParams?.q ?? ""} queryParam="q" />}
      />
      <DataTable
        caption="Collections"
        columns={collectionColumns}
        rows={filteredCollections}
        getRowKey={(collection) => collection.id}
        emptyTitle="No collection records are currently available."
        emptyDescription={query ? "No collection records match the current search query." : "Collection records will appear here after they are saved."}
      />
    </AdminShell>
  );
}
