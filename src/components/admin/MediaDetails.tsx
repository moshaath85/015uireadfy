import type { Media } from "@/types";

export interface MediaDetailsProps {
  readonly media: Media;
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "Not configured";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDimensions(width?: number, height?: number): string {
  if (!width || !height) {
    return "Not configured";
  }

  return `${width} × ${height}`;
}

function DetailRow({
  label,
  value
}: {
  readonly label: string;
  readonly value?: string | number | null;
}) {
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
          overflowWrap: "anywhere"
        }}
      >
        {displayValue}
      </dd>
    </div>
  );
}

export function MediaDetails({ media }: MediaDetailsProps) {
  return (
    <dl
      style={{
        display: "grid",
        gap: "14px",
        margin: 0
      }}
    >
      <DetailRow label="URL" value={media.url} />
      <DetailRow label="Type" value={media.type} />
      <DetailRow label="MIME type" value={media.mime_type} />
      <DetailRow label="File size" value={formatFileSize(media.file_size)} />
      <DetailRow
        label="Dimensions"
        value={formatDimensions(media.width, media.height)}
      />
      <DetailRow label="Alt text, English" value={media.alt_en} />
      <DetailRow label="Alt text, Arabic" value={media.alt_ar} />
      <DetailRow label="Storage path" value={media.storage_path} />
    </dl>
  );
}