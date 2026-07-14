import { StatusBadge, type StatusBadgeValue } from "./StatusBadge";

export interface NewsStatusBadgeProps {
  readonly value: string;
}

function isStatusBadgeValue(value: string): value is StatusBadgeValue {
  return [
    "public",
    "private",
    "hidden",
    "featured",
    "draft",
    "published",
    "archived",
    "available",
    "reserved",
    "sold"
  ].includes(value);
}

function formatStatus(value: string): string {
  return value
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function NewsStatusBadge({ value }: NewsStatusBadgeProps) {
  if (isStatusBadgeValue(value)) {
    return <StatusBadge status={value} />;
  }

  return (
    <span className="admin-status-badge">
      <span className="admin-status-badge__label">{formatStatus(value)}</span>
    </span>
  );
}