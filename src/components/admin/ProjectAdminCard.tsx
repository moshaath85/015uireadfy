import type { Project } from "@/types";

import { ProjectStatusBadge } from "./ProjectStatusBadge";

export interface ProjectAdminCardProps {
  readonly project: Project;
}

function DetailItem({
  label,
  value
}: {
  readonly label: string;
  readonly value?: string | number | null;
}) {
  const displayValue =
    value === undefined || value === null || value === "" ? "Not configured" : value;

  return (
    <div
      style={{
        display: "grid",
        gap: "6px"
      }}
    >
      <dt
        style={{
          color: "#555",
          fontSize: "12px",
          letterSpacing: "0.06em",
          lineHeight: 1.4,
          textTransform: "uppercase"
        }}
      >
        {label}
      </dt>
      <dd
        style={{
          color: "#1f1f1f",
          fontSize: "14px",
          lineHeight: 1.6,
          margin: 0,
          overflowWrap: "anywhere"
        }}
      >
        {displayValue}
      </dd>
    </div>
  );
}

export function ProjectAdminCard({ project }: ProjectAdminCardProps) {
  return (
    <article
      style={{
        background: "#ffffff",
        border: "1px solid #d8d8d8",
        padding: "20px"
      }}
    >
      <header
        style={{
          alignItems: "start",
          borderBottom: "1px solid #e6e6e6",
          display: "grid",
          gap: "14px",
          gridTemplateColumns: "minmax(0, 1fr)",
          marginBottom: "16px",
          paddingBottom: "14px"
        }}
      >
        <div>
          <p
            style={{
              color: "#555",
              fontSize: "12px",
              letterSpacing: "0.06em",
              lineHeight: 1.4,
              margin: "0 0 6px",
              textTransform: "uppercase"
            }}
          >
            {project.id}
          </p>
          <h2
            style={{
              color: "#1f1f1f",
              fontSize: "18px",
              fontWeight: 500,
              lineHeight: 1.4,
              margin: 0
            }}
          >
            {project.title_en}
          </h2>
          <p
            dir="rtl"
            style={{
              color: "#555",
              fontSize: "14px",
              lineHeight: 1.6,
              margin: "6px 0 0"
            }}
          >
            {project.title_ar}
          </p>
        </div>

        <div
          aria-label="Project status summary"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px"
          }}
        >
          <ProjectStatusBadge value={project.status} />
          <ProjectStatusBadge value={project.visibility_status} />
        </div>
      </header>

      <dl
        style={{
          display: "grid",
          gap: "14px",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          margin: 0
        }}
      >
        <DetailItem label="Title" value={project.title_en} />
        <DetailItem label="Slug" value={project.slug} />
        <DetailItem label="Client" value={project.client_en} />
        <DetailItem label="Type" value={project.type} />
        <DetailItem label="Year" value={project.year} />
        <DetailItem label="Status" value={project.status} />
        <DetailItem label="Visibility" value={project.visibility_status} />
      </dl>
    </article>
  );
}