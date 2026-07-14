import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { exportBulkRows, getBulkModuleConfig, isBulkImportModule } from "@/lib/cms/bulk-import-export";

export async function GET(_request: Request, context: { params: Promise<{ module: string }> }) {
  const { module } = await context.params;

  if (!isBulkImportModule(module)) {
    return new Response("Unsupported bulk export module.", { status: 404 });
  }

  const config = getBulkModuleConfig(module);
  const adminContext = await requireAdminServerAction(config.permission);
  const csv = await exportBulkRows(module, adminContext.organizationId);

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="gallery-015-${module}-export.csv"`,
      "cache-control": "no-store",
    },
  });
}