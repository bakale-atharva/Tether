"use client";
import { PricingTable } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/spinner";
export function Pricing() {
  return <PricingTable for="user" newSubscriptionRedirectUrl="/billing" fallback={<div role="status" aria-label="Loading plans"><Skeleton className="h-80 w-full rounded-2xl" /></div>} appearance={{
    variables: { colorPrimary: "var(--accent)", colorBackground: "var(--surface)", colorForeground: "var(--ink)", colorMutedForeground: "var(--muted)", colorBorder: "var(--line)", fontFamily: "var(--font-body)", borderRadius: "1rem" },
    elements: { pricingTable: "gap-4", pricingTableCard: "border border-line shadow-none min-w-0" },
  }} />;
}
