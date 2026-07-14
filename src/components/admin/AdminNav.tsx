"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminNavGroups = [
  {
    label: "Workspace",
    items: [{ label: "Overview", href: "/admin" }],
  },
  {
    label: "Collection",
    items: [
      { label: "Artists", href: "/admin/artists" },
      { label: "Artworks", href: "/admin/artworks" },
      { label: "Collections", href: "/admin/collections" },
      { label: "Exhibitions", href: "/admin/exhibitions" },
    ],
  },
  {
    label: "Editorial",
    items: [
      { label: "Projects", href: "/admin/projects" },
      { label: "Services", href: "/admin/services" },
      { label: "News", href: "/admin/news" },
      { label: "Publications", href: "/admin/publications" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Certificates", href: "/admin/certificates" },
      { label: "Media", href: "/admin/media" },
      { label: "Settings", href: "/admin/settings" },
    ],
  },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav" aria-label="Admin navigation">
      {adminNavGroups.map((group) => (
        <section className="admin-nav__group" key={group.label}>
          <p>{group.label}</p>
          <ul>
            {group.items.map((item) => {
              const isActive = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link href={item.href} className={isActive ? "is-active" : undefined} aria-current={isActive ? "page" : undefined}>
                    <span>{item.label}</span>
                    <span aria-hidden="true">↗</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );
}
