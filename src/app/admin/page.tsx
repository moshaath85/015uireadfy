import Link from "next/link";

import { AdminShell } from "@/components/admin";
import { artistsRepository } from "@/lib/repositories/artists";
import { artworksRepository } from "@/lib/repositories/artworks";
import { certificatesRepository } from "@/lib/repositories/certificates";
import { collectionsRepository } from "@/lib/repositories/collections";
import { exhibitionsRepository } from "@/lib/repositories/exhibitions";
import { mediaRepository } from "@/lib/repositories/media";
import { newsRepository } from "@/lib/repositories/news";
import { projectsRepository } from "@/lib/repositories/projects";
import { publicationsRepository } from "@/lib/repositories/publications";
import { servicesRepository } from "@/lib/repositories/services";

export const dynamic = "force-dynamic";

type SettledCollection = PromiseSettledResult<readonly unknown[]>;

function countResult(result: SettledCollection): number | null {
  return result.status === "fulfilled" ? result.value.length : null;
}

function formatCount(value: number | null): string {
  return value === null ? "—" : new Intl.NumberFormat("en-US").format(value);
}

const quickActions = [
  { label: "New artist", href: "/admin/artists/new" },
  { label: "New artwork", href: "/admin/artworks/new" },
  { label: "New exhibition", href: "/admin/exhibitions/new" },
  { label: "Issue certificate", href: "/admin/certificates/new" },
];

const managementAreas = [
  { label: "Projects", href: "/admin/projects", description: "Institutional, private and cultural commissions" },
  { label: "Services", href: "/admin/services", description: "Advisory, curation and art placement services" },
  { label: "News", href: "/admin/news", description: "Editorial announcements and gallery updates" },
  { label: "Publications", href: "/admin/publications", description: "Catalogues, essays and downloadable editions" },
  { label: "Media", href: "/admin/media", description: "Reusable images, documents and presentation assets" },
  { label: "Settings", href: "/admin/settings", description: "Platform identity and operational configuration" },
];

export default async function AdminPage() {
  const results = await Promise.allSettled([
    artistsRepository.getPublicAll(),
    artworksRepository.getPublicAll(),
    collectionsRepository.getPublicAll(),
    exhibitionsRepository.getPublicAll(),
    projectsRepository.getPublicAll(),
    servicesRepository.getPublicAll(),
    newsRepository.getPublicAll(),
    publicationsRepository.getPublicAll(),
    mediaRepository.getAll(),
    certificatesRepository.getAll(),
  ]);

  const [artists, artworks, collections, exhibitions, projects, services, news, publications, media, certificates] =
    results.map((result) => countResult(result as SettledCollection));

  const cmsStats = [
    { label: "Artists", value: artists, href: "/admin/artists", note: "Profiles available to the public experience" },
    { label: "Artworks", value: artworks, href: "/admin/artworks", note: "Works currently available through PostgreSQL" },
    { label: "Collections", value: collections, href: "/admin/collections", note: "Curated groupings and narratives" },
    { label: "Exhibitions", value: exhibitions, href: "/admin/exhibitions", note: "Current, upcoming and archived programmes" },
  ];

  const operationalStats = [
    ["Projects", projects],
    ["Services", services],
    ["News", news],
    ["Publications", publications],
    ["Media", media],
    ["Certificates", certificates],
  ] as const;

  return (
    <AdminShell
      title="Overview"
      description="A production-facing view of Gallery 015 content, publishing and collection operations."
    >
      <div className="admin-dashboard">
        <section className="admin-dashboard__stats" aria-label="CMS content summary">
          {cmsStats.map((item) => (
            <Link className="admin-dashboard__stat" href={item.href} key={item.label}>
              <span>{item.label}</span>
              <strong>{formatCount(item.value)}</strong>
              <small>{item.note}</small>
            </Link>
          ))}
        </section>

        <div className="admin-dashboard__grid">
          <section className="admin-dashboard__panel" aria-labelledby="content-health-title">
            <header>
              <p>Content system</p>
              <h2 id="content-health-title">Operational inventory</h2>
            </header>
            <dl className="admin-dashboard__inventory">
              {operationalStats.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{formatCount(value)}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="admin-dashboard__panel admin-dashboard__panel--dark" aria-labelledby="quick-actions-title">
            <header>
              <p>Shortcuts</p>
              <h2 id="quick-actions-title">Create and manage</h2>
            </header>
            <ul className="admin-dashboard__actions">
              {quickActions.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <span>{item.label}</span>
                    <span aria-hidden="true">↗</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="admin-dashboard__directory" aria-labelledby="management-directory-title">
          <header>
            <p>Workspace</p>
            <h2 id="management-directory-title">Management directory</h2>
          </header>
          <div>
            {managementAreas.map((item) => (
              <Link href={item.href} key={item.href}>
                <span>{item.label}</span>
                <small>{item.description}</small>
                <b aria-hidden="true">↗</b>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
