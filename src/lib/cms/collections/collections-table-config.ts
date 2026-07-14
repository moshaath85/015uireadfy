import type { TableModuleConfig } from "@/lib/tables";
import { VisibilityStatus, type Collection } from "@/types";

export type CollectionsTableEntity = Collection & Record<string, unknown>;

export const collectionsTableConfig: TableModuleConfig<CollectionsTableEntity> = {
  entity: "collections",
  table: {
    key: "collections-table",
    title: "Collections",
    description: "Table configuration for the future Collections CMS listing.",
    columns: [
      {
        key: "title_en",
        label: "Collection",
        type: "text",
        sortable: true,
        searchable: true,
        width: "30%",
        description: "Primary English collection title.",
      },
      {
        key: "title_ar",
        label: "Arabic Title",
        type: "text",
        sortable: true,
        searchable: true,
        width: "24%",
      },
      {
        key: "description_en",
        label: "Description",
        type: "text",
        searchable: true,
        width: "28%",
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
      {
        key: "updated_at",
        label: "Updated",
        type: "datetime",
        sortable: true,
        width: "18%",
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
      field: "title_en",
      direction: "asc",
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
    emptyTitle: "No collections available",
    emptyDescription: "Collections will appear when future CMS data access is connected.",
  },
};