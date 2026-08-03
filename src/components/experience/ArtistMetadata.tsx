interface ArtistMetadataProps {
  birthYear?: number | null;
  discipline?: string | null;
  nationality?: string | null;
  representationLabel: string | null;
  variant: 'identity' | 'panel';
}

function joinMetadata(values: Array<string | null | undefined>): string {
  return values.filter((value): value is string => Boolean(value)).join(' · ');
}

export function ArtistMetadata({
  birthYear,
  discipline,
  nationality,
  representationLabel,
  variant,
}: ArtistMetadataProps) {
  const primary = joinMetadata([discipline, nationality]);
  const biographical = birthYear ? `Born ${birthYear}` : null;

  if (variant === 'identity') {
    return (
      <>
        {representationLabel ? (
          <small className="artist-roster-entry__relationship">{representationLabel}</small>
        ) : null}
        {primary || biographical ? (
          <em className="artist-roster-entry__summary-meta">{joinMetadata([primary, biographical])}</em>
        ) : null}
      </>
    );
  }

  return primary || biographical ? (
    <p className="artist-roster-entry__panel-meta">{joinMetadata([primary, biographical])}</p>
  ) : null;
}
