import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { createExcelTemplate, getBulkModuleConfig, isBulkImportModule } from "@/lib/cms/bulk-import-export";

export async function GET(_request: Request, context: { params: Promise<{ module: string }> }) {
  const { module } = await context.params;

  if (!isBulkImportModule(module)) {
    return new Response("Unsupported bulk import module.", { status: 404 });
  }

  const config = getBulkModuleConfig(module);
  await requireAdminServerAction(config.permission);

  return new Response(createExcelTemplate(module), {
    headers: {
      "content-type": "application/vnd.ms-excel; charset=utf-8",
      "content-disposition": `attachment; filename="gallery-015-${module}-template.xls"`,
      "cache-control": "no-store",
    },
  });
}