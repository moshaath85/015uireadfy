import Link from "next/link";
import { revalidatePath } from "next/cache";
import { AdminShell } from "@/components/admin";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { SearchBar } from "@/components/admin/SearchBar";
import { NewsTable } from "@/components/admin/NewsTable";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { getCmsModuleCapability } from "@/lib/cms/capabilities/capability-registry";
import { archiveNewsRecord, listNewsRecords } from "@/lib/cms/production-prisma";
import type { News } from "@/types";

interface AdminNewsPageProps {
  readonly searchParams?: Promise<{
    readonly q?: string;
  }>;
}

function normalize(value?: string | number | null): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim().toLowerCase();
}

function includesSearch(news: News, query: string): boolean {
  if (!query) {
    return true;
  }

  return [
    news.id,
    news.title_en,
    news.title_ar,
    news.slug,
    news.category,
    news.visibility_status,
    news.publish_date,
  ].some((value) => normalize(value).includes(query));
}

async function archiveNewsAction(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("newsId") ?? "").trim();
  const adminContext = await requireAdminServerAction("news.update");
  if (!id) return;
  await archiveNewsRecord(id, { organizationId: adminContext.organizationId });
  revalidatePath("/news");
  revalidatePath("/admin/news");
}

export default async function AdminNewsPage({ searchParams }: AdminNewsPageProps) {
  const resolvedSearchParams = await searchParams;
  const organizationId = getAdminAuthConfig()?.organizationId;
  const capability = getCmsModuleCapability("news");
  const query = normalize(resolvedSearchParams?.q);
  const records = organizationId ? await listNewsRecords(organizationId) : [];
  const filteredRecords = records.filter((record) => includesSearch(record, query));

  return (
    <AdminShell title="News" description={capability.messaging.listDescription}>
      <PageToolbar
        title="News"
        capability={capability}
        description="Create and manage PostgreSQL-backed news records."
        search={<SearchBar label="Search news" placeholder="Search news records" defaultValue={resolvedSearchParams?.q ?? ""} queryParam="q" />}
        action={<Link className="admin-button admin-button--primary" href="/admin/news/new">Create News</Link>}
      />
      <NewsTable news={filteredRecords} archiveAction={archiveNewsAction} />
    </AdminShell>
  );
}
