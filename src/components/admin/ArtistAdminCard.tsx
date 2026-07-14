import Link from "next/link";
import type { Artist } from "@/types";

import { ArtistStatusBadge } from "./ArtistStatusBadge";

export interface ArtistAdminCardProps {
  readonly artist: Artist;
}

function formatBooleanStatus(value: boolean): string {
  return value ? "Yes" : "No";
}

function hasValue(value?: string | number | null): boolean {
  return value !== undefined && value !== null && value !== "";
}

function getLanguageSummary(artist: Artist): string {
  const englishReady = hasValue(artist.name_en) && hasValue(artist.bio_en) && hasValue(artist.nationality_en);
  const arabicReady = hasValue(artist.name_ar) && hasValue(artist.bio_ar) && hasValue(artist.nationality_ar);

  if (englishReady && arabicReady) {
    return "Arabic and English ready";
  }

  if (englishReady) {
    return "English ready, Arabic needs review";
  }

  if (arabicReady) {
    return "Arabic ready, English needs review";
  }

  return "Needs language content";
}

function DetailItem({
  label,
  value
}: {
  readonly label: string;
  readonly value?: string | number | null;
}) {
  const displayValue =
    value === undefined || value === null || value === "" ? "Not set" : value;

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

export function ArtistAdminCard({ artist }: ArtistAdminCardProps) {
  return (
    <article
      style={{
        background: "#ffffff",
        border: "1px solid #d8d8d8",
        padding: "20px"
      }}
    >
      <header
        style={{
          alignItems: "start",
          borderBottom: "1px solid #e6e6e6",
          display: "grid",
          gap: "14px",
          gridTemplateColumns: "minmax(0, 1fr)",
          marginBottom: "16px",
          paddingBottom: "14px"
        }}
      >
        <div>
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
            Artist
          </p>
          <h2
            style={{
              color: "#1f1f1f",
              fontSize: "18px",
              fontWeight: 500,
              lineHeight: 1.4,
              margin: 0
            }}
          >
            {artist.name_en || artist.name_ar}
          </h2>
          <p
            style={{
              color: "#555",
              fontSize: "14px",
              lineHeight: 1.6,
              margin: "6px 0 0"
            }}
          >
            {getLanguageSummary(artist)}
          </p>
        </div>

        <div
          aria-label="Artist status summary"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px"
          }}
        >
          <ArtistStatusBadge label="Representation" value={artist.representation_status} />
          <ArtistStatusBadge label="Visibility" value={artist.visibility_status} />
          <ArtistStatusBadge label="Featured" value={formatBooleanStatus(artist.featured)} />
        </div>

        <div
          aria-label="Artist actions"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >
          <Link href={`/admin/artists/${artist.id}/edit`} style={{ color: "#1f1f1f", fontSize: "14px" }}>
            Edit
          </Link>
          <Link href={`/artists/${artist.slug}`} style={{ color: "#1f1f1f", fontSize: "14px" }}>
            View
          </Link>
        </div>
      </header>

      <dl
        style={{
          display: "grid",
          gap: "14px",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          margin: 0
        }}
      >
        <DetailItem label="Nationality" value={artist.nationality_en || artist.nationality_ar} />
        <DetailItem label="Language Status" value={getLanguageSummary(artist)} />
        <DetailItem label="Visibility" value={artist.visibility_status} />
      </dl>
    </article>
  );
}
