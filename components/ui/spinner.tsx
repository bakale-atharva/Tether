export function Spinner({
  className = "size-5",
  label = "Loading",
}: {
  className?: string;
  // Pass null when a surrounding element already announces the busy state.
  label?: string | null;
}) {
  return (
    <span role={label ? "status" : undefined} className="inline-flex shrink-0 align-middle">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={`animate-spin ${className}`}
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`animate-pulse rounded-2xl bg-surface-2 ${className}`} />
  );
}
