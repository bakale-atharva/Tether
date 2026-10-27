"use client";

import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { SubscriptionDetailsButton } from "@clerk/nextjs/experimental";
import { useConvexAuth } from "convex/react";
import { useBilling } from "./billing-provider";
import { buttonStyles } from "@/components/ui/button";

export function Subscription() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { summary, loading, refresh } = useBilling();
  if (isLoading) return <p role="status" className="py-12 text-center text-sm text-muted">Loading your account…</p>;
  if (!isAuthenticated) {
    return (
      <div className="py-2">
        <p className="leading-relaxed text-muted">Sign in to view your plan and manage your subscription.</p>
        <SignInButton mode="modal"><button type="button" className={buttonStyles({ className: "mt-6" })}>Sign in</button></SignInButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section aria-labelledby="current-plan">
        <div className="space-y-3 pt-2 pb-8">
          <h2 id="current-plan" className="text-2xl leading-tight font-semibold tracking-tight">{loading && !summary ? "Checking your plan…" : !summary?.verified ? "Your plan is unavailable" : summary.allowed ? "You’re on Pro" : "You’re on Free"}</h2>
          {!summary?.verified ? <p role="status" className="leading-relaxed text-muted">We couldn’t verify your plan. Refresh to try again; you can still manage your subscription below.</p> : <>
            <p className="leading-relaxed text-muted">{summary.allowed ? "Your subscription includes Tether AI when it launches." : "Post, reply, follow people, and save conversations for free."}</p>
            {summary.accessUntil && <p className="text-sm leading-relaxed text-muted">{summary.canceled ? "Pro access ends" : "Current paid period ends"} {new Date(summary.accessUntil).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}. {summary.canceled ? "Your subscription won’t renew." : "Cancel any time in subscription settings."}</p>}
            {summary.status === "past_due" && <p role="status" className="rounded-[1.25rem] border border-danger/40 bg-danger-soft px-4 py-3 text-sm leading-relaxed text-danger">Your payment is past due. Update your payment method to restore Pro access.</p>}
          </>}
        </div>
        <div className="flex flex-wrap gap-3 border-t border-line pt-6">
          <SubscriptionDetailsButton for="user" onSubscriptionCancel={refresh}><button type="button" className={buttonStyles()}>Manage subscription</button></SubscriptionDetailsButton>
          <button type="button" disabled={loading} onClick={refresh} className={buttonStyles({ variant: "secondary" })}>{loading ? "Checking…" : "Refresh plan"}</button>
          <Link href="/pricing" className={buttonStyles({ variant: "secondary" })}>Compare plans</Link>
        </div>
      </section>
      <p className="text-sm leading-relaxed text-muted">Development subscriptions use test payments. Canceling keeps Pro access until the end of your paid period. Expired or past-due subscriptions can’t start AI requests.</p>
    </div>
  );
}
