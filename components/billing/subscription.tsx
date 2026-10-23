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
  if (isLoading) return <p role="status">Loading your account…</p>;
  if (!isAuthenticated) return <div className="space-y-4"><p className="text-muted">Sign in to view your plan and manage your subscription.</p><SignInButton mode="modal"><button className={buttonStyles()}>Sign in</button></SignInButton></div>;
  return <div className="space-y-6">
    <section aria-labelledby="current-plan" className="space-y-3">
      <h2 id="current-plan" className="font-display text-2xl font-semibold">{loading && !summary ? "Checking your plan…" : !summary?.verified ? "Your plan is unavailable" : summary.allowed ? "You’re on Pro" : "You’re on Free"}</h2>
      {!summary?.verified ? <p role="status" className="text-muted">We couldn’t verify your plan. Refresh to try again; you can still manage your subscription below.</p> : <>
        <p className="text-muted">{summary.allowed ? "Your subscription includes Tether AI when it launches." : "Post, reply, follow people, and save conversations for free."}</p>
        {summary.accessUntil && <p className="text-sm text-muted">{summary.canceled ? "Pro access ends" : "Current paid period ends"} {new Date(summary.accessUntil).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}. {summary.canceled ? "Your subscription won’t renew." : "Cancel any time in subscription settings."}</p>}
        {summary.status === "past_due" && <p role="status" className="text-sm text-muted">Your payment is past due. Update your payment method to restore Pro access.</p>}
      </>}
    </section>
    <div className="flex flex-wrap gap-3">
      <SubscriptionDetailsButton for="user" onSubscriptionCancel={refresh}><button type="button" className={buttonStyles()}>Manage subscription</button></SubscriptionDetailsButton>
      <button type="button" disabled={loading} onClick={refresh} className={buttonStyles({ variant: "secondary" })}>{loading ? "Checking…" : "Refresh plan"}</button>
      <Link href="/pricing" className={buttonStyles({ variant: "secondary" })}>Compare plans</Link>
    </div>
    <p className="text-sm text-muted">Development subscriptions use test payments. Canceling keeps Pro access until the end of your paid period. Expired or past-due subscriptions can’t start AI requests.</p>
  </div>;
}
