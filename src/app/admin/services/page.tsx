import Link from "next/link";
import { revalidatePath } from "next/cache";
import { AdminShell } from "@/components/admin";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { SearchBar } from "@/components/admin/SearchBar";
import { ServicesTable } from "@/components/admin/ServicesTable";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { archiveServiceRecord, listServiceRecords } from "@/lib/cms/production-prisma";

async function archiveServiceAction(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("serviceId") ?? "").trim();
  const adminContext = await requireAdminServerAction("services.update");
  if (!id) return;
  await archiveServiceRecord(id, { organizationId: adminContext.organizationId });
  revalidatePath("/services");
  revalidatePath("/admin/services");
}

export default async function AdminServicePage() {
  const organizationId = getAdminAuthConfig()?.organizationId;
  const records = organizationId ? await listServiceRecords(organizationId) : [];

  return (
    <AdminShell title="Services" description="Service records available in the CMS.">
      <PageToolbar
        title="Services"
        description="Create and manage PostgreSQL-backed service records."
        search={<SearchBar label="Search services" placeholder="Search service records" />}
        action={<Link className="admin-button admin-button--primary" href="/admin/services/new">Create Service</Link>}
      />
      <ServicesTable services={records} archiveAction={archiveServiceAction} />
    </AdminShell>
  );
}
