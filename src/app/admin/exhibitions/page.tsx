import Link from "next/link";
import { revalidatePath } from "next/cache";
import { AdminShell } from "@/components/admin";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { SearchBar } from "@/components/admin/SearchBar";
import { ExhibitionsTable } from "@/components/admin/ExhibitionsTable";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { archiveExhibitionRecord, listExhibitionRecords } from "@/lib/cms/production-prisma";

async function archiveExhibitionAction(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("exhibitionId") ?? "").trim();
  const adminContext = await requireAdminServerAction("exhibitions.update");
  if (!id) return;
  await archiveExhibitionRecord(id, { organizationId: adminContext.organizationId });
  revalidatePath("/exhibitions");
  revalidatePath("/admin/exhibitions");
}

export default async function AdminExhibitionPage() {
  const organizationId = getAdminAuthConfig()?.organizationId;
  const records = organizationId ? await listExhibitionRecords(organizationId) : [];

  return (
    <AdminShell title="Exhibitions" description="Exhibition records available in the CMS.">
      <PageToolbar
        title="Exhibitions"
        description="Create and manage PostgreSQL-backed exhibition records."
        search={<SearchBar label="Search exhibitions" placeholder="Search exhibition records" />}
        action={<Link className="admin-button admin-button--primary" href="/admin/exhibitions/new">Create Exhibition</Link>}
      />
      <ExhibitionsTable exhibitions={records} archiveAction={archiveExhibitionAction} />
    </AdminShell>
  );
}
