import type { BulkImportModule } from "@/lib/cms/bulk-import-export";

export interface BulkImportExportPanelProps {
  readonly module: BulkImportModule;
  readonly label: string;
}

export function BulkImportExportPanel({ module, label }: BulkImportExportPanelProps) {
  return (
    <div
      aria-label={`${label} bulk import and export`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexWrap: "wrap",
      }}
    >
      <a className="admin-button" href={`/admin/bulk/${module}/template`}>
        Download Excel Template
      </a>
      <a className="admin-button" href={`/admin/bulk/${module}/export`}>
        Export Data
      </a>
      <form
        action={`/admin/bulk/${module}/import`}
        method="post"
        encType="multipart/form-data"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <label style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <span>Import Excel</span>
          <input name="file" type="file" accept=".xls,.xml,.csv,.tsv,text/csv,text/tab-separated-values,application/vnd.ms-excel" required />
        </label>
        <button className="admin-button admin-button--primary" type="submit">
          Import
        </button>
      </form>
    </div>
  );
}