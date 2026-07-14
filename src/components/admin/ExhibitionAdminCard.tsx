import type { Exhibition } from "@/types";

import { ExhibitionStatusBadge } from "./ExhibitionStatusBadge";

export interface ExhibitionAdminCardProps {
  readonly exhibition: Exhibition;
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

export function ExhibitionAdminCard({ exhibition }: ExhibitionAdminCardProps) {
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
            {exhibition.id}
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
            {exhibition.title_en}
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
            {exhibition.title_ar}
          </p>
        </div>

        <div
          aria-label="Exhibition status summary"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px"
          }}
        >
          <ExhibitionStatusBadge value={exhibition.visibility_status} />
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
        <DetailItem label="Title" value={exhibition.title_en} />
        <DetailItem label="Slug" value={exhibition.slug} />
        <DetailItem label="Venue" value={exhibition.venue_en} />
        <DetailItem label="Start date" value={exhibition.start_date} />
        <DetailItem label="End date" value={exhibition.end_date} />
        <DetailItem label="Visibility" value={exhibition.visibility_status} />
      </dl>
    </article>
  );
}