import type { Artist } from "@/types";

import { ArtistAdminCard } from "./ArtistAdminCard";

export interface ArtistsTableProps {
  readonly artists: Artist[];
}

export function ArtistsTable({ artists }: ArtistsTableProps) {
  if (artists.length === 0) {
    return (
      <section
        aria-label="Artists"
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
          No artist records are currently available.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Artists">
      <div
        style={{
          display: "grid",
          gap: "16px"
        }}
      >
        {artists.map((artist) => (
          <ArtistAdminCard key={artist.id} artist={artist} />
        ))}
      </div>
    </section>
  );
}