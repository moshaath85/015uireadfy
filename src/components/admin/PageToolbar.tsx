import type { ReactNode } from "react";
import { BulkImportExportPanel } from "@/components/admin/BulkImportExportPanel";
import type { BulkImportModule } from "@/lib/cms/bulk-import-export";

export interface PageToolbarProps {
  readonly title: string;
  readonly description?: string;
  readonly search?: ReactNode;
  readonly action?: ReactNode;
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

export function PageToolbar({ title, description, search, action }: PageToolbarProps) {
  const bulkModule = bulkModuleByTitle[title];

  return (
    <header className="admin-page-toolbar">
      <div className="admin-page-toolbar__content">
        <div className="admin-page-toolbar__heading">
          <h1 className="admin-page-toolbar__title">{title}</h1>
          {description ? (
            <p className="admin-page-toolbar__description">{description}</p>
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