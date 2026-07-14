import type { ReactNode } from "react";

import { AdminHeader } from "./AdminHeader";
import { AdminNav } from "./AdminNav";

export interface AdminShellProps {
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
}

export function AdminShell({ title, description, children }: AdminShellProps) {
  return (
    <main className="admin-shell">
      <a className="admin-shell__skip" href="#admin-main-content">
        Skip to content
      </a>
      <div className="admin-shell__frame">
        <aside className="admin-shell__sidebar">
          <div className="admin-shell__brand" aria-label="Gallery 015 CMS">
            <span className="admin-shell__brand-mark" aria-hidden="true">015</span>
            <span className="admin-shell__brand-name">Gallery CMS</span>
          </div>
          <AdminNav />
          <div className="admin-shell__sidebar-footer">
            <LinkToWebsite />
            <form action="/admin/logout" method="post" className="admin-shell__logout">
              <button type="submit">Sign out</button>
            </form>
          </div>
        </aside>

        <div className="admin-shell__workspace">
          <AdminHeader title={title} description={description} />
          <section id="admin-main-content" className="admin-shell__content" aria-label="Admin content" tabIndex={-1}>
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}

function LinkToWebsite() {
  return (
    <a className="admin-shell__view-site" href="/" target="_blank" rel="noreferrer">
      View public site <span aria-hidden="true">↗</span>
    </a>
  );
}
