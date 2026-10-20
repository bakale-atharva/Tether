"use client";
/* eslint-disable @next/next/no-img-element -- Convex storage URLs are signed at read time. */

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import { ChatIcon } from "@/components/shell/icons";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";
import { useViewer } from "@/hooks/use-viewer";
import { errorMessage } from "@/lib/errors";

export type PublicPost = Exclude<FunctionReturnType<typeof api.posts.get>, null>;

export function postHref(post: Pick<PublicPost, "_id" | "author">) {
  return `/${post.author.handle}/post/${post._id}`;
}

export function replyButtonId(postId: string) {
  return `reply-button-${postId}`;
}

type PostCardProps = {
  post: PublicPost;
  // The focused message on its permalink: larger date, highlighted.
  detail?: boolean;
  // Tighter layout without a bottom rule, for messages inside a thread.
  compact?: boolean;
  // When set, Reply toggles an inline composer instead of opening the permalink.
  onReply?: () => void;
  replyOpen?: boolean;
};

export function PostCard({ post, detail = false, compact = false, onReply, replyOpen = false }: PostCardProps) {
  const viewer = useViewer();
  const remove = useMutation(api.posts.remove);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const isOwner = viewer.status === "ready" && viewer.profile._id === post.author._id;
  const isReply = post.parentId !== null;
  const href = postHref(post);
  const created = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: detail ? "numeric" : undefined, hour: "numeric", minute: "2-digit" }).format(post._creationTime);
  const frame = compact
    ? "rounded-xl px-3 py-3"
    : `border-b border-line px-4 py-4 md:px-6 ${detail ? "bg-surface/60" : ""}`;

  async function deletePost() {
    const noun = isReply ? "reply" : "post";
    if (!window.confirm(`Delete this ${noun}? This cannot be undone.`)) return;
    setRemoving(true); setError(null);
    try { await remove({ postId: post._id }); }
    catch (cause) { setError(errorMessage(cause, `Couldn't delete this ${noun}.`)); }
    finally { setRemoving(false); }
  }

  if (post.deleted) {
    return (
      <article aria-label="Deleted message" className={`${frame} text-sm italic text-muted`}>
        {isReply ? "This reply was deleted." : "This post was deleted."}
      </article>
    );
  }

  const replyLabel = post.replyCount === 1 ? "1 reply" : `${post.replyCount} replies`;
  return (
    <article
      aria-label={`${isReply ? "Reply" : "Post"} by ${post.author.displayName}`}
      className={`${frame} transition-colors hover:bg-surface/50`}
    >
      <div className="flex gap-3">
        <Link href={`/${post.author.handle}`} aria-label={`View ${post.author.displayName}'s profile`} className="shrink-0 self-start rounded-full">
          <Avatar name={post.author.displayName} src={post.author.avatarUrl} size={compact ? "sm" : "md"} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1 text-sm">
            <Link href={`/${post.author.handle}`} className="font-semibold text-ink hover:underline">{post.author.displayName}</Link>
            <Link href={`/${post.author.handle}`} className="text-muted hover:underline">@{post.author.handle}</Link>
            <span aria-hidden="true" className="text-muted">·</span>
            <Link href={href} className="text-muted hover:underline"><time dateTime={new Date(post._creationTime).toISOString()}>{created}</time></Link>
          </div>
          {post.body ? (
            <Link href={href} className={`mt-1 block whitespace-pre-wrap break-words leading-relaxed text-ink ${detail ? "text-lg" : ""}`}>{post.body}</Link>
          ) : null}
          {post.images.length ? <div className={`mt-3 grid gap-2 ${post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {post.images.map((image, index) => image.url ? <img key={index} src={image.url} alt={image.alt} className="max-h-[27.5rem] w-full rounded-2xl border border-line object-cover" /> : null)}
          </div> : null}
          <div className="-ml-2 mt-2 flex items-center justify-between">
            {onReply ? (
              <button
                id={replyButtonId(post._id)}
                type="button"
                onClick={onReply}
                aria-expanded={replyOpen}
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-2 text-sm text-muted transition-colors hover:bg-accent-soft hover:text-accent-text"
              >
                <ChatIcon className="size-[1.125rem]" />
                <span>Reply</span>
                {post.replyCount > 0 ? (
                  <>
                    <span aria-hidden="true" className="tabular-nums">· {post.replyCount}</span>
                    <span className="sr-only">, {replyLabel}</span>
                  </>
                ) : null}
              </button>
            ) : (
              <Link
                href={href}
                aria-label={post.replyCount > 0 ? `${replyLabel}. Open conversation` : "Reply"}
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-2 text-sm text-muted transition-colors hover:bg-accent-soft hover:text-accent-text"
              >
                <ChatIcon className="size-[1.125rem]" />
                <span aria-hidden="true">{post.replyCount > 0 ? post.replyCount : "Reply"}</span>
              </Link>
            )}
            {isOwner ? <Button variant="ghost" size="sm" loading={removing} onClick={deletePost}>Delete</Button> : null}
          </div>
          {error ? <ErrorState title="Message wasn't deleted">{error}</ErrorState> : null}
        </div>
      </div>
    </article>
  );
}
