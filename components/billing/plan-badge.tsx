"use client";

import Link from "next/link";
import { useBilling } from "./billing-provider";

export function PlanBadge() {
  const { summary, loading } = useBilling();
  const label = loading && !summary ? "Checking plan…" : !summary?.verified ? "Check plan" : summary.allowed ? "Pro" : "Free";
  return <Link href="/billing" className="inline-flex min-h-11 items-center rounded-lg bg-accent-soft px-3 text-xs font-semibold text-accent-text transition-colors duration-150 hover:bg-surface-2 md:min-h-7 md:px-2.5" aria-label={`${label} · Manage billing`}>{label}</Link>;
}
