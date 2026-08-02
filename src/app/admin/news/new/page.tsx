import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { NewsForm } from "@/components/admin/NewsForm";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { prepareCreateNewsAction } from "@/lib/cms/news/news-actions";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";

async function createNewsAction(formData: FormData) {
  "use server";

  const adminContext = await requireAdminServerAction("news.create");
  const result = await prepareCreateNewsAction(formData, {
    mutationEnabled: true,
    organizationId: adminContext.organizationId,
    environment: process.env.NODE_ENV,
  });

  if (!result.ok) {
    redirect(`/admin/news/new?status=error&message=${encodeURIComponent(result.message)}`);
  }

  redirect(`/admin/news/${result.newsId}/edit?created=1`);
}

export default async function NewNewsPage({ searchParams }: { readonly searchParams?: Promise<{ readonly status?: string; readonly message?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const status = resolvedSearchParams?.status === "success" || resolvedSearchParams?.status === "error" ? resolvedSearchParams.status : undefined;

  return (
    <AdminShell title="Create News" description="Create a PostgreSQL-backed news record.">
      <PageToolbar title="Create News" description="Save a new news record to PostgreSQL." />
      <NewsForm
        action={createNewsAction}
        message={resolvedSearchParams?.message}
        status={status}
      />
    </AdminShell>
  );
}
