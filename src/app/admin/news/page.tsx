import Link from "next/link";
import { revalidatePath } from "next/cache";
import { AdminShell } from "@/components/admin";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { SearchBar } from "@/components/admin/SearchBar";
import { NewsTable } from "@/components/admin/NewsTable";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { archiveNewsRecord, listNewsRecords } from "@/lib/cms/production-prisma";

async function archiveNewsAction(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("newsId") ?? "").trim();
  const adminContext = await requireAdminServerAction("news.update");
  if (!id) return;
  await archiveNewsRecord(id, { organizationId: adminContext.organizationId });
  revalidatePath("/news");
  revalidatePath("/admin/news");
}

export default async function AdminNewsPage() {
  const organizationId = getAdminAuthConfig()?.organizationId;
  const records = organizationId ? await listNewsRecords(organizationId) : [];

  return (
    <AdminShell title="Newss" description="News records available in the CMS.">
      <PageToolbar
        title="Newss"
        description="Create and manage PostgreSQL-backed news records."
        search={<SearchBar label="Search news" placeholder="Search news records" />}
        action={<Link className="admin-button admin-button--primary" href="/admin/news/new">Create News</Link>}
      />
      <NewsTable news={records} archiveAction={archiveNewsAction} />
    </AdminShell>
  );
}
