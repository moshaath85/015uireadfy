"use client";

import { useId, type CSSProperties, type ReactNode } from "react";

export type RelationshipSelectionMode = "single" | "multiple";

export interface RelationshipPickerItem {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly metadata?: ReactNode;
  readonly disabled?: boolean;
}

export interface RelationshipPickerProps {
  readonly id?: string;
  readonly label?: string;
  readonly title: string;
  readonly items: readonly RelationshipPickerItem[];
  readonly mode?: RelationshipSelectionMode;
  readonly searchValue?: string;
  readonly searchPlaceholder?: string;
  readonly selectedIds?: readonly string[];
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly emptyMessage?: string;
  readonly selectedTitle?: string;
  readonly onSearchChange?: (value: string) => void;
  readonly onSelectionChange?: (nextSelectedIds: readonly string[]) => void;
}

const cardStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d8d8d8",
  display: "grid",
  gap: "12px",
  padding: "16px",
};

export function RelationshipPicker({
  id,
  label = "Search",
  title,
  items,
  mode = "multiple",
  searchValue = "",
  searchPlaceholder = "Search related entities",
  selectedIds = [],
  disabled = false,
  loading = false,
  emptyMessage = "No entities available.",
  selectedTitle = "Selected",
  onSearchChange,
  onSelectionChange,
}: RelationshipPickerProps) {
  const fallbackId = useId();
  const baseId = id ?? fallbackId;
  const sectionTitleId = `${baseId}-title`;
  const searchInputId = `${baseId}-search`;
  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const isDisabled = disabled || loading;

  function handleToggle(itemId: string) {
    if (isDisabled || !onSelectionChange) {
      return;
    }

    if (mode === "single") {
      const isSelected = selectedIds.includes(itemId);
      onSelectionChange(isSelected ? [] : [itemId]);
      return;
    }

    const isSelected = selectedIds.includes(itemId);
    const nextSelectedIds = isSelected
      ? selectedIds.filter((selectedId) => selectedId !== itemId)
      : [...selectedIds, itemId];

    onSelectionChange(nextSelectedIds);
  }

  return (
    <section aria-labelledby={sectionTitleId} style={cardStyle}>
      <header>
        <h3 id={sectionTitleId} style={{ margin: 0 }}>{title}</h3>
      </header>

      <div style={{ display: "grid", gap: "8px" }}>
        <label htmlFor={searchInputId}>{label}</label>
        <input
          disabled={isDisabled}
          id={searchInputId}
          onChange={(event) => onSearchChange?.(event.currentTarget.value)}
          placeholder={searchPlaceholder}
          type="search"
          value={searchValue}
        />
      </div>

      {loading ? (
        <p aria-live="polite" role="status" style={{ margin: 0 }}>
          Loading entities...
        </p>
      ) : null}

      {!loading && items.length === 0 ? <p style={{ margin: 0 }}>{emptyMessage}</p> : null}

      {!loading && items.length > 0 ? (
        <ul
          aria-label={mode === "single" ? "Single selection" : "Multiple selection"}
          style={{ display: "grid", gap: "8px", listStyle: "none", margin: 0, padding: 0 }}
        >
          {items.map((item) => {
            const checked = selectedIds.includes(item.id);
            const itemDisabled = isDisabled || item.disabled;

            return (
              <li key={item.id}>
                <button
                  aria-pressed={checked}
                  disabled={itemDisabled}
                  onClick={() => handleToggle(item.id)}
                  style={{
                    alignItems: "start",
                    background: checked ? "#f4f1ec" : "#ffffff",
                    border: checked ? "1px solid #7a6750" : "1px solid #d8d8d8",
                    cursor: itemDisabled ? "not-allowed" : "pointer",
                    display: "grid",
                    gap: "4px",
                    opacity: itemDisabled ? 0.65 : 1,
                    padding: "10px 12px",
                    textAlign: "left",
                    width: "100%",
                  }}
                  type="button"
                >
                  <strong>{item.label}</strong>
                  {item.description ? <span style={{ color: "#555" }}>{item.description}</span> : null}
                  {item.metadata ? <span>{item.metadata}</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div style={{ borderTop: "1px solid #e2e2e2", display: "grid", gap: "8px", paddingTop: "12px" }}>
        <strong>{selectedTitle}</strong>
        {selectedItems.length === 0 ? (
          <span style={{ color: "#666" }}>No entities selected.</span>
        ) : (
          <ul style={{ display: "flex", flexWrap: "wrap", gap: "8px", listStyle: "none", margin: 0, padding: 0 }}>
            {selectedItems.map((item) => (
              <li
                key={item.id}
                style={{
                  background: "#f7f7f5",
                  border: "1px solid #d8d8d8",
                  borderRadius: "999px",
                  padding: "4px 10px",
                }}
              >
                {item.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
