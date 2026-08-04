import Link from "next/link";
import type { Service } from "@/types";

import { DataTable, type DataTableColumn } from "./DataTable";
import { ServiceStatusBadge } from "./ServiceStatusBadge";

export interface ServicesTableProps {
  readonly services: readonly Service[];
  readonly archiveAction?: (formData: FormData) => void | Promise<void>;
  readonly restoreAction?: (formData: FormData) => void | Promise<void>;
  readonly mode?: "active" | "archived";
}

function formatValue(value?: string | number | null): string {
  return value === undefined || value === null || value === "" ? "Not configured" : String(value);
}

function getFeatureCount(service: Service): number {
  return service.features_en.length;
}

function createServiceColumns(
  archiveAction: ServicesTableProps["archiveAction"],
  restoreAction: ServicesTableProps["restoreAction"],
  mode: NonNullable<ServicesTableProps["mode"]>,
): readonly DataTableColumn<Service>[] {
  return [
  {
    key: "title",
    header: "Title",
    render: (service) => (
      <div>
        <strong>{service.title_en}</strong>
        <br />
        <span dir="rtl">{service.title_ar}</span>
      </div>
    )
  },
  {
    key: "slug",
    header: "Slug",
    render: (service) => formatValue(service.slug)
  },
  {
    key: "visibility_status",
    header: "Visibility",
    render: (service) => <ServiceStatusBadge value={service.visibility_status} />
  },
  {
    key: "feature_count",
    header: "Features",
    render: (service) => getFeatureCount(service)
  },
  {
    key: "actions",
    header: "Actions",
    render: (service) => (
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <Link className="admin-inline-link" href={`/admin/services/${service.id}/edit`}>Edit</Link>
        <Link className="admin-inline-link" href={`/services#${service.slug}`}>View</Link>
        {mode === "active" ? (
          <form action={archiveAction}>
            <input type="hidden" name="serviceId" value={service.id} />
            <button type="submit" disabled={!archiveAction}>Archive</button>
          </form>
        ) : (
          <form action={restoreAction}>
            <input type="hidden" name="serviceId" value={service.id} />
            <button type="submit" disabled={!restoreAction}>Restore</button>
          </form>
        )}
      </div>
    )
  }
];
}

export function ServicesTable({ services, archiveAction, restoreAction, mode = "active" }: ServicesTableProps) {
  const serviceColumns = createServiceColumns(archiveAction, restoreAction, mode);

  return (
    <DataTable
      caption={mode === "archived" ? "Archived services" : "Services"}
      columns={serviceColumns}
      rows={services}
      getRowKey={(service) => service.id}
      emptyTitle={mode === "archived" ? "No services are currently archived." : "No service records are currently available."}
      emptyDescription={mode === "archived" ? "Archived records will appear here after they are removed from the live site." : "Service records will appear here when they are ready."}
    />
  );
}