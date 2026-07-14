import type { TableModuleConfig } from "@/lib/tables";
import { VisibilityStatus, type Artist } from "@/types";

export type ArtistsTableEntity = Artist & Record<string, unknown>;

export const artistsTableConfig: TableModuleConfig<ArtistsTableEntity> = {
  entity: "artists",
  table: {
    key: "artists-table",
    title: "Artists",
    description: "Table configuration for the future Artists CMS listing.",
    columns: [
      {
        key: "name_en",
        label: "Artist",
        type: "text",
        sortable: true,
        searchable: true,
        width: "24%",
        description: "Primary English artist name.",
      },
      {
        key: "name_ar",
        label: "Arabic Name",
        type: "text",
        sortable: true,
        searchable: true,
        width: "18%",
      },
      {
        key: "nationality_en",
        label: "Nationality",
        type: "text",
        sortable: true,
        searchable: true,
        filterable: true,
        width: "16%",
      },
      {
        key: "representation_status",
        label: "Status",
        type: "status",
        sortable: true,
        searchable: true,
        filterable: true,
        width: "14%",
        description: "Maps to future artist representation workflow state.",
      },
      {
        key: "visibility_status",
        label: "Visibility",
        type: "visibility",
        sortable: true,
        filterable: true,
        width: "12%",
        description: "Maps to the public, private, VIP, or hidden visibility status.",
      },
      {
        key: "display_order",
        label: "Order",
        type: "number",
        sortable: true,
        align: "right",
        width: "8%",
      },
      {
        key: "featured",
        label: "Featured",
        type: "boolean",
        sortable: true,
        filterable: true,
        align: "center",
        width: "8%",
      },
      {
        key: "updated_at",
        label: "Updated",
        type: "datetime",
        sortable: true,
        hidden: true,
      },
    ],
    defaultSort: {
      field: "display_order",
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
    emptyTitle: "No artists available",
    emptyDescription: "Artists will appear when future CMS data access is connected.",
  },
};