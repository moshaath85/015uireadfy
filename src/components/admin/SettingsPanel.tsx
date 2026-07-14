import type { Settings } from "@/types";

import { SettingsField } from "./SettingsField";
import { SettingsSection } from "./SettingsSection";

export interface SettingsPanelProps {
  readonly settings: Settings;
}

export function SettingsPanel({ settings }: SettingsPanelProps) {
  return (
    <div
      style={{
        display: "grid",
        gap: "24px"
      }}
    >
      <SettingsSection
        title="Gallery Identity"
        description="Primary public naming and institutional description."
      >
        <SettingsField label="Site name, English" value={settings.site_name_en} />
        <SettingsField label="Site name, Arabic" value={settings.site_name_ar} />
        <SettingsField label="Description, English" value={settings.description_en} />
        <SettingsField label="Description, Arabic" value={settings.description_ar} />
      </SettingsSection>

      <SettingsSection
        title="Contact Details"
        description="Current public contact information used by the gallery."
      >
        <SettingsField label="Contact email" value={settings.contact_email} />
        <SettingsField label="Contact phone" value={settings.contact_phone} />
        <SettingsField label="Address, English" value={settings.address_en} />
        <SettingsField label="Address, Arabic" value={settings.address_ar} />
      </SettingsSection>

      <SettingsSection
        title="Social Media"
        description="Read-only social channel references prepared for later editing."
      >
        <SettingsField label="Instagram" value={settings.social_media.instagram} />
        <SettingsField label="Twitter" value={settings.social_media.twitter} />
        <SettingsField label="Facebook" value={settings.social_media.facebook} />
      </SettingsSection>
    </div>
  );
}