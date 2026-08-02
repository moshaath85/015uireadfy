import Link from 'next/link';
import type { CollectionExperienceData } from '@/lib/experience/collection-experience';
import { CollectionMedia } from './CollectionMedia';

interface CollectionExhibitionsProps {
  exhibitions: CollectionExperienceData['exhibitions'];
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

export function CollectionExhibitions({ exhibitions }: CollectionExhibitionsProps) {
  if (!exhibitions.length) return null;

  return (
    <section className="collection-experience-exhibitions" aria-labelledby="collection-exhibitions-title">
      <header>
        <p className="collection-experience-kicker">Institutional memory</p>
        <h2 id="collection-exhibitions-title">Exhibition history</h2>
      </header>
      <ul className="collection-experience-exhibitions__list">
        {exhibitions.map((exhibition) => (
          <li className="collection-experience-exhibitions__item" key={exhibition.id}>
            <Link href={`/exhibitions/${exhibition.slug}`}>
              <CollectionMedia fallbackLabel={exhibition.title} media={exhibition.coverMedia} variant="exhibition" />
              <div className="collection-experience-exhibitions__identity">
                <p>{formatDateRange(exhibition.startDate, exhibition.endDate)}</p>
                <h3>{exhibition.title}</h3>
                {exhibition.venue ? <p>{exhibition.venue}</p> : null}
              </div>
              <span aria-hidden="true">↗</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
