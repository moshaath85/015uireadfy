import type { Artwork } from "@/types";

import { ArtworkStatusBadge } from "./ArtworkStatusBadge";

export interface ArtworkAdminCardProps {
  readonly artwork: Artwork;
}

function formatBooleanStatus(value: boolean): string {
  return value ? "Yes" : "No";
}

function formatPriceValue(artwork: Artwork): string {
  if (artwork.price === undefined || artwork.price === null) {
    return "Not configured";
  }

  return `${artwork.currency} ${artwork.price}`;
}

function DetailItem({
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

export function ArtworkAdminCard({ artwork }: ArtworkAdminCardProps) {
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
            {artwork.id}
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
            {artwork.title_en}
          </h2>
          <p
            dir="rtl"
            style={{
              color: "#555",
              fontSize: "14px",
              lineHeight: 1.6,
              margin: "6px 0 0"
            }}
          >
            {artwork.title_ar}
          </p>
        </div>

        <div
          aria-label="Artwork status summary"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px"
          }}
        >
          <ArtworkStatusBadge label="Availability" value={artwork.availability_status} />
          <ArtworkStatusBadge label="Price status" value={artwork.price_status} />
          <ArtworkStatusBadge label="Visibility" value={artwork.visibility_status} />
          <ArtworkStatusBadge label="Featured" value={formatBooleanStatus(artwork.featured)} />
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
        <DetailItem label="Year" value={artwork.year} />
        <DetailItem label="Availability status" value={artwork.availability_status} />
        <DetailItem label="Price status" value={artwork.price_status} />
        <DetailItem label="Price" value={formatPriceValue(artwork)} />
        <DetailItem label="Visibility" value={artwork.visibility_status} />
        <DetailItem label="Featured" value={formatBooleanStatus(artwork.featured)} />
        <DetailItem
          label="Featured homepage"
          value={formatBooleanStatus(artwork.is_featured_homepage)}
        />
        <DetailItem label="Display order" value={artwork.display_order} />
      </dl>
    </article>
  );
}