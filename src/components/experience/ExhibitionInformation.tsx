import type { ExhibitionExperienceData } from '@/lib/experience/exhibition-experience';

interface ExhibitionInformationProps {
  exhibition: ExhibitionExperienceData['exhibition'];
}

interface ExhibitionInformationItem {
  label: string;
  value: string;
  className: string;
}

const dateFormatter = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
  year: 'numeric',
});

function formatDate(value: string): string {
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  return start === end ? start : `${start} — ${end}`;
}

const publicStatusLabels: Readonly<Record<string, string>> = {
  planned: 'Planned',
  in_progress: 'In progress',
  completed: 'Completed',
  archived: 'Archived',
};

function formatStatus(status: string): string | null {
  return publicStatusLabels[status.trim().toLowerCase()] ?? null;
}

function extractLocation(venue: string): string | null {
  const parts = venue.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  return parts.slice(1).join(', ');
}

export function ExhibitionInformation({ exhibition }: ExhibitionInformationProps) {
  const location = extractLocation(exhibition.venue);
  const status = formatStatus(exhibition.status);

  const information = [
    {
      label: 'Dates',
      value: formatDateRange(exhibition.startDate, exhibition.endDate),
      className: 'exhibition-experience-information__value--dates',
    },
    {
      label: 'Venue',
      value: exhibition.venue,
      className: 'exhibition-experience-information__value--venue',
    },
    {
      label: 'Location',
      value: location,
      className: 'exhibition-experience-information__value--location',
    },
    {
      label: 'Status',
      value: status,
      className: 'exhibition-experience-information__value--status',
    },
  ].filter((item): item is ExhibitionInformationItem => Boolean(item.value));

  if (!information.length) return null;

  return (
    <section className="exhibition-experience-information" aria-labelledby="exhibition-information-title">
      <header className="exhibition-experience-information__header">
        <p className="exhibition-experience-kicker" id="exhibition-information-title">Context</p>
        <h2>Archive record</h2>
      </header>
      <dl className="exhibition-experience-information__list">
        {information.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd className={item.className}>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
