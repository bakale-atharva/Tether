import Link from "next/link";
import { JoinCard, ViewerCard } from "./account";
import { SearchIcon } from "./icons";

export function RightSidebar() {
  return (
    <aside
      aria-label="Search and Tether information"
      className="shell-panel sticky top-8 hidden max-h-[calc(100dvh-64px)] min-w-0 overflow-y-auto p-5 xl:block"
    >
      <form action="/search" method="get" role="search" aria-label="Sidebar post search" className="flex min-w-0 items-center rounded-full border border-line bg-surface-2 pl-4">
        <label htmlFor="shell-search" className="sr-only">Search posts</label>
        <input
          id="shell-search"
          name="q"
          type="search"
          placeholder="Search posts"
          className="h-12 w-full min-w-0 rounded-full bg-transparent text-sm text-ink outline-none placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
        <button type="submit" aria-label="Search posts" className="m-1 flex size-11 shrink-0 items-center justify-center rounded-full text-muted transition-colors duration-150 hover:bg-surface hover:text-ink">
          <SearchIcon className="size-5" />
        </button>
      </form>

      <ViewerCard />

      <section aria-labelledby="shell-about-heading" className="mt-6 border-t border-line pt-6">
        <h2 id="shell-about-heading" className="text-lg font-semibold text-ink">About Tether</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          A calm place for public conversations. Follow people, save posts
          privately, and mention <span className="font-medium text-accent-text">@tether</span>{" "}
          for an AI take on any thread.
        </p>
        <JoinCard />
      </section>

      <div className="mt-6 border-t border-line pt-4">
        <Link href="/pricing" className="inline-flex min-h-11 items-center text-sm font-medium text-accent-text underline-offset-4 hover:underline">
          Explore Free &amp; Pro plans
        </Link>
        <p className="mt-2 text-xs leading-relaxed text-muted">Development preview · No live payments</p>
      </div>
    </aside>
  );
}
