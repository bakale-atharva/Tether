"use client";

import { SignInButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
// The Following feed merges streams on the server, so its pages must be pinned
// with `endCursor`; this hook does that, unlike the one in convex/react.
import { usePaginatedQuery } from "convex-helpers/react";
import { api } from "@/convex/_generated/api";
import type { PublicProfile } from "@/convex/users";
import { FEED_PAGE_SIZE } from "@/lib/constants";
import { UserIcon } from "@/components/shell/icons";
import { Button, buttonStyles } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { useViewer } from "@/hooks/use-viewer";
import { PostFeedList } from "./post-feed-list";

// Posts from accounts the viewer follows. `onExplore` switches to the public feed.
export function FollowingFeed({ onExplore }: { onExplore: () => void }) {
  const viewer = useViewer();
  if (viewer.status === "signedOut") {
    return (
      <EmptyState
        icon={<UserIcon className="size-6" />}
        title="Your people, in one place"
        action={<SignInButton mode="modal"><button type="button" className={buttonStyles()}>Sign in to follow people</button></SignInButton>}
      >
        Follow accounts to see their posts here, newest first.
      </EmptyState>
    );
  }
  if (viewer.status !== "ready") return <LoadingState label="Loading posts" />;
  return <ViewerFollowingFeed viewer={viewer.profile} onExplore={onExplore} />;
}

function ViewerFollowingFeed({ viewer, onExplore }: { viewer: PublicProfile; onExplore: () => void }) {
  const { results, status, loadMore } = usePaginatedQuery(api.posts.following, {}, { initialNumItems: FEED_PAGE_SIZE });
  const state = useQuery(api.follows.state, { userId: viewer._id });
  const followsNobody = state?.followingCount === 0;
  const explore = <Button variant="secondary" onClick={onExplore}>Explore the public feed</Button>;

  return (
    <PostFeedList
      results={results}
      status={status}
      loadMore={loadMore}
      empty={followsNobody ? (
        <EmptyState icon={<UserIcon className="size-6" />} title="You're not following anyone yet" action={explore}>
          Find people worth hearing from in the public feed, then follow them from their profile.
        </EmptyState>
      ) : (
        <EmptyState icon={<UserIcon className="size-6" />} title="It's quiet here" action={explore}>
          The accounts you follow haven&apos;t posted yet.
        </EmptyState>
      )}
    />
  );
}
