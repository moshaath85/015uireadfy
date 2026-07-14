export interface SettingsFieldProps {
  readonly label: string;
  readonly value?: string | number | null;
}

export function SettingsField({ label, value }: SettingsFieldProps) {
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
          whiteSpace: "pre-wrap"
        }}
      >
        {displayValue}
      </dd>
    </div>
  );
}