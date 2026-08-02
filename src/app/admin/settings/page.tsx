import { AdminShell } from "@/components/admin";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { SearchBar } from "@/components/admin/SearchBar";
import { getCmsModuleCapability } from "@/lib/cms/capabilities/capability-registry";
import { settingsRepository } from "@/lib/repositories/settings";

interface AdminSettingsPageProps {
  readonly searchParams?: Promise<{
    readonly q?: string;
  }>;
}

interface SettingsRow {
  readonly id: string;
  readonly section: string;
  readonly label: string;
  readonly value?: string | number | null;
}

function formatValue(value?: string | number | null): string {
  return value === undefined || value === null || value === "" ? "Not configured" : String(value);
}

function normalize(value?: string | number | null): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim().toLowerCase();
}

function includesSearch(row: SettingsRow, query: string): boolean {
  if (!query) {
    return true;
  }

  return [row.id, row.section, row.label, row.value].some((value) => normalize(value).includes(query));
}

const settingsColumns: readonly DataTableColumn<SettingsRow>[] = [
  {
    key: "section",
    header: "Section",
    render: (row) => row.section
  },
  {
    key: "label",
    header: "Field",
    render: (row) => row.label
  },
  {
    key: "value",
    header: "Value",
    render: (row) => formatValue(row.value)
  }
];

export default async function AdminSettingsPage({ searchParams }: AdminSettingsPageProps) {
  const resolvedSearchParams = await searchParams;
  const capability = getCmsModuleCapability("settings");
  const query = normalize(resolvedSearchParams?.q);
  const settings = await settingsRepository.getSiteSettings();
  const settingsRows: readonly SettingsRow[] = [
    {
      id: "site_name_en",
      section: "Gallery Identity",
      label: "Site name, English",
      value: settings.site_name_en
    },
    {
      id: "site_name_ar",
      section: "Gallery Identity",
      label: "Site name, Arabic",
      value: settings.site_name_ar
    },
    {
      id: "description_en",
      section: "Gallery Identity",
      label: "Description, English",
      value: settings.description_en
    },
    {
      id: "description_ar",
      section: "Gallery Identity",
      label: "Description, Arabic",
      value: settings.description_ar
    },
    {
      id: "contact_email",
      section: "Contact Details",
      label: "Contact email",
      value: settings.contact_email
    },
    {
      id: "contact_phone",
      section: "Contact Details",
      label: "Contact phone",
      value: settings.contact_phone
    },
    {
      id: "address_en",
      section: "Contact Details",
      label: "Address, English",
      value: settings.address_en
    },
    {
      id: "address_ar",
      section: "Contact Details",
      label: "Address, Arabic",
      value: settings.address_ar
    },
    {
      id: "instagram",
      section: "Social Media",
      label: "Instagram",
      value: settings.social_media.instagram
    },
    {
      id: "twitter",
      section: "Social Media",
      label: "Twitter",
      value: settings.social_media.twitter
    },
    {
      id: "facebook",
      section: "Social Media",
      label: "Facebook",
      value: settings.social_media.facebook
    }
  ];
  const filteredSettingsRows = settingsRows.filter((row) => includesSearch(row, query));

  return (
    <AdminShell
      title="Settings"
      description={capability.messaging.listDescription}
    >
      <PageToolbar
        title="Settings"
        capability={capability}
        description={capability.messaging.listDescription}
        search={<SearchBar label="Search settings" placeholder="Search settings records" defaultValue={resolvedSearchParams?.q ?? ""} queryParam="q" />}
      />
      <DataTable
        caption="Settings"
        columns={settingsColumns}
        rows={filteredSettingsRows}
        getRowKey={(row) => row.id}
        emptyTitle="No settings records are currently available."
        emptyDescription={query ? "No settings records match the current search query." : "Settings records are shown when available."}
      />
    </AdminShell>
  );
}
