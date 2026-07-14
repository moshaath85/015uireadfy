export interface ArtworkStatusBadgeProps {
  readonly label: string;
  readonly value: string;
}

export function ArtworkStatusBadge({ label, value }: ArtworkStatusBadgeProps) {
  return (
    <span
      style={{
        background: "#f7f7f7",
        border: "1px solid #d8d8d8",
        color: "#1f1f1f",
        display: "inline-flex",
        flexDirection: "column",
        gap: "2px",
        lineHeight: 1.4,
        minWidth: "120px",
        padding: "8px 10px"
      }}
    >
      <span
        style={{
          color: "#555",
          fontSize: "11px",
          letterSpacing: "0.06em",
          textTransform: "uppercase"
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "13px",
          overflowWrap: "anywhere"
        }}
      >
        {value}
      </span>
    </span>
  );
}