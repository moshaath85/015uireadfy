import type { ReactNode } from "react";

export interface SettingsSectionProps {
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
}

export function SettingsSection({
  title,
  description,
  children
}: SettingsSectionProps) {
  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #d8d8d8",
        padding: "24px"
      }}
    >
      <header
        style={{
          borderBottom: "1px solid #e6e6e6",
          marginBottom: "20px",
          paddingBottom: "16px"
        }}
      >
        <h2
          style={{
            color: "#1f1f1f",
            fontSize: "18px",
            fontWeight: 500,
            lineHeight: 1.3,
            margin: 0
          }}
        >
          {title}
        </h2>
        {description ? (
          <p
            style={{
              color: "#555",
              fontSize: "14px",
              lineHeight: 1.6,
              margin: "8px 0 0"
            }}
          >
            {description}
          </p>
        ) : null}
      </header>

      <dl
        style={{
          display: "grid",
          gap: "16px",
          margin: 0
        }}
      >
        {children}
      </dl>
    </section>
  );
}