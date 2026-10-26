"use client";

import { SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { useMutation, usePaginatedQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { PostCard } from "@/components/posts/post-card";
import { BookmarkIcon } from "@/components/shell/icons";
import { Button, buttonStyles } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { useViewer } from "@/hooks/use-viewer";
import { FEED_PAGE_SIZE } from "@/lib/constants";
import { errorMessage } from "@/lib/errors";

export function SavedPosts() {
  const viewer = useViewer();
  const ready = viewer.status === "ready";
  const { results, status, loadMore } = usePaginatedQuery(api.bookmarks.list, ready ? {} : "skip", { initialNumItems: FEED_PAGE_SIZE });

  if (viewer.status === "signedOut") {
    return (
      <EmptyState
        icon={<BookmarkIcon className="size-6" />}
        title="Save posts for later"
        action={<SignInButton mode="modal"><button type="button" className={buttonStyles()}>Sign in to see bookmarks</button></SignInButton>}
      >
        Bookmarks are private to your account.
      </EmptyState>
    );
  }
  if (!ready || status === "LoadingFirstPage") return <LoadingState label="Loading bookmarks" />;
  if (status === "Exhausted" && results.length === 0) {
    return (
      <EmptyState
        icon={<BookmarkIcon className="size-6" />}
        title="Nothing saved yet"
        action={<Link href="/" className={buttonStyles({ variant: "secondary" })}>Browse the feed</Link>}
      >
        Tap the bookmark on any post to keep it here, privately.
      </EmptyState>
    );
  }

  return (
    <>
      <ol aria-label="Saved posts">
        {results.map(({ _id, post }) => (
          <li key={_id}>{post.deleted ? <DeletedBookmark postId={post._id} /> : <PostCard post={post} />}</li>
        ))}
      </ol>
      {status === "CanLoadMore" || status === "LoadingMore" ? (
        <div className="border-t border-line px-4 py-6 text-center sm:px-6">
          <Button variant="secondary" loading={status === "LoadingMore"} onClick={() => loadMore(FEED_PAGE_SIZE)}>Load more</Button>
        </div>
      ) : null}
    </>
  );
}

// A saved post its author deleted: nothing left to show, so offer removal.
function DeletedBookmark({ postId }: { postId: Id<"posts"> }) {
  const setBookmarked = useMutation(api.bookmarks.set);
  const toast = useToast();
  const [removing, setRemoving] = useState(false);

  async function remove() {
    setRemoving(true);
    try {
      await setBookmarked({ postId, bookmarked: false });
    } catch (cause) {
      toast(errorMessage(cause, "Couldn't remove this bookmark. Try again."));
      setRemoving(false);
    }
  }

  return (
    <article aria-label="Deleted post" className="flex items-start justify-between gap-4 border-b border-line bg-surface-2/40 px-4 py-5 sm:px-6">
      <div className="flex min-w-0 items-start gap-3 pt-2">
        <BookmarkIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted" />
        <p className="text-sm leading-relaxed text-muted">This post was deleted by its author.</p>
      </div>
      <Button variant="secondary" size="sm" className="shrink-0" loading={removing} onClick={remove}>Remove</Button>
    </article>
  );
}
