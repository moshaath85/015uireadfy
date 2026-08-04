import Link from "next/link";
import type { Exhibition } from "@/types";

import { DataTable, type DataTableColumn } from "./DataTable";
import { ExhibitionStatusBadge } from "./ExhibitionStatusBadge";

export interface ExhibitionsTableProps {
  readonly exhibitions: readonly Exhibition[];
  readonly archiveAction?: (formData: FormData) => void | Promise<void>;
  readonly restoreAction?: (formData: FormData) => void | Promise<void>;
  readonly mode?: "active" | "archived";
}

function formatValue(value?: string | number | null): string {
  return value === undefined || value === null || value === "" ? "Not configured" : String(value);
}

function createExhibitionColumns(
  archiveAction: ExhibitionsTableProps["archiveAction"],
  restoreAction: ExhibitionsTableProps["restoreAction"],
  mode: NonNullable<ExhibitionsTableProps["mode"]>,
): readonly DataTableColumn<Exhibition>[] {
  return [
  {
    key: "title",
    header: "Title",
    render: (exhibition) => (
      <div>
        <strong>{exhibition.title_en}</strong>
        <br />
        <span dir="rtl">{exhibition.title_ar}</span>
      </div>
    )
  },
  {
    key: "slug",
    header: "Slug",
    render: (exhibition) => formatValue(exhibition.slug)
  },
  {
    key: "venue",
    header: "Venue",
    render: (exhibition) => (
      <div>
        <span>{formatValue(exhibition.venue_en)}</span>
        <br />
        <span dir="rtl">{formatValue(exhibition.venue_ar)}</span>
      </div>
    )
  },
  {
    key: "start_date",
    header: "Start date",
    render: (exhibition) => formatValue(exhibition.start_date)
  },
  {
    key: "end_date",
    header: "End date",
    render: (exhibition) => formatValue(exhibition.end_date)
  },
  {
    key: "visibility_status",
    header: "Visibility",
    render: (exhibition) => <ExhibitionStatusBadge value={exhibition.visibility_status} />
  },
  {
    key: "actions",
    header: "Actions",
    render: (exhibition) => (
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <Link className="admin-inline-link" href={`/admin/exhibitions/${exhibition.id}/edit`}>Edit</Link>
        <Link className="admin-inline-link" href={`/exhibitions#${exhibition.slug}`}>View</Link>
        {mode === "active" ? (
          <form action={archiveAction}>
            <input type="hidden" name="exhibitionId" value={exhibition.id} />
            <button type="submit" disabled={!archiveAction}>Archive</button>
          </form>
        ) : (
          <form action={restoreAction}>
            <input type="hidden" name="exhibitionId" value={exhibition.id} />
            <button type="submit" disabled={!restoreAction}>Restore</button>
          </form>
        )}
      </div>
    )
  }
];
}

export function ExhibitionsTable({ exhibitions, archiveAction, restoreAction, mode = "active" }: ExhibitionsTableProps) {
  const exhibitionColumns = createExhibitionColumns(archiveAction, restoreAction, mode);

  return (
    <DataTable
      caption={mode === "archived" ? "Archived exhibitions" : "Exhibitions"}
      columns={exhibitionColumns}
      rows={exhibitions}
      getRowKey={(exhibition) => exhibition.id}
      emptyTitle={mode === "archived" ? "No exhibitions are currently archived." : "No exhibition records are currently available."}
      emptyDescription={mode === "archived" ? "Archived records will appear here after they are removed from the live site." : "Exhibition records will appear here when they are ready."}
    />
  );
}