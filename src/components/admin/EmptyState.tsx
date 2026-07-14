import type { ReactNode } from "react";

export interface EmptyStateProps {
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <section className="admin-empty-state" aria-label={title}>
      <div className="admin-empty-state__content">
        <h2 className="admin-empty-state__title">{title}</h2>
        {description ? <p className="admin-empty-state__description">{description}</p> : null}
        {action ? <div className="admin-empty-state__action">{action}</div> : null}
      </div>
    </section>
  );
}