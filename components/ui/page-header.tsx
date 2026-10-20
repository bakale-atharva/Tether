import type { ReactNode } from "react";

// Sticky title bar at the top of each page's main column. On phones it sits
// below the 3.5rem mobile app header.
export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="sticky top-14 z-10 border-b border-line bg-bg/90 px-4 py-3.5 backdrop-blur md:top-0 md:px-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
      {children ? <div className="mt-0.5 text-sm text-muted">{children}</div> : null}
    </div>
  );
}
