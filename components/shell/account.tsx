"use client";

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
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
    return <Skeleton className="h-14 w-full rounded-full" />;
  }
  if (viewer.status === "signedOut") {
    return (
      <div className="flex flex-col gap-2 md:hidden lg:flex">
        <SignUpButton mode="modal">
          <button type="button" className={buttonStyles({ className: "w-full" })}>
            Create account
          </button>
        </SignUpButton>
        <SignInButton mode="modal">
          <button
            type="button"
            className={buttonStyles({ variant: "secondary", className: "w-full" })}
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
    <div className="flex items-center gap-3 rounded-full p-1.5 md:justify-center lg:justify-start">
      <UserButton />
      <div className="min-w-0 md:hidden lg:block">
        <p className="truncate text-sm font-semibold text-ink">{name} <PlanBadge /></p>
        <p className="truncate text-sm text-muted">{handle}</p>
      </div>
    </div>
  );
}

// Compact account control for the mobile header.
export function HeaderAccount() {
  const viewer = useViewer();
  if (viewer.status === "loading") return <Skeleton className="size-8 rounded-full" />;
  if (viewer.status === "signedOut") {
    return (
      <SignInButton mode="modal">
        <button type="button" className={buttonStyles({ size: "sm" })}>
          Sign in
        </button>
      </SignInButton>
    );
  }
  return <div className="flex items-center gap-2"><PlanBadge /><UserButton /></div>;
}

// Right-rail card shown to visitors on wide screens.
export function JoinCard() {
  const viewer = useViewer();
  if (viewer.status !== "signedOut") return null;
  return (
    <section
      aria-labelledby="join-heading"
      className="rounded-2xl border border-line bg-surface p-5 shadow-card"
    >
      <h2 id="join-heading" className="font-display text-xl font-semibold">
        New to Tether?
      </h2>
      <p className="mt-1.5 text-sm text-muted">
        Join to post, reply, and keep the conversations you care about close.
      </p>
      <SignUpButton mode="modal">
        <button type="button" className={buttonStyles({ className: "mt-4 w-full" })}>
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
    <section className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card">
      <Avatar name={profile.displayName} src={profile.avatarUrl} />
      <div className="min-w-0">
        <p className="truncate font-semibold">{profile.displayName}</p>
        <p className="truncate text-sm text-muted">@{profile.handle}</p>
      </div>
    </section>
  );
}
