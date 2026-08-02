import type { ExhibitionExperienceData } from '@/lib/experience/exhibition-experience';

interface ExhibitionIdentityProps {
  exhibition: ExhibitionExperienceData['exhibition'];
}

export function ExhibitionIdentity({ exhibition }: ExhibitionIdentityProps) {
  return (
    <div className="exhibition-experience-identity">
      <p className="exhibition-experience-kicker">Exhibition</p>
      <h1>{exhibition.title}</h1>
      {exhibition.titleAr ? (
        <p className="exhibition-experience-identity__arabic" dir="rtl" lang="ar">{exhibition.titleAr}</p>
      ) : null}
    </div>
  );
}
