import Link from "next/link";

export interface AdminHeaderProps {
  readonly title: string;
  readonly description?: string;
}

export function AdminHeader({ title, description }: AdminHeaderProps) {
  return (
    <header className="admin-header">
      <div>
        <p className="admin-header__eyebrow">Gallery 015 Administration</p>
        <h1>{title}</h1>
        {description ? <p className="admin-header__description">{description}</p> : null}
      </div>
      <div className="admin-header__actions">
        <Link href="/admin/media">Media library</Link>
        <div className="admin-header__status" aria-label="Workspace status">
          <span aria-hidden="true" />
          Production workspace
        </div>
      </div>
    </header>
  );
}
