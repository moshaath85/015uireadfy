import type { ArtworkExperienceData } from '@/lib/experience/artwork-experience';

interface ArtworkDetailsProps {
  artwork: ArtworkExperienceData['artwork'];
}

interface ArtworkDetailItem {
  label: string;
  value: string;
  className: string;
}

const availabilityLabels: Readonly<Record<string, string>> = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
  on_loan: 'On loan',
  not_for_sale: 'Not for sale',
};

const pricePolicyLabels: Readonly<Record<string, string>> = {
  price_visible: 'Enquire for price',
  price_upon_request: 'Price on request',
  private_quote: 'Private quote',
};

export function ArtworkDetails({ artwork }: ArtworkDetailsProps) {
  const details = [
    { label: 'Year', value: artwork.year ? String(artwork.year) : null, className: 'artwork-experience-details__value--year' },
    { label: 'Medium', value: artwork.medium || null, className: 'artwork-experience-details__value--medium' },
    { label: 'Dimensions', value: artwork.dimensions || null, className: 'artwork-experience-details__value--dimensions' },
    {
      label: 'Availability',
      value: availabilityLabels[artwork.availabilityStatus] ?? null,
      className: 'artwork-experience-details__value--availability',
    },
    {
      label: 'Price policy',
      value: pricePolicyLabels[artwork.pricePolicy] ?? null,
      className: 'artwork-experience-details__value--price',
    },
  ].filter((detail): detail is ArtworkDetailItem => Boolean(detail.value));

  if (!details.length) return null;

  return (
    <section className="artwork-experience-details" aria-labelledby="artwork-details-title">
      <header className="artwork-experience-details__header">
        <p className="artwork-experience-kicker" id="artwork-details-title">Object details</p>
        <h2>Technical record</h2>
      </header>
      <dl className="artwork-experience-details__list">
        {details.map((detail) => (
          <div key={detail.label}>
            <dt>{detail.label}</dt>
            <dd className={detail.className}>{detail.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
