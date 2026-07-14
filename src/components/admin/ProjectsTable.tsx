import Link from "next/link";
import type { Project } from "@/types";

import { DataTable, type DataTableColumn } from "./DataTable";
import { ProjectStatusBadge } from "./ProjectStatusBadge";

export interface ProjectsTableProps {
  readonly projects: readonly Project[];
  readonly archiveAction?: (formData: FormData) => void | Promise<void>;
}

function formatValue(value?: string | number | null): string {
  return value === undefined || value === null || value === "" ? "Not configured" : String(value);
}

function createProjectColumns(archiveAction?: ProjectsTableProps["archiveAction"]): readonly DataTableColumn<Project>[] {
  return [
  {
    key: "title",
    header: "Title",
    render: (project) => (
      <div>
        <strong>{project.title_en}</strong>
        <br />
        <span dir="rtl">{project.title_ar}</span>
      </div>
    )
  },
  {
    key: "slug",
    header: "Slug",
    render: (project) => formatValue(project.slug)
  },
  {
    key: "client",
    header: "Client",
    render: (project) => (
      <div>
        <span>{formatValue(project.client_en)}</span>
        <br />
        <span dir="rtl">{formatValue(project.client_ar)}</span>
      </div>
    )
  },
  {
    key: "type",
    header: "Type",
    render: (project) => formatValue(project.type)
  },
  {
    key: "year",
    header: "Year",
    render: (project) => formatValue(project.year)
  },
  {
    key: "status",
    header: "Status",
    render: (project) => <ProjectStatusBadge value={project.status} />
  },
  {
    key: "visibility_status",
    header: "Visibility",
    render: (project) => <ProjectStatusBadge value={project.visibility_status} />
  },
  {
    key: "actions",
    header: "Actions",
    render: (project) => (
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <Link className="admin-inline-link" href={`/admin/projects/${project.id}/edit`}>Edit</Link>
        <Link className="admin-inline-link" href={`/projects#${project.slug}`}>View</Link>
        <form action={archiveAction}>
          <input type="hidden" name="projectId" value={project.id} />
          <button type="submit" disabled={!archiveAction}>Archive</button>
        </form>
      </div>
    )
  }
];
}

export function ProjectsTable({ projects, archiveAction }: ProjectsTableProps) {
  const projectColumns = createProjectColumns(archiveAction);

  return (
    <DataTable
      caption="Projects"
      columns={projectColumns}
      rows={projects}
      getRowKey={(project) => project.id}
      emptyTitle="No project records are currently available."
      emptyDescription="Project records will appear here when they are ready."
    />
  );
}