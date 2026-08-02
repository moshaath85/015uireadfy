import Link from "next/link";
import { revalidatePath } from "next/cache";
import { AdminShell } from "@/components/admin";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { SearchBar } from "@/components/admin/SearchBar";
import { ServicesTable } from "@/components/admin/ServicesTable";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { getCmsModuleCapability } from "@/lib/cms/capabilities/capability-registry";
import { archiveServiceRecord, listServiceRecords } from "@/lib/cms/production-prisma";
import type { Service } from "@/types";

interface AdminServicePageProps {
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

function includesSearch(service: Service, query: string): boolean {
  if (!query) {
    return true;
  }

  return [
    service.id,
    service.title_en,
    service.title_ar,
    service.slug,
    service.visibility_status,
  ].some((value) => normalize(value).includes(query));
}

async function archiveServiceAction(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("serviceId") ?? "").trim();
  const adminContext = await requireAdminServerAction("services.update");
  if (!id) return;
  await archiveServiceRecord(id, { organizationId: adminContext.organizationId });
  revalidatePath("/services");
  revalidatePath("/admin/services");
}

export default async function AdminServicePage({ searchParams }: AdminServicePageProps) {
  const resolvedSearchParams = await searchParams;
  const organizationId = getAdminAuthConfig()?.organizationId;
  const capability = getCmsModuleCapability("services");
  const query = normalize(resolvedSearchParams?.q);
  const records = organizationId ? await listServiceRecords(organizationId) : [];
  const filteredRecords = records.filter((record) => includesSearch(record, query));

  return (
    <AdminShell title="Services" description={capability.messaging.listDescription}>
      <PageToolbar
        title="Services"
        capability={capability}
        description="Create and manage PostgreSQL-backed service records."
        search={<SearchBar label="Search services" placeholder="Search service records" defaultValue={resolvedSearchParams?.q ?? ""} queryParam="q" />}
        action={<Link className="admin-button admin-button--primary" href="/admin/services/new">Create Service</Link>}
      />
      <ServicesTable services={filteredRecords} archiveAction={archiveServiceAction} />
    </AdminShell>
  );
}
