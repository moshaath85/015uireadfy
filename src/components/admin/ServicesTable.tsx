import Link from "next/link";
import type { Service } from "@/types";

import { DataTable, type DataTableColumn } from "./DataTable";
import { ServiceStatusBadge } from "./ServiceStatusBadge";

export interface ServicesTableProps {
  readonly services: readonly Service[];
  readonly archiveAction?: (formData: FormData) => void | Promise<void>;
}

function formatValue(value?: string | number | null): string {
  return value === undefined || value === null || value === "" ? "Not configured" : String(value);
}

function getFeatureCount(service: Service): number {
  return service.features_en.length;
}

function createServiceColumns(archiveAction?: ServicesTableProps["archiveAction"]): readonly DataTableColumn<Service>[] {
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
        <form action={archiveAction}>
          <input type="hidden" name="serviceId" value={service.id} />
          <button type="submit" disabled={!archiveAction}>Archive</button>
        </form>
      </div>
    )
  }
];
}

export function ServicesTable({ services, archiveAction }: ServicesTableProps) {
  const serviceColumns = createServiceColumns(archiveAction);

  return (
    <DataTable
      caption="Services"
      columns={serviceColumns}
      rows={services}
      getRowKey={(service) => service.id}
      emptyTitle="No service records are currently available."
      emptyDescription="Service records will appear here when they are ready."
    />
  );
}