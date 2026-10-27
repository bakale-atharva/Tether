"use client";

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useId } from "react";
import { PlanBadge } from "@/components/billing/plan-badge";
import { useViewer } from "@/hooks/use-viewer";
import { Avatar } from "@/components/ui/avatar";
import { buttonStyles } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/spinner";

// Sidebar footer on desktop: account summary with Clerk's user menu, or
// sign-in calls to action for visitors.
export function SidebarAccount() {
  const viewer = useViewer();

  if (viewer.status === "loading") {
    return <Skeleton className="h-14 w-full rounded-2xl" />;
  }
  if (viewer.status === "signedOut") {
    return (
      <div className="flex flex-col gap-2">
        <SignUpButton mode="modal">
          <button type="button" className={buttonStyles({ className: "min-h-11 w-full px-1 text-xs lg:px-4 lg:text-sm" })}>
            <span className="lg:hidden">Join</span>
            <span className="hidden lg:inline">Create account</span>
          </button>
        </SignUpButton>
        <SignInButton mode="modal">
          <button
            type="button"
            className={buttonStyles({ variant: "secondary", className: "min-h-11 w-full px-1 text-xs lg:px-4 lg:text-sm" })}
          >
            Sign in
          </button>
        </SignInButton>
      </div>
    );
  }

  const name = viewer.status === "ready" ? viewer.profile.displayName : "Finish setup";
  const handle = viewer.status === "ready" ? `@${viewer.profile.handle}` : "Choose a handle";
  return (
    <div className="flex flex-col gap-2 border-t border-line pt-4 lg:flex-row lg:items-start lg:gap-3 lg:px-1">
      <div className="flex min-h-11 min-w-11 shrink-0 items-center justify-center">
        <UserButton />
      </div>
      <Link href="/billing" className="flex min-h-11 items-center justify-center rounded-full text-xs font-medium text-accent-text transition-colors duration-150 hover:bg-surface-2 lg:hidden">
        Billing
      </Link>
      <div className="hidden min-w-0 lg:block">
        <p className="truncate text-sm font-semibold text-ink">{name}</p>
        <p className="truncate text-sm text-muted">{handle}</p>
        <div className="mt-2"><PlanBadge /></div>
      </div>
    </div>
  );
}

// Compact account control for the mobile header.
export function HeaderAccount() {
  const viewer = useViewer();
  if (viewer.status === "loading") return <Skeleton className="size-11 rounded-full" />;
  if (viewer.status === "signedOut") {
    return (
      <div className="flex items-center gap-1">
        <SignUpButton mode="modal">
          <button type="button" className={buttonStyles({ variant: "ghost", size: "sm", className: "min-h-11 px-3" })}>
            Join
          </button>
        </SignUpButton>
        <SignInButton mode="modal">
          <button type="button" className={buttonStyles({ size: "sm", className: "min-h-11 px-3" })}>
            Sign in
          </button>
        </SignInButton>
      </div>
    );
  }
  return <div className="flex min-h-11 items-center gap-2"><PlanBadge /><span className="flex min-h-11 min-w-11 items-center justify-center"><UserButton /></span></div>;
}

// Visitor information, reached from the compact shell footer at every width.
export function JoinCard() {
  const headingId = useId();
  const viewer = useViewer();
  if (viewer.status !== "signedOut") return null;
  return (
    <section
      aria-labelledby={headingId}
      className="mt-5 border-t border-line pt-4"
    >
      <h2 id={headingId} className="text-base font-semibold text-ink">
        New to Tether?
      </h2>
      <p className="mt-1.5 text-sm text-muted">
        Join to post, reply, and keep the conversations you care about close.
      </p>
      <SignUpButton mode="modal">
        <button type="button" className={buttonStyles({ className: "mt-4 min-h-11" })}>
          Create account
        </button>
      </SignUpButton>
    </section>
  );
}

export function ViewerCard() {
  const viewer = useViewer();
  if (viewer.status !== "ready") return null;
  const { profile } = viewer;
  return (
    <section aria-label="Your account" className="mt-6 flex min-w-0 items-start gap-3 border-t border-line pt-6">
      <Avatar name={profile.displayName} src={profile.avatarUrl} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{profile.displayName}</p>
        <p className="truncate text-sm text-muted">@{profile.handle}</p>
        <div className="mt-2"><PlanBadge /></div>
      </div>
    </section>
  );
}
