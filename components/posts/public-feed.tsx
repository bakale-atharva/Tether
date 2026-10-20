"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FEED_PAGE_SIZE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { FeatherIcon } from "@/components/shell/icons";
import { PostCard } from "./post-card";

export function PublicFeed() {
  const { results, status, loadMore } = usePaginatedQuery(api.posts.list, {}, { initialNumItems: FEED_PAGE_SIZE });
  if (status === "LoadingFirstPage") return <LoadingState label="Loading posts" />;
  if (status === "Exhausted" && results.length === 0) return <EmptyState icon={<FeatherIcon className="size-6" />} title="The conversation starts here">Be the first person to share something with Tether.</EmptyState>;
  return <><div>{results.map(post => <PostCard key={post._id} post={post} />)}</div>{status === "CanLoadMore" ? <div className="p-5 text-center"><Button variant="secondary" onClick={() => loadMore(FEED_PAGE_SIZE)}>Load more</Button></div> : null}{status === "LoadingMore" ? <LoadingState label="Loading more posts" /> : null}</>;
}
