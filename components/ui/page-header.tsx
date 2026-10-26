import type { ReactNode } from "react";

// Sticky title bar at the top of each page's main column. On phones it sits
// below the 3.5rem mobile app header; desktop panels float 2rem from the top.
export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="sticky top-14 z-10 min-w-0 rounded-t-[1.25rem] border-b border-line bg-surface px-5 py-5 md:top-8 md:rounded-t-[2rem] md:px-8 md:py-6">
      <h1 className="font-display text-[1.75rem] leading-tight font-semibold tracking-tight text-balance wrap-anywhere md:text-[2rem]">{title}</h1>
      {children ? <div className="mt-2 text-sm leading-relaxed text-muted">{children}</div> : null}
    </div>
  );
}
