"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { PublicProfile } from "@/convex/users";
import { FEED_PAGE_SIZE } from "@/lib/constants";
import { PostFeedList } from "@/components/posts/post-feed-list";
import { EmptyState } from "@/components/ui/states";

export function ProfilePosts({ authorId, handle }: { authorId: PublicProfile["_id"]; handle: string }) {
  const { results, status, loadMore } = usePaginatedQuery(api.posts.byAuthor, { authorId }, { initialNumItems: FEED_PAGE_SIZE });
  return <section aria-label={`Posts from @${handle}`} className="min-w-0 border-t border-line bg-surface"><h2 className="border-b border-line px-4 py-4 text-sm font-semibold text-ink sm:px-6">Posts</h2><PostFeedList results={results} status={status} loadMore={loadMore} empty={<EmptyState title="No posts yet">Posts from @{handle} will show up here.</EmptyState>} /></section>;
}
