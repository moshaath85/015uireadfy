import type { ReactNode } from "react";

export interface RelatedEntityDisplayItem {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly href?: string;
  readonly metadata?: ReactNode;
}

export interface RelatedEntitiesPanelProps {
  readonly title: string;
  readonly items: readonly RelatedEntityDisplayItem[];
  readonly emptyMessage?: string;
  readonly openInNewTab?: boolean;
}

export function RelatedEntitiesPanel({
  title,
  items,
  emptyMessage = "No related entities.",
  openInNewTab = false,
}: RelatedEntitiesPanelProps) {
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
        <ul style={{ display: "grid", gap: "10px", listStyle: "none", margin: 0, padding: 0 }}>
          {items.map((item) => {
            const content = item.href ? (
              <a
                href={item.href}
                rel={openInNewTab ? "noreferrer" : undefined}
                target={openInNewTab ? "_blank" : undefined}
              >
                {item.label}
              </a>
            ) : (
              <span>{item.label}</span>
            );

            return (
              <li
                key={item.id}
                style={{
                  border: "1px solid #d8d8d8",
                  display: "grid",
                  gap: "4px",
                  padding: "10px 12px",
                }}
              >
                <strong>{content}</strong>
                {item.description ? <p style={{ color: "#555", margin: 0 }}>{item.description}</p> : null}
                {item.metadata ? <div>{item.metadata}</div> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
