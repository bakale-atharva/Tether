"use client";

import { PricingTable } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/spinner";

export function Pricing() {
  return (
    <PricingTable
      for="user"
      newSubscriptionRedirectUrl="/billing"
      fallback={
        <div role="status" aria-label="Loading plans">
          <Skeleton className="h-80 w-full rounded-[1.25rem]" />
        </div>
      }
      appearance={{
        variables: {
          colorPrimary: "var(--accent)",
          colorBackground: "var(--surface)",
          colorForeground: "var(--ink)",
          colorMutedForeground: "var(--muted)",
          colorBorder: "var(--border)",
          fontFamily: "var(--font-body)",
          borderRadius: "1.25rem",
        },
        elements: {
          pricingTable: "gap-4",
          pricingTableCard: "min-w-0 rounded-[1.25rem] border border-line bg-transparent shadow-none",
        },
      }}
    />
  );
}
