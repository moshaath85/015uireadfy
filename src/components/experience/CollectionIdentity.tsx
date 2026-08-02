import type { CollectionExperienceData } from '@/lib/experience/collection-experience';

interface CollectionIdentityProps {
  artistsCount: number;
  artworksCount: number;
  collection: CollectionExperienceData['collection'];
  exhibitionsCount: number;
}

function labelCount(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function CollectionIdentity({
  artistsCount,
  artworksCount,
  collection,
  exhibitionsCount,
}: CollectionIdentityProps) {
  const overview = [
    labelCount(artworksCount, 'work', 'works'),
    labelCount(artistsCount, 'artist', 'artists'),
    labelCount(exhibitionsCount, 'exhibition', 'exhibitions'),
  ];

  return (
    <div className="collection-experience-identity">
      <p className="collection-experience-kicker">Catalogue chapter</p>
      <h1>{collection.title}</h1>
      <p className="collection-experience-identity__meta">
        {overview.map((item, index) => (
          <span key={`${item}-${index}`}>{item}</span>
        ))}
      </p>
      {collection.titleAr ? (
        <p className="collection-experience-identity__arabic" dir="rtl" lang="ar">{collection.titleAr}</p>
      ) : null}
    </div>
  );
}
