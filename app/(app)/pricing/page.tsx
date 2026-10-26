import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Pricing } from "@/components/billing/pricing";

export const metadata: Metadata = { title: "Plans" };

export default function PricingPage() {
  return (
    <>
      <PageHeader title="A little more Tether">Public conversations are always free.</PageHeader>
      <div className="space-y-8 px-4 py-6 sm:px-6 sm:py-8">
        <section aria-labelledby="plans-intro">
          <h2 id="plans-intro" className="text-2xl leading-tight font-semibold tracking-tight text-balance">Keep the conversation going.</h2>
          <p className="mt-3 leading-relaxed text-muted">Free gives you a place to post, reply, follow, and save. Pro adds access to Tether AI as it arrives: private conversations and thoughtful replies when you mention @tether.</p>
        </section>
        <p className="rounded-2xl border border-line bg-surface-2/50 p-5 text-sm leading-relaxed text-muted">Development billing · Test subscriptions only. Pro is $10 USD per month, with no trial or annual commitment. AI conversations are coming in the next phases.</p>
        <Suspense fallback={<p role="status" className="py-12 text-center text-sm text-muted">Loading plans…</p>}>
          <Pricing />
        </Suspense>
        <p className="border-t border-line pt-6 text-sm leading-relaxed text-muted">Cancel any time; Pro access continues through the paid period. <Link href="/billing" className="rounded-sm font-semibold text-accent-text underline underline-offset-4 hover:decoration-2">Manage your subscription</Link></p>
      </div>
    </>
  );
}
