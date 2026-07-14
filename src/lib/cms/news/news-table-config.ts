import type { TableModuleConfig } from "@/lib/tables";
import { VisibilityStatus, type News } from "@/types";

export type NewsTableEntity = News & Record<string, unknown>;

export const newsTableConfig: TableModuleConfig<NewsTableEntity> = {
  entity: "news",
  table: {
    key: "news-table",
    title: "News",
    description: "Table configuration for the future News CMS listing.",
    columns: [
      {
        key: "title_en",
        label: "News Item",
        type: "text",
        sortable: true,
        searchable: true,
        width: "26%",
        description: "Primary English news title.",
      },
      {
        key: "title_ar",
        label: "Arabic Title",
        type: "text",
        sortable: true,
        searchable: true,
        hidden: true,
      },
      {
        key: "category",
        label: "Category",
        type: "status",
        sortable: true,
        searchable: true,
        filterable: true,
        width: "16%",
        description: "Maps to the future editorial category taxonomy.",
      },
      {
        key: "publish_date",
        label: "Publish Date",
        type: "date",
        sortable: true,
        filterable: true,
        width: "16%",
      },
      {
        key: "excerpt_en",
        label: "Excerpt",
        type: "text",
        searchable: true,
        width: "24%",
        description: "Primary English summary shown in listing contexts.",
      },
      {
        key: "excerpt_ar",
        label: "Arabic Excerpt",
        type: "text",
        searchable: true,
        hidden: true,
      },
      {
        key: "image_id",
        label: "Image",
        type: "image",
        hidden: true,
      },
      {
        key: "visibility_status",
        label: "Visibility",
        type: "visibility",
        sortable: true,
        filterable: true,
        width: "18%",
        description: "Maps to the public, private, VIP, or hidden visibility status.",
      },
    ],
    defaultSort: {
      field: "publish_date",
      direction: "desc",
    },
    defaultFilters: [
      {
        field: "visibility_status",
        operator: "notEquals",
        value: VisibilityStatus.Hidden,
      },
    ],
    defaultPagination: {
      page: 1,
      pageSize: 20,
    },
    emptyTitle: "No news available",
    emptyDescription: "News items will appear when future CMS data access is connected.",
  },
};