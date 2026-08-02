import type { ProjectExperienceData } from '@/lib/experience/project-experience';

interface ProjectIdentityProps {
  project: ProjectExperienceData['project'];
}

const PROJECT_TYPE_LABELS: Record<string, string> = {
  commission: 'Commission',
  commercial: 'Commercial',
  cultural: 'Cultural',
  installation: 'Installation',
  institutional: 'Institutional',
  public_art: 'Public art',
  residential: 'Residential',
  site_activation: 'Site activation',
};

function mapProjectType(value: string): string | null {
  return PROJECT_TYPE_LABELS[value] ?? null;
}

export function ProjectIdentity({ project }: ProjectIdentityProps) {
  const openingMeta = [
    project.client?.trim() || null,
    mapProjectType(project.type),
    project.year ? String(project.year) : null,
  ].filter((item): item is string => Boolean(item));

  return (
    <div className="project-experience-identity">
      <p className="project-experience-kicker">Commission archive</p>
      <h1>{project.title}</h1>
      {openingMeta.length ? (
        <p className="project-experience-identity__meta">
          {openingMeta.map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </p>
      ) : null}
      {project.titleAr ? (
        <p className="project-experience-identity__arabic" dir="rtl" lang="ar">
          {project.titleAr}
        </p>
      ) : null}
    </div>
  );
}
