import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { SearchIcon } from "@/components/shell/icons";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { parseSearchQuery } from "@/convex/lib/search";
import { SearchResults } from "./search-results";

export const metadata: Metadata = { title: "Search" };

type SearchParams = Promise<{ q?: string | string[] }>;

export default function SearchPage({ searchParams }: {
  searchParams: SearchParams;
}) {
  return (
    <>
      <PageHeader title="Search" />
      <Suspense fallback={<LoadingState label="Loading search" />}>
        <SearchContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function SearchContent({ searchParams }: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const rawQuery = typeof params.q === "string" ? params.q : "";
  const parsed = parseSearchQuery(rawQuery);

  return (
    <>
      <form action="/search" method="get" role="search" className="flex gap-2 border-b border-line p-4 sm:p-5">
        <label htmlFor="search-query" className="sr-only">Search posts</label>
        <input
          key={rawQuery}
          id="search-query"
          name="q"
          type="search"
          defaultValue={rawQuery}
          placeholder="Search posts"
          autoComplete="off"
          aria-describedby={parsed.kind === "too_long" ? "search-error" : undefined}
          aria-invalid={parsed.kind === "too_long" || undefined}
          className="h-11 min-w-0 flex-1 rounded-xl border border-line-strong bg-surface px-3.5 text-base text-ink outline-none placeholder:text-muted/70 focus-visible:border-ring"
        />
        <Button type="submit" className="h-11">Search</Button>
      </form>
      {parsed.kind === "empty" ? (
        <EmptyState icon={<SearchIcon className="size-6" />} title="Find a conversation">
          Search the words in public posts. Press Enter or choose Search to see results.
        </EmptyState>
      ) : parsed.kind === "too_long" ? (
        <div id="search-error"><ErrorState title="Search is too long">Keep your search to 100 characters or fewer.</ErrorState></div>
      ) : (
        <SearchResults key={parsed.query} query={parsed.query} />
      )}
    </>
  );
}
