import type { TableModuleConfig } from "@/lib/tables";
import { VisibilityStatus, type Service } from "@/types";

export type ServicesTableEntity = Service & Record<string, unknown>;

export const servicesTableConfig: TableModuleConfig<ServicesTableEntity> = {
  entity: "services",
  table: {
    key: "services-table",
    title: "Services",
    description: "Table configuration for the future Services CMS listing.",
    columns: [
      {
        key: "title_en",
        label: "Service",
        type: "text",
        sortable: true,
        searchable: true,
        width: "28%",
        description: "Primary English service title.",
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
        key: "features_en",
        label: "Features",
        type: "tags",
        searchable: true,
        width: "28%",
        description: "Primary English feature list for the service.",
      },
      {
        key: "features_ar",
        label: "Arabic Features",
        type: "tags",
        searchable: true,
        hidden: true,
      },
      {
        key: "price_info",
        label: "Price Info",
        type: "json",
        width: "22%",
        description: "Structured future pricing metadata.",
      },
      {
        key: "visibility_status",
        label: "Visibility",
        type: "visibility",
        sortable: true,
        filterable: true,
        width: "22%",
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
    emptyTitle: "No services available",
    emptyDescription: "Services will appear when future CMS data access is connected.",
  },
};