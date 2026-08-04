import Link from "next/link";
import type { News } from "@/types";

import { DataTable, type DataTableColumn } from "./DataTable";
import { NewsStatusBadge } from "./NewsStatusBadge";

export interface NewsTableProps {
  readonly news: readonly News[];
  readonly archiveAction?: (formData: FormData) => void | Promise<void>;
  readonly restoreAction?: (formData: FormData) => void | Promise<void>;
  readonly mode?: "active" | "archived";
}

function formatValue(value?: string | number | null): string {
  return value === undefined || value === null || value === "" ? "Not configured" : String(value);
}

function createNewsColumns(
  archiveAction: NewsTableProps["archiveAction"],
  restoreAction: NewsTableProps["restoreAction"],
  mode: NonNullable<NewsTableProps["mode"]>,
): readonly DataTableColumn<News>[] {
  return [
  {
    key: "title",
    header: "Title",
    render: (newsItem) => (
      <div>
        <strong>{newsItem.title_en}</strong>
        <br />
        <span dir="rtl">{newsItem.title_ar}</span>
      </div>
    )
  },
  {
    key: "slug",
    header: "Slug",
    render: (newsItem) => formatValue(newsItem.slug)
  },
  {
    key: "category",
    header: "Category",
    render: (newsItem) => formatValue(newsItem.category)
  },
  {
    key: "publish_date",
    header: "Publish date",
    render: (newsItem) => formatValue(newsItem.publish_date)
  },
  {
    key: "visibility_status",
    header: "Visibility",
    render: (newsItem) => <NewsStatusBadge value={newsItem.visibility_status} />
  },
  {
    key: "actions",
    header: "Actions",
    render: (newsItem) => (
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <Link className="admin-inline-link" href={`/admin/news/${newsItem.id}/edit`}>Edit</Link>
        <Link className="admin-inline-link" href={`/news#${newsItem.slug}`}>View</Link>
        {mode === "active" ? (
          <form action={archiveAction}>
            <input type="hidden" name="newsId" value={newsItem.id} />
            <button type="submit" disabled={!archiveAction}>Archive</button>
          </form>
        ) : (
          <form action={restoreAction}>
            <input type="hidden" name="newsId" value={newsItem.id} />
            <button type="submit" disabled={!restoreAction}>Restore</button>
          </form>
        )}
      </div>
    )
  }
];
}

export function NewsTable({ news, archiveAction, restoreAction, mode = "active" }: NewsTableProps) {
  const newsColumns = createNewsColumns(archiveAction, restoreAction, mode);

  return (
    <DataTable
      caption={mode === "archived" ? "Archived news" : "News"}
      columns={newsColumns}
      rows={news}
      getRowKey={(newsItem) => newsItem.id}
      emptyTitle={mode === "archived" ? "No news are currently archived." : "No news records are currently available."}
      emptyDescription={mode === "archived" ? "Archived records will appear here after they are removed from the live site." : "News records will appear here when they are ready."}
    />
  );
}