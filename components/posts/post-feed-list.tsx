"use client";

import type { PaginationStatus } from "convex/react";
import type { ReactNode } from "react";
import type { PublicPost } from "@/convex/posts";
import { FEED_PAGE_SIZE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/states";
import { PostCard } from "./post-card";

type PostFeedListProps = {
  results: PublicPost[];
  status: PaginationStatus;
  loadMore: (numItems: number) => void;
  // Shown once the feed is known to be empty.
  empty: ReactNode;
};

// A paginated column of post cards with loading, empty, and load-more states.
export function PostFeedList({ results, status, loadMore, empty }: PostFeedListProps) {
  if (status === "LoadingFirstPage") return <LoadingState label="Loading posts" />;
  if (status === "Exhausted" && results.length === 0) return <>{empty}</>;
  return (
    <>
      <div>{results.map(post => <PostCard key={post._id} post={post} />)}</div>
      {status === "CanLoadMore" || status === "LoadingMore" ? (
        <div className="p-5 text-center">
          <Button variant="secondary" loading={status === "LoadingMore"} onClick={() => loadMore(FEED_PAGE_SIZE)}>Load more</Button>
        </div>
      ) : null}
    </>
  );
}
