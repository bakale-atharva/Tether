"use client";

import { SignInButton } from "@clerk/nextjs";
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
      <EmptyState icon={<BookmarkIcon className="size-6" />} title="Nothing saved yet">
        Tap the bookmark on any post to keep it here, privately.
      </EmptyState>
    );
  }

  return (
    <>
      <ol>
        {results.map(({ _id, post }) => (
          <li key={_id}>{post.deleted ? <DeletedBookmark postId={post._id} /> : <PostCard post={post} />}</li>
        ))}
      </ol>
      {status === "CanLoadMore" || status === "LoadingMore" ? (
        <div className="p-5 text-center">
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
    <article aria-label="Deleted post" className="flex items-center justify-between gap-3 border-b border-line px-4 py-4 md:px-6">
      <p className="text-sm italic text-muted">This post was deleted by its author.</p>
      <Button variant="secondary" size="sm" loading={removing} onClick={remove}>Remove</Button>
    </article>
  );
}
