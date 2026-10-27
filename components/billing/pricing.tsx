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
          colorPrimary: "var(--clerk-color-primary)",
          colorPrimaryForeground: "var(--clerk-color-primary-foreground)",
          colorBackground: "var(--clerk-color-background)",
          colorForeground: "var(--clerk-color-foreground)",
          colorNeutral: "var(--clerk-color-neutral)",
          colorMutedForeground: "var(--clerk-color-muted-foreground)",
          colorBorder: "var(--clerk-color-border)",
          fontFamily: "var(--font-body)",
          borderRadius: "1.25rem",
        },
        elements: {
          pricingTable: "gap-4",
          pricingTableCard: {
            minWidth: 0,
            border: "1px solid transparent",
            borderRadius: "1.25rem",
            backgroundColor: "var(--clerk-color-muted)",
            boxShadow: "none",
          },
          badge: {
            color: "var(--clerk-color-foreground)",
            backgroundColor: "var(--clerk-color-muted)",
            border: "1px solid transparent",
            borderRadius: "9999px",
            opacity: 1,
          },
          pricingTableCardFooterButton: {
            minHeight: "44px",
            border: "1px solid transparent",
            borderRadius: "9999px",
            backgroundColor: "var(--clerk-color-primary)",
            backgroundImage: "none",
            color: "var(--clerk-color-primary-foreground)",
            boxShadow: "none",
            fontSize: "14px",
            fontWeight: 600,
            "&:hover:not(:disabled):not([aria-disabled='true']), &:active:not(:disabled):not([aria-disabled='true'])": {
              backgroundColor: "var(--clerk-color-primary-hover)",
              color: "var(--clerk-color-primary-foreground)",
            },
            "&:focus-visible": {
              backgroundColor: "var(--clerk-color-primary-hover)",
              color: "var(--clerk-color-primary-foreground)",
              outline: "2px solid var(--clerk-color-ring)",
              outlineOffset: "2px",
              boxShadow: "none",
            },
            "&:disabled, &[aria-disabled='true']": {
              backgroundColor: "var(--clerk-color-muted)",
              color: "var(--clerk-color-muted-foreground)",
              borderColor: "transparent",
              opacity: 1,
            },
          },
        },
      }}
    />
  );
}
