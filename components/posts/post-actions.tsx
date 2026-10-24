"use client";

import { SignInButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import type { ReactNode } from "react";
import { api } from "@/convex/_generated/api";
import type { InteractionState } from "@/convex/interactions";
import { nextToggledCount } from "@/convex/lib/content";
import type { PublicPost } from "@/convex/posts";
import { BookmarkIcon, HeartIcon } from "@/components/shell/icons";
import { useToast } from "@/components/ui/toast";
import { useViewer } from "@/hooks/use-viewer";
import { errorMessage } from "@/lib/errors";

export const actionButtonClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl px-2 text-sm text-muted transition-colors duration-150 hover:bg-accent-soft hover:text-accent-text focus-visible:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-55 sm:min-h-9 sm:min-w-9";

const UNKNOWN_STATE: InteractionState = { likeCount: 0, liked: false, bookmarked: false };

// Live count and the viewer's own choices. Counts aren't on the post itself, so
// controls stay disabled until this answers instead of toggling a guessed state.
function useInteractionState(post: PublicPost) {
  const state = useQuery(api.interactions.viewerState, { postId: post._id });
  return { state: state ?? UNKNOWN_STATE, loaded: state !== undefined };
}

// Visitors see the same control, but pressing it opens sign-in instead.
function SignInAction({ label, children }: { label: string; children: ReactNode }) {
  return (
    <SignInButton mode="modal">
      <button type="button" aria-label={label} className={actionButtonClass}>{children}</button>
    </SignInButton>
  );
}

export function LikeButton({ post }: { post: PublicPost }) {
  const viewer = useViewer();
  const toast = useToast();
  const { state, loaded } = useInteractionState(post);
  // Convex discards this local change automatically if the mutation fails.
  const setLiked = useMutation(api.likes.set).withOptimisticUpdate((store, { postId, liked }) => {
    const current = store.getQuery(api.interactions.viewerState, { postId });
    if (current) {
      store.setQuery(api.interactions.viewerState, { postId }, {
        ...current, liked, likeCount: nextToggledCount(current.likeCount, current.liked, liked),
      });
    }
  });

  const countLabel = !loaded ? "" : state.likeCount === 1 ? ", 1 like" : `, ${state.likeCount} likes`;
  const content = (
    <>
      <HeartIcon filled={state.liked} className={`size-[1.125rem] ${state.liked ? "text-accent" : ""}`} />
      {state.likeCount > 0 ? <span aria-hidden="true" className="tabular-nums">{state.likeCount}</span> : null}
    </>
  );

  if (viewer.status === "signedOut") return <SignInAction label={`Sign in to like${countLabel}`}>{content}</SignInAction>;

  async function toggle() {
    const liked = !state.liked;
    try {
      await setLiked({ postId: post._id, liked });
    } catch (cause) {
      toast(errorMessage(cause, liked ? "Couldn't like this message. Try again." : "Couldn't remove your like. Try again."));
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={viewer.status !== "ready" || !loaded}
      aria-pressed={state.liked}
      aria-label={`Like${countLabel}`}
      className={`${actionButtonClass} ${state.liked ? "text-accent-text" : ""}`}
    >
      {content}
    </button>
  );
}

// Top-level posts only; the server rejects bookmarks on replies as well.
export function BookmarkButton({ post }: { post: PublicPost }) {
  const viewer = useViewer();
  const toast = useToast();
  const { state, loaded } = useInteractionState(post);
  const setBookmarked = useMutation(api.bookmarks.set).withOptimisticUpdate((store, { postId, bookmarked }) => {
    const current = store.getQuery(api.interactions.viewerState, { postId });
    if (current) store.setQuery(api.interactions.viewerState, { postId }, { ...current, bookmarked });
  });

  const content = <BookmarkIcon filled={state.bookmarked} className={`size-[1.125rem] ${state.bookmarked ? "text-accent" : ""}`} />;
  if (viewer.status === "signedOut") return <SignInAction label="Sign in to bookmark">{content}</SignInAction>;

  async function toggle() {
    const bookmarked = !state.bookmarked;
    try {
      await setBookmarked({ postId: post._id, bookmarked });
    } catch (cause) {
      toast(errorMessage(cause, bookmarked ? "Couldn't save this post. Try again." : "Couldn't remove this bookmark. Try again."));
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={viewer.status !== "ready" || !loaded}
      aria-pressed={state.bookmarked}
      aria-label="Bookmark"
      title={state.bookmarked ? "Remove bookmark" : "Bookmark privately"}
      className={`${actionButtonClass} ${state.bookmarked ? "text-accent-text" : ""}`}
    >
      {content}
    </button>
  );
}
