import { AdminShell } from "@/components/admin";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { SearchBar } from "@/components/admin/SearchBar";
import { settingsRepository } from "@/lib/repositories/settings";

interface SettingsRow {
  readonly id: string;
  readonly section: string;
  readonly label: string;
  readonly value?: string | number | null;
}

function formatValue(value?: string | number | null): string {
  return value === undefined || value === null || value === "" ? "Not configured" : String(value);
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

export default async function AdminSettingsPage() {
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

  return (
    <AdminShell
      title="Settings"
      description="Read-only gallery configuration for future CMS settings management."
    >
      <PageToolbar
        title="Settings"
        description="Read-only gallery configuration for future CMS settings management."
        search={<SearchBar label="Search settings" placeholder="Search settings records" />}
      />
      <DataTable
        caption="Settings"
        columns={settingsColumns}
        rows={settingsRows}
        getRowKey={(row) => row.id}
        emptyTitle="No settings records are currently available."
        emptyDescription="Settings records will appear here when they are ready."
      />
    </AdminShell>
  );
}