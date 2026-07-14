import type { Media } from "@/types";

import { MediaCard } from "./MediaCard";

export interface MediaGridProps {
  readonly media: Media[];
  readonly duplicateReasons?: ReadonlyMap<string, string>;
}

export function MediaGrid({ media, duplicateReasons = new Map() }: MediaGridProps) {
  if (media.length === 0) {
    return (
      <section
        aria-label="Media library"
        style={{
          background: "#ffffff",
          border: "1px solid #d8d8d8",
          padding: "24px"
        }}
      >
        <p
          style={{
            color: "#555",
            fontSize: "14px",
            lineHeight: 1.6,
            margin: 0
          }}
        >
          No media records match the current library view.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Media library">
      <div
        style={{
          display: "grid",
          gap: "20px",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"
        }}
      >
        {media.map((item) => (
          <MediaCard key={item.id} media={item} duplicateReason={duplicateReasons.get(item.id)} />
        ))}
      </div>
    </section>
  );
}