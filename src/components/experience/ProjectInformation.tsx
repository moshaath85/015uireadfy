import type { ProjectExperienceData } from '@/lib/experience/project-experience';

interface ProjectInformationProps {
  project: ProjectExperienceData['project'];
}

const PROJECT_STATUS_LABELS: Record<string, string> = {
  archived: 'Archived',
  completed: 'Completed',
  in_progress: 'In progress',
  planned: 'Planned',
};

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

function mapProjectStatus(value: string): string | null {
  return PROJECT_STATUS_LABELS[value] ?? null;
}

export function ProjectInformation({ project }: ProjectInformationProps) {
  const information = [
    project.client ? { label: 'Client', value: project.client } : null,
    mapProjectType(project.type) ? { label: 'Type', value: mapProjectType(project.type) as string } : null,
    project.year ? { label: 'Year', value: String(project.year) } : null,
    mapProjectStatus(project.status)
      ? { label: 'Status', value: mapProjectStatus(project.status) as string }
      : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  if (!information.length) return null;

  return (
    <section className="project-experience-information" aria-labelledby="project-information-title">
      <p className="project-experience-kicker" id="project-information-title">Institutional record</p>
      <dl className="project-experience-information__list">
        {information.map((item) => (
          <div className="project-experience-information__item" key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
