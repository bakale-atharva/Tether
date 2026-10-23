import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Pricing } from "@/components/billing/pricing";
export const metadata: Metadata = { title: "Plans" };
export default function PricingPage() {
  return <>
    <PageHeader title="A little more Tether">Public conversations are always free.</PageHeader>
    <div className="space-y-6 px-4 py-8 sm:px-6">
      <div><h2 className="font-display text-3xl font-semibold">Keep the conversation going.</h2><p className="mt-3 leading-relaxed text-muted">Free gives you a place to post, reply, follow, and save. Pro adds access to Tether AI as it arrives: private conversations and thoughtful replies when you mention @tether.</p></div>
      <p className="rounded-xl border border-line bg-surface p-4 text-sm text-muted">Development billing · Test subscriptions only. Pro is $10 USD per month, with no trial or annual commitment. AI conversations are coming in the next phases.</p>
      <Suspense fallback={<p role="status">Loading plans…</p>}><Pricing /></Suspense>
      <p className="text-sm text-muted">Cancel any time; Pro access continues through the paid period. <Link href="/billing" className="font-medium text-accent-text underline underline-offset-4">Manage your subscription</Link></p>
    </div>
  </>;
}
