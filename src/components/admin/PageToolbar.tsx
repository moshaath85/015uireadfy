import type { ReactNode } from "react";
import { BulkImportExportPanel } from "@/components/admin/BulkImportExportPanel";
import { getCmsOperationalStateLabel } from "@/lib/cms/capabilities/capability-registry";
import type { CmsModuleCapabilityDefinition } from "@/lib/cms/capabilities/capability-types";
import type { BulkImportModule } from "@/lib/cms/bulk-import-export";

export interface PageToolbarProps {
  readonly title: string;
  readonly description?: string;
  readonly search?: ReactNode;
  readonly action?: ReactNode;
  readonly capability?: CmsModuleCapabilityDefinition;
}

const bulkModuleByTitle: Record<string, { readonly module: BulkImportModule; readonly label: string }> = {
  Artists: { module: "artists", label: "Artists" },
  Artworks: { module: "artworks", label: "Artworks" },
  Collections: { module: "collections", label: "Collections" },
  Exhibitions: { module: "exhibitions", label: "Exhibitions" },
  Projects: { module: "projects", label: "Projects" },
  Services: { module: "services", label: "Services" },
  News: { module: "news", label: "News" },
  Newss: { module: "news", label: "News" },
  Publications: { module: "publications", label: "Publications" },
};

function describeAvailability(capability: CmsModuleCapabilityDefinition): string {
  const entries: string[] = [];

  entries.push(capability.capabilities.create ? "Create available" : "Create unavailable");
  entries.push(capability.capabilities.update ? "Update available" : "Update unavailable");
  entries.push(capability.capabilities.archive ? "Archive available" : "Archive unavailable");
  entries.push(capability.capabilities.bulk ? "Bulk available" : "Bulk unavailable");

  return entries.join("; ");
}

function buildOperationalTruth(capability: CmsModuleCapabilityDefinition): string {
  const stateLabel = getCmsOperationalStateLabel(capability.state);

  if (capability.state === "operational") {
    return `${stateLabel}: ${describeAvailability(capability)}.`;
  }

  if (capability.state === "partial") {
    return `${stateLabel}: some actions are unavailable. ${describeAvailability(capability)}.`;
  }

  if (capability.state === "prepared_only") {
    return `${stateLabel}: validation and preparation flow only. ${describeAvailability(capability)}.`;
  }

  return `${stateLabel}: viewing enabled with limited editing actions. ${describeAvailability(capability)}.`;
}

export function PageToolbar({ title, description, search, action, capability }: PageToolbarProps) {
  const bulkModule = bulkModuleByTitle[title];
  const operationalTruth = capability ? buildOperationalTruth(capability) : undefined;

  return (
    <header className="admin-page-toolbar">
      <div className="admin-page-toolbar__content">
        <div className="admin-page-toolbar__heading">
          <h1 className="admin-page-toolbar__title">{title}</h1>
          {description ? (
            <p className="admin-page-toolbar__description">{description}</p>
          ) : null}
          {operationalTruth ? (
            <p className="admin-page-toolbar__description">{operationalTruth}</p>
          ) : null}
        </div>

        <div className="admin-page-toolbar__controls">
          {search ? <div className="admin-page-toolbar__search">{search}</div> : null}
          {action ? <div className="admin-page-toolbar__action">{action}</div> : null}
          {bulkModule ? (
            <div className="admin-page-toolbar__action">
              <BulkImportExportPanel module={bulkModule.module} label={bulkModule.label} />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
