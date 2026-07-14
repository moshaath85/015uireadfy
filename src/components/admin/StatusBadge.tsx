export type StatusBadgeValue =
  | "public"
  | "private"
  | "hidden"
  | "featured"
  | "draft"
  | "published"
  | "archived"
  | "available"
  | "reserved"
  | "sold";

export interface StatusBadgeProps {
  readonly status: StatusBadgeValue;
  readonly label?: string;
}

function formatStatus(status: StatusBadgeValue): string {
  return status
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function StatusBadge({ status, label = formatStatus(status) }: StatusBadgeProps) {
  return (
    <span className={`admin-status-badge admin-status-badge--${status}`}>
      <span className="admin-status-badge__label">{label}</span>
    </span>
  );
}