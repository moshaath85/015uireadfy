import { revalidatePath } from "next/cache";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getBulkModuleConfig, importBulkRows, isBulkImportModule, parseBulkWorkbook } from "@/lib/cms/bulk-import-export";

function html(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(request: Request, context: { params: Promise<{ module: string }> }) {
  const { module } = await context.params;

  if (!isBulkImportModule(module)) {
    return new Response("Unsupported bulk import module.", { status: 404 });
  }

  const config = getBulkModuleConfig(module);
  const adminContext = await requireAdminServerAction(config.permission);
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return new Response("A non-empty Excel-compatible file is required.", { status: 400 });
  }

  const rows = await parseBulkWorkbook(file);

  if (rows.length === 0) {
    return new Response("No import rows were found. Use the downloaded Excel template, or export CSV and re-import it.", { status: 400 });
  }

  const summary = await importBulkRows(module, adminContext.organizationId, rows);

  revalidatePath(`/${module}`);
  revalidatePath(`/admin/${module}`);

  const errors = summary.errors.length
    ? `<h2>Errors</h2><ul>${summary.errors.map((error) => `<li>${html(error)}</li>`).join("")}</ul>`
    : "<p>No import errors were reported.</p>";

  return new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${html(config.label)} Import Summary</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 40px; line-height: 1.5; color: #171717; }
      main { max-width: 840px; }
      dl { display: grid; grid-template-columns: 160px 1fr; gap: 8px 16px; }
      dt { font-weight: 700; }
      a { color: #111827; }
    </style>
  </head>
  <body>
    <main>
      <h1>${html(config.label)} Import Summary</h1>
      <dl>
        <dt>Total rows</dt><dd>${summary.total}</dd>
        <dt>Imported</dt><dd>${summary.imported}</dd>
        <dt>Updated</dt><dd>${summary.updated}</dd>
        <dt>Skipped</dt><dd>${summary.skipped}</dd>
      </dl>
      ${errors}
      <p><a href="/admin/${module}">Return to ${html(config.label)}</a></p>
    </main>
  </body>
</html>`,
    {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    },
  );
}