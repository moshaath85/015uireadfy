import Link from "next/link";
import type { News } from "@/types";

import { DataTable, type DataTableColumn } from "./DataTable";
import { NewsStatusBadge } from "./NewsStatusBadge";

export interface NewsTableProps {
  readonly news: readonly News[];
  readonly archiveAction?: (formData: FormData) => void | Promise<void>;
}

function formatValue(value?: string | number | null): string {
  return value === undefined || value === null || value === "" ? "Not configured" : String(value);
}

function createNewsColumns(archiveAction?: NewsTableProps["archiveAction"]): readonly DataTableColumn<News>[] {
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
        <form action={archiveAction}>
          <input type="hidden" name="newsId" value={newsItem.id} />
          <button type="submit" disabled={!archiveAction}>Archive</button>
        </form>
      </div>
    )
  }
];
}

export function NewsTable({ news, archiveAction }: NewsTableProps) {
  const newsColumns = createNewsColumns(archiveAction);

  return (
    <DataTable
      caption="News"
      columns={newsColumns}
      rows={news}
      getRowKey={(newsItem) => newsItem.id}
      emptyTitle="No news records are currently available."
      emptyDescription="News records will appear here when they are ready."
    />
  );
}