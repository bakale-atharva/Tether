"use client";

import { SignInButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { nextToggledCount } from "@/convex/lib/content";
import type { PublicProfile } from "@/convex/users";
import { Button, buttonStyles } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useViewer } from "@/hooks/use-viewer";
import { errorMessage } from "@/lib/errors";

// Follow / Following control for one account. Hidden on the viewer's own
// account; visitors get the same button, but it opens sign-in.
export function FollowButton({ profile }: { profile: PublicProfile }) {
  const viewer = useViewer();
  const toast = useToast();
  const state = useQuery(api.follows.state, { userId: profile._id });
  // Convex discards this local change automatically if the mutation fails.
  const setFollowing = useMutation(api.follows.set).withOptimisticUpdate((store, { userId, following }) => {
    const current = store.getQuery(api.follows.state, { userId });
    if (current) {
      store.setQuery(api.follows.state, { userId }, {
        ...current, following, followerCount: nextToggledCount(current.followerCount, current.following, following),
      });
    }
  });

  if (viewer.status === "ready" && viewer.profile._id === profile._id) return null;
  const label = `Follow @${profile.handle}`;

  if (viewer.status === "signedOut") {
    return (
      <SignInButton mode="modal">
        <button type="button" aria-label={label} className={buttonStyles({ variant: "secondary", size: "sm", className: "min-h-11 min-w-24 shrink-0 bg-transparent" })}>Follow</button>
      </SignInButton>
    );
  }

  const following = state?.following ?? false;

  async function toggle() {
    const next = !following;
    try {
      await setFollowing({ userId: profile._id, following: next });
    } catch (cause) {
      toast(errorMessage(cause, next ? `Couldn't follow @${profile.handle}. Try again.` : `Couldn't unfollow @${profile.handle}. Try again.`));
    }
  }

  // While following, hover and focus preview the action the press will take.
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={toggle}
      disabled={viewer.status !== "ready" || state === undefined}
      aria-pressed={following}
      aria-label={label}
      // `!` outranks the variant's own hover colours, which share specificity.
      className={`group min-h-11 min-w-24 shrink-0 bg-transparent ${following ? "hover:border-danger/40! hover:bg-danger-soft! hover:text-danger! focus-visible:text-danger!" : ""}`}
    >
      {following ? (
        <>
          <span className="group-hover:hidden group-focus-visible:hidden">Following</span>
          <span aria-hidden="true" className="hidden group-hover:inline group-focus-visible:inline">Unfollow</span>
        </>
      ) : "Follow"}
    </Button>
  );
}
