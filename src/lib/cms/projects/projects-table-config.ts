import type { TableModuleConfig } from "@/lib/tables";
import { VisibilityStatus, type Project } from "@/types";

export type ProjectsTableEntity = Project & Record<string, unknown>;

export const projectsTableConfig: TableModuleConfig<ProjectsTableEntity> = {
  entity: "projects",
  table: {
    key: "projects-table",
    title: "Projects",
    description: "Table configuration for the future Projects CMS listing.",
    columns: [
      {
        key: "title_en",
        label: "Project",
        type: "text",
        sortable: true,
        searchable: true,
        width: "24%",
        description: "Primary English project title.",
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
        key: "client_en",
        label: "Client",
        type: "text",
        sortable: true,
        searchable: true,
        filterable: true,
        width: "18%",
        description: "Primary English client name.",
      },
      {
        key: "client_ar",
        label: "Arabic Client",
        type: "text",
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
      },
      {
        key: "year",
        label: "Year",
        type: "number",
        sortable: true,
        filterable: true,
        align: "right",
        width: "10%",
      },
      {
        key: "status",
        label: "Status",
        type: "status",
        sortable: true,
        searchable: true,
        filterable: true,
        width: "14%",
        description: "Maps to the future project workflow state.",
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
      field: "year",
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
    emptyTitle: "No projects available",
    emptyDescription: "Projects will appear when future CMS data access is connected.",
  },
};