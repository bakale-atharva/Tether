// Tether mark: two linked rings joined by a cord.
export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect width="32" height="32" rx="9" fill="var(--accent)" />
      <circle cx="11.5" cy="16" r="5" fill="none" stroke="var(--accent-fg)" strokeWidth="2.4" />
      <circle cx="20.5" cy="16" r="5" fill="none" stroke="var(--accent-fg)" strokeWidth="2.4" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark />
      <span className="text-[1.375rem] font-semibold tracking-tight text-ink">
        Tether
      </span>
    </span>
  );
}
