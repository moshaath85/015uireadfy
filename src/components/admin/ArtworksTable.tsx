import type { Artwork } from "@/types";

import { ArtworkAdminCard } from "./ArtworkAdminCard";

export interface ArtworksTableProps {
  readonly artworks: Artwork[];
}

export function ArtworksTable({ artworks }: ArtworksTableProps) {
  if (artworks.length === 0) {
    return (
      <section
        aria-label="Artworks"
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
          No artwork records are currently available.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Artworks">
      <div
        style={{
          display: "grid",
          gap: "16px"
        }}
      >
        {artworks.map((artwork) => (
          <ArtworkAdminCard key={artwork.id} artwork={artwork} />
        ))}
      </div>
    </section>
  );
}