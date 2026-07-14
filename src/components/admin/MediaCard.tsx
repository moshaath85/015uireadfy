import type { Media } from "@/types";

import { MediaDetails } from "./MediaDetails";

export interface MediaCardProps {
  readonly media: Media;
  readonly duplicateReason?: string;
}

function formatLifecycleValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function getMediaLifecycleState(media: Media): "active" | "archived" | "soft_deleted" {
  const record = media as Media & { archived_at?: unknown; deleted_at?: unknown };

  if (formatLifecycleValue(record.deleted_at)) {
    return "soft_deleted";
  }

  if (formatLifecycleValue(record.archived_at)) {
    return "archived";
  }

  return "active";
}

export function MediaCard({ media, duplicateReason }: MediaCardProps) {
  const lifecycleState = getMediaLifecycleState(media);
  const isImage = media.type === "image" || media.mime_type.startsWith("image/");

  return (
    <article
      style={{
        background: "#ffffff",
        border: duplicateReason ? "1px solid #9a6a00" : "1px solid #d8d8d8",
        padding: "20px"
      }}
    >
      <header
        style={{
          borderBottom: "1px solid #e6e6e6",
          marginBottom: "16px",
          paddingBottom: "12px"
        }}
      >
        <p
          style={{
            color: "#555",
            fontSize: "12px",
            letterSpacing: "0.06em",
            lineHeight: 1.4,
            margin: "0 0 6px",
            textTransform: "uppercase"
          }}
        >
          {media.type} · {lifecycleState.replace("_", " ")}
        </p>
        <h2
          style={{
            color: "#1f1f1f",
            fontSize: "16px",
            fontWeight: 500,
            lineHeight: 1.4,
            margin: 0,
            overflowWrap: "anywhere"
          }}
        >
          {media.id}
        </h2>
      </header>

      {isImage ? (
        <figure
          style={{
            background: media.dominant_color ?? "#f4f1ec",
            margin: "0 0 16px",
            minHeight: "180px",
            overflow: "hidden"
          }}
        >
          <img
            src={media.url}
            alt={media.alt_en}
            loading="lazy"
            style={{
              aspectRatio: "4 / 3",
              display: "block",
              height: "100%",
              objectFit: "cover",
              width: "100%"
            }}
          />
        </figure>
      ) : (
        <div
          style={{
            background: "#f4f1ec",
            color: "#4c4c4c",
            fontSize: "13px",
            marginBottom: "16px",
            padding: "28px 16px",
            textAlign: "center"
          }}
        >
          Preview unavailable for {media.mime_type}
        </div>
      )}

      {duplicateReason ? (
        <p
          style={{
            background: "#fff8e1",
            color: "#5f4300",
            fontSize: "13px",
            lineHeight: 1.5,
            margin: "0 0 16px",
            padding: "10px 12px"
          }}
        >
          Duplicate candidate: {duplicateReason}
        </p>
      ) : null}

      <MediaDetails media={media} />

      <footer
        aria-label="Prepared media actions"
        style={{
          borderTop: "1px solid #e6e6e6",
          color: "#555",
          fontSize: "12px",
          lineHeight: 1.5,
          marginTop: "16px",
          paddingTop: "12px"
        }}
      >
        Prepared actions: replace, archive, restore, soft delete. Production writes remain disabled.
      </footer>
    </article>
  );
}