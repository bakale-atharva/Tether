"use client";

import Link from "next/link";
import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { PublicProfile } from "@/convex/users";
import { MissingProfile } from "@/components/profiles/missing-profile";
import { ProfileRow } from "@/components/profiles/profile-row";
import { UserIcon } from "@/components/shell/icons";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { PEOPLE_LISTS, PEOPLE_PAGE_SIZE, type PeopleListKind } from "@/lib/constants";

// A profile's followers or following, with links to switch between the two.
export function PeopleList({ handle, kind }: { handle: string; kind: PeopleListKind }) {
  const profile = useQuery(api.users.getByHandle, { handle });

  if (profile === undefined) return <LoadingState label="Loading profile" />;
  if (profile === null) return <MissingProfile />;

  return (
    <>
      <PageHeader title={profile.displayName}>
        <Link href={`/${profile.handle}`} className="wrap-anywhere underline-offset-4 hover:underline">@{profile.handle}</Link>
      </PageHeader>
      <nav aria-label="People" className="flex gap-6 border-b border-line bg-surface px-4 sm:px-6">
        {PEOPLE_LISTS.map(list => {
          const current = list.kind === kind;
          return (
            <Link
              key={list.kind}
              href={`/${profile.handle}/${list.kind}`}
              aria-current={current ? "page" : undefined}
              className={`min-h-12 border-b-2 px-1 py-3 text-center text-sm font-semibold transition-colors duration-150 hover:text-accent-text ${current ? "border-accent text-accent-text" : "border-transparent text-muted"}`}
            >
              {list.label}
            </Link>
          );
        })}
      </nav>
      <People profile={profile} kind={kind} />
    </>
  );
}

function People({ profile, kind }: { profile: PublicProfile; kind: PeopleListKind }) {
  const query = kind === "followers" ? api.follows.followers : api.follows.following;
  const { results, status, loadMore } = usePaginatedQuery(query, { userId: profile._id }, { initialNumItems: PEOPLE_PAGE_SIZE });

  if (status === "LoadingFirstPage") return <LoadingState label={`Loading ${kind}`} />;
  if (status === "Exhausted" && results.length === 0) {
    return (
      <EmptyState icon={<UserIcon className="size-6" />} title={kind === "followers" ? "No followers yet" : "Not following anyone yet"}>
        {kind === "followers"
          ? `When people follow @${profile.handle}, they'll show up here.`
          : `Accounts @${profile.handle} follows will show up here.`}
      </EmptyState>
    );
  }

  return (
    <>
      <ol className="min-w-0 bg-surface">{results.map(row => <li key={row._id}><ProfileRow profile={row.profile} /></li>)}</ol>
      {status === "CanLoadMore" || status === "LoadingMore" ? (
        <div className="bg-surface px-4 py-6 text-center sm:px-6">
          <Button variant="secondary" loading={status === "LoadingMore"} onClick={() => loadMore(PEOPLE_PAGE_SIZE)}>Load more</Button>
        </div>
      ) : null}
    </>
  );
}
