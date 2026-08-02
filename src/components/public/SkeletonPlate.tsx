export function SkeletonPlate({ aspectRatio = '1/1' }: { aspectRatio?: string }) {
  return (
    <div
      className="g-skeleton"
      style={{ aspectRatio }}
      aria-hidden="true"
      role="presentation"
    />
  );
}

export function EmptySection({ message = 'No published content is currently available.' }: { message?: string }) {
  return (
    <div className="g-empty" role="status">
      <p>{message}</p>
    </div>
  );
}
