"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { PublicProfile } from "@/convex/users";
import { FEED_PAGE_SIZE } from "@/lib/constants";
import { PostFeedList } from "@/components/posts/post-feed-list";
import { EmptyState } from "@/components/ui/states";

export function ProfilePosts({ authorId, handle }: { authorId: PublicProfile["_id"]; handle: string }) {
  const { results, status, loadMore } = usePaginatedQuery(api.posts.byAuthor, { authorId }, { initialNumItems: FEED_PAGE_SIZE });
  return <section aria-label={`Posts from @${handle}`} className="min-w-0"><div className="mx-4 border-b border-line sm:mx-8"><h2 className="relative inline-flex min-h-14 items-center px-2 text-sm font-semibold text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:rounded-full after:bg-accent-text">Posts</h2></div><PostFeedList results={results} status={status} loadMore={loadMore} empty={<EmptyState title="No posts yet">Posts from @{handle} will show up here.</EmptyState>} /></section>;
}
