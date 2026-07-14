import type { Collection } from "@/types";

import { CollectionAdminCard } from "./CollectionAdminCard";

export interface CollectionsTableProps {
  readonly collections: Collection[];
}

export function CollectionsTable({ collections }: CollectionsTableProps) {
  if (collections.length === 0) {
    return (
      <section
        aria-label="Collections"
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
          No collection records are currently available.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Collections">
      <div
        style={{
          display: "grid",
          gap: "16px"
        }}
      >
        {collections.map((collection) => (
          <CollectionAdminCard key={collection.id} collection={collection} />
        ))}
      </div>
    </section>
  );
}