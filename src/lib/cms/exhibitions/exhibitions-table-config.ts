import type { TableModuleConfig } from "@/lib/tables";
import { VisibilityStatus, type Exhibition } from "@/types";

export type ExhibitionsTableEntity = Exhibition & Record<string, unknown>;

export const exhibitionsTableConfig: TableModuleConfig<ExhibitionsTableEntity> = {
  entity: "exhibitions",
  table: {
    key: "exhibitions-table",
    title: "Exhibitions",
    description: "Table configuration for the future Exhibitions CMS listing.",
    columns: [
      {
        key: "title_en",
        label: "Exhibition",
        type: "text",
        sortable: true,
        searchable: true,
        width: "28%",
        description: "Primary English exhibition title.",
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
        key: "venue_en",
        label: "Venue",
        type: "text",
        sortable: true,
        searchable: true,
        filterable: true,
        width: "20%",
        description: "Primary English venue name.",
      },
      {
        key: "venue_ar",
        label: "Arabic Venue",
        type: "text",
        searchable: true,
        hidden: true,
      },
      {
        key: "start_date",
        label: "Start Date",
        type: "date",
        sortable: true,
        filterable: true,
        width: "16%",
      },
      {
        key: "end_date",
        label: "End Date",
        type: "date",
        sortable: true,
        filterable: true,
        width: "16%",
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
      {
        key: "updated_at",
        label: "Updated",
        type: "datetime",
        sortable: true,
        hidden: true,
      },
      {
        key: "created_at",
        label: "Created",
        type: "datetime",
        sortable: true,
        hidden: true,
      },
    ],
    defaultSort: {
      field: "start_date",
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
    emptyTitle: "No exhibitions available",
    emptyDescription: "Exhibitions will appear when future CMS data access is connected.",
  },
};