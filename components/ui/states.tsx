import type { ReactNode } from "react";
import { Spinner } from "./spinner";

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-2xl border border-line bg-surface ${className}`}>
      {children}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      {icon ? (
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-accent-soft text-accent-text">
          {icon}
        </div>
      ) : null}
      <h2 className="font-display text-xl font-semibold tracking-tight text-balance text-ink">{title}</h2>
      {children ? <div className="mt-2 max-w-sm leading-relaxed text-muted">{children}</div> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  children,
  action,
}: {
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="m-4 rounded-2xl border border-danger/40 bg-danger-soft px-5 py-4 text-ink"
    >
      <p className="font-semibold text-danger">{title}</p>
      {children ? <div className="mt-2 text-sm leading-relaxed text-ink">{children}</div> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-muted">
      <Spinner label={label} />
    </div>
  );
}
