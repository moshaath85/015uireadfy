"use client";

import type { ReactNode } from "react";

export interface ManagedRelationshipItem {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly metadata?: ReactNode;
  readonly order?: number;
}

export interface RelationshipManagerProps {
  readonly title: string;
  readonly items: readonly ManagedRelationshipItem[];
  readonly emptyMessage?: string;
  readonly removeLabel?: string;
  readonly moveUpLabel?: string;
  readonly moveDownLabel?: string;
  readonly disabled?: boolean;
  readonly showMetadata?: boolean;
  readonly onRemove?: (itemId: string) => void;
  readonly onMoveUp?: (itemId: string) => void;
  readonly onMoveDown?: (itemId: string) => void;
}

export function RelationshipManager({
  title,
  items,
  emptyMessage = "No related entities added yet.",
  removeLabel = "Remove",
  moveUpLabel = "Move up",
  moveDownLabel = "Move down",
  disabled = false,
  showMetadata = true,
  onRemove,
  onMoveUp,
  onMoveDown,
}: RelationshipManagerProps) {
  return (
    <section
      aria-label={title}
      style={{
        background: "#ffffff",
        border: "1px solid #d8d8d8",
        display: "grid",
        gap: "12px",
        padding: "16px",
      }}
    >
      <header>
        <h3 style={{ margin: 0 }}>{title}</h3>
      </header>

      {items.length === 0 ? <p style={{ color: "#666", margin: 0 }}>{emptyMessage}</p> : null}

      {items.length > 0 ? (
        <ol style={{ display: "grid", gap: "10px", margin: 0, paddingLeft: "20px" }}>
          {items.map((item, index) => {
            const firstItem = index === 0;
            const lastItem = index === items.length - 1;

            return (
              <li
                key={item.id}
                style={{
                  border: "1px solid #d8d8d8",
                  display: "grid",
                  gap: "8px",
                  padding: "10px 12px",
                }}
              >
                <div>
                  <strong>{item.label}</strong>
                  {item.description ? <p style={{ color: "#555", margin: "4px 0 0" }}>{item.description}</p> : null}
                  {showMetadata && item.metadata ? <div style={{ marginTop: "6px" }}>{item.metadata}</div> : null}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  <button
                    disabled={disabled || firstItem}
                    onClick={() => onMoveUp?.(item.id)}
                    type="button"
                  >
                    {moveUpLabel}
                  </button>
                  <button
                    disabled={disabled || lastItem}
                    onClick={() => onMoveDown?.(item.id)}
                    type="button"
                  >
                    {moveDownLabel}
                  </button>
                  <button disabled={disabled} onClick={() => onRemove?.(item.id)} type="button">
                    {removeLabel}
                  </button>
                  {item.order !== undefined ? <span style={{ color: "#666" }}>Order: {item.order}</span> : null}
                </div>
              </li>
            );
          })}
        </ol>
      ) : null}
    </section>
  );
}
