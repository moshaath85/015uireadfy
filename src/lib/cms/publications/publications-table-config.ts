import type { TableModuleConfig } from "@/lib/tables";
import { VisibilityStatus, type Publication } from "@/types";

export type PublicationsTableEntity = Publication & Record<string, unknown>;

export const publicationsTableConfig: TableModuleConfig<PublicationsTableEntity> = {
  entity: "publications",
  table: {
    key: "publications-table",
    title: "Publications",
    description: "Table configuration for the future Publications CMS listing.",
    columns: [
      {
        key: "title_en",
        label: "Publication",
        type: "text",
        sortable: true,
        searchable: true,
        width: "26%",
        description: "Primary English publication title.",
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
        key: "type",
        label: "Type",
        type: "status",
        sortable: true,
        searchable: true,
        filterable: true,
        width: "16%",
        description: "Maps to the future publication type taxonomy.",
      },
      {
        key: "file_url",
        label: "File URL",
        type: "url",
        searchable: true,
        width: "22%",
        description: "Publication file location for future download or preview workflows.",
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
        key: "cover_image_id",
        label: "Cover Image",
        type: "image",
        hidden: true,
      },
      {
        key: "visibility_status",
        label: "Visibility",
        type: "visibility",
        sortable: true,
        filterable: true,
        width: "20%",
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
    emptyTitle: "No publications available",
    emptyDescription: "Publications will appear when future CMS data access is connected.",
  },
};