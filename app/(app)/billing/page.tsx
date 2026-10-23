import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Subscription } from "@/components/billing/subscription";
export const metadata: Metadata = { title: "Billing" };
export default function BillingPage() {
  return <><PageHeader title="Your subscription">Your plan, on your terms.</PageHeader><div className="px-4 py-8 sm:px-6"><Suspense fallback={<p role="status">Loading subscription…</p>}><Subscription /></Suspense></div></>;
}
