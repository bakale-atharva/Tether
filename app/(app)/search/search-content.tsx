import { SearchIcon } from "@/components/shell/icons";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { parseSearchQuery } from "@/convex/lib/search";
import { SearchResults } from "./search-results";

type SearchParams = PageProps<"/search">["searchParams"];

export async function SearchContent({ searchParams }: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const rawQuery = typeof params.q === "string" ? params.q : "";
  const parsed = parseSearchQuery(rawQuery);

  return (
    <>
      <form action="/search" method="get" role="search" className="space-y-3 border-b border-line px-5 py-6 md:px-8 md:py-8">
        <label htmlFor="search-query" className="block text-sm font-semibold text-ink">Search posts</label>
        <div className="flex gap-2 sm:gap-3">
          <div className="relative min-w-0 flex-1">
            <SearchIcon aria-hidden="true" className="pointer-events-none absolute top-3 left-3.5 size-5 text-muted" />
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
              className="h-11 w-full min-w-0 rounded-full border border-line-strong bg-surface py-2 pr-3.5 pl-11 text-base text-ink outline-none transition-colors duration-150 placeholder:text-muted focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>
          <Button type="submit">Search</Button>
        </div>
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
