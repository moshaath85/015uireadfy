import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { NewsForm } from "@/components/admin/NewsForm";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getAdminAuthConfig } from "@/lib/auth/admin-auth-runtime";
import { prepareUpdateNewsAction } from "@/lib/cms/news/news-actions";
import { findNewsRecord } from "@/lib/cms/production-prisma";

export interface EditNewsPageProps {
  readonly params: { readonly id: string };
  readonly searchParams?: { readonly status?: string; readonly message?: string; readonly created?: string };
}

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [];
}

async function updateNewsAction(newsId: string, formData: FormData) {
  "use server";

  const adminContext = await requireAdminServerAction("news.update");
  const result = await prepareUpdateNewsAction(newsId, formData, {
    existingNewsId: newsId,
    mutationEnabled: true,
    organizationId: adminContext.organizationId,
    environment: process.env.NODE_ENV,
  });

  if (!result.ok) {
    redirect(`/admin/news/${newsId}/edit?status=error&message=${encodeURIComponent(result.message)}`);
  }

  redirect(`/admin/news/${result.newsId ?? newsId}/edit?status=success&message=${encodeURIComponent(result.message || "News was updated.")}`);
}

export default async function EditNewsPage({ params, searchParams }: EditNewsPageProps) {
  const organizationId = getAdminAuthConfig()?.organizationId;
  const record = organizationId ? await findNewsRecord(params.id, organizationId) : null;

  if (!record) {
    notFound();
  }

  const status = searchParams?.status === "success" || searchParams?.status === "error" ? searchParams.status : undefined;
  const message = searchParams?.message ?? (searchParams?.created === "1" ? "News was created successfully. You can continue editing it here." : undefined);
  const action = updateNewsAction.bind(null, record.id);

  return (
    <AdminShell title="Edit News" description="Update one news record and its Arabic and English content.">
      <PageToolbar title="Edit News" description="Update this record." />
      <NewsForm
        action={action}
        message={message}
        mode="edit"
        status={status}
        values={record as unknown as Record<string, unknown>}
      />
    </AdminShell>
  );
}
