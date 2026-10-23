"use client";
import Link from "next/link";
import { useBilling } from "./billing-provider";
export function PlanBadge() {
  const { summary, loading } = useBilling();
  const label = loading && !summary ? "Checking plan…" : !summary?.verified ? "Check plan" : summary.allowed ? "Pro" : "Free";
  return <Link href="/billing" className="rounded-full border border-line px-2 py-0.5 text-xs font-medium text-accent-text hover:bg-surface-2" aria-label={`${label} · Manage billing`}>{label}</Link>;
}
