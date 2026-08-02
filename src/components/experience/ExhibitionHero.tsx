import type { ExhibitionExperienceData } from '@/lib/experience/exhibition-experience';
import { ExhibitionIdentity } from './ExhibitionIdentity';
import { ExhibitionMedia } from './ExhibitionMedia';

interface ExhibitionHeroProps {
  coverMedia: ExhibitionExperienceData['coverMedia'];
  exhibition: ExhibitionExperienceData['exhibition'];
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
  return start === end ? start : `${start} - ${end}`;
}

function formatStatus(status: string): string {
  if (!status.trim()) return 'Archive';
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function ExhibitionHero({ coverMedia, exhibition }: ExhibitionHeroProps) {
  return (
    <header className="exhibition-experience-hero">
      <ExhibitionMedia fallbackLabel={exhibition.title} media={coverMedia} priority variant="hero" />
      <ExhibitionIdentity exhibition={exhibition} />
      <dl className="exhibition-experience-hero__record" aria-label="Exhibition record overview">
        <div>
          <dt>Dates</dt>
          <dd>{formatDateRange(exhibition.startDate, exhibition.endDate)}</dd>
        </div>
        {exhibition.venue ? (
          <div>
            <dt>Venue</dt>
            <dd>{exhibition.venue}</dd>
          </div>
        ) : null}
        <div>
          <dt>Status</dt>
          <dd>{formatStatus(exhibition.status)}</dd>
        </div>
      </dl>
    </header>
  );
}
