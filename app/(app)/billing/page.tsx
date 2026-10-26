import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Subscription } from "@/components/billing/subscription";

export const metadata: Metadata = { title: "Billing" };

export default function BillingPage() {
  return (
    <>
      <PageHeader title="Your subscription">Your plan, on your terms.</PageHeader>
      <div className="px-4 py-6 sm:px-6 sm:py-8">
        <Suspense fallback={<p role="status" className="py-12 text-center text-sm text-muted">Loading subscription…</p>}>
          <Subscription />
        </Suspense>
      </div>
    </>
  );
}
