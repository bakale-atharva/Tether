"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FEED_PAGE_SIZE } from "@/lib/constants";
import { SearchIcon } from "@/components/shell/icons";
import { PostFeedList } from "@/components/posts/post-feed-list";
import { EmptyState } from "@/components/ui/states";

export function SearchResults({ query }: { query: string }) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.posts.search,
    { text: query },
    { initialNumItems: FEED_PAGE_SIZE },
  );

  return (
    <section aria-label={`Search results for ${query}`}>
      <PostFeedList
        results={results}
        status={status}
        loadMore={loadMore}
        empty={<EmptyState icon={<SearchIcon className="size-6" />} title="No posts found">Try different words or a shorter phrase.</EmptyState>}
      />
    </section>
  );
}
