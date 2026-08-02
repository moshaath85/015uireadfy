import { SkeletonPlate } from '@/components/public/SkeletonPlate';

export default function Loading() {
  return (
    <div className="hp" aria-busy="true">
      <div style={{ padding: 'clamp(88px,10vw,168px) var(--hp-gutter)' }}>
        <SkeletonPlate aspectRatio="2/1" />
      </div>
    </div>
  );
}
