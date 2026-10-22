"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FEED_PAGE_SIZE } from "@/lib/constants";
import { EmptyState } from "@/components/ui/states";
import { FeatherIcon } from "@/components/shell/icons";
import { PostFeedList } from "./post-feed-list";

export function PublicFeed() {
  const { results, status, loadMore } = usePaginatedQuery(api.posts.list, {}, { initialNumItems: FEED_PAGE_SIZE });
  return (
    <PostFeedList
      results={results}
      status={status}
      loadMore={loadMore}
      empty={<EmptyState icon={<FeatherIcon className="size-6" />} title="The conversation starts here">Be the first person to share something with Tether.</EmptyState>}
    />
  );
}
