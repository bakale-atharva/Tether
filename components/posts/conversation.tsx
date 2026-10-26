"use client";

import Link from "next/link";
import { usePaginatedQuery, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/states";
import { ChatIcon } from "@/components/shell/icons";
import {
  THREAD_AUTO_EXPAND_DEPTH,
  THREAD_FIRST_PAGE_SIZE,
  THREAD_MAX_DEPTH,
  THREAD_NESTED_PAGE_SIZE,
} from "@/lib/constants";
import type { PublicPost } from "@/convex/posts";
import { PostCard, postHref, replyButtonId } from "./post-card";
import { ReplyComposer } from "./reply-composer";


export function ReplyList({ parentId, depth }: { parentId: Id<"posts">; depth: number }) {
  const pageSize = depth === 0 ? THREAD_FIRST_PAGE_SIZE : THREAD_NESTED_PAGE_SIZE;
  const { results, status, loadMore } = usePaginatedQuery(api.replies.list, { parentId }, { initialNumItems: pageSize });

  if (status === "LoadingFirstPage") {
    return (
      <div className="flex items-center gap-2 px-4 py-6 text-sm text-muted sm:px-8">
        <Spinner className="size-4" label="Loading replies" />
      </div>
    );
  }
  if (results.length === 0 && status === "Exhausted") {
    return depth === 0 ? (
      <EmptyState icon={<ChatIcon className="size-6" />} title="No replies yet">
        Start the conversation.
      </EmptyState>
    ) : null;
  }

  return (
    <div>
      <ol className="flex min-w-0 flex-col divide-y divide-line/70">
        {results.map((reply) => (
          <li key={reply._id}>
            <ReplyNode reply={reply} depth={depth} />
          </li>
        ))}
      </ol>
      {status === "CanLoadMore" || status === "LoadingMore" ? (
        <div className={depth === 0 ? "px-4 py-5 sm:px-8" : "px-3 py-2"}>
          <Button variant="ghost" size="sm" loading={status === "LoadingMore"} onClick={() => loadMore(pageSize)}>
            Show more replies
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function ReplyNode({ reply, depth }: { reply: PublicPost; depth: number }) {
  const [composing, setComposing] = useState(false);
  const [expanded, setExpanded] = useState(depth + 1 < THREAD_AUTO_EXPAND_DEPTH);
  const [postedId, setPostedId] = useState<Id<"posts"> | null>(null);
  const canNest = depth + 1 < THREAD_MAX_DEPTH;

  function closeComposer() {
    setComposing(false);
    // Return focus to the control that opened the composer.
    requestAnimationFrame(() => document.getElementById(replyButtonId(reply._id))?.focus());
  }

  return (
    <div className={depth === 0 ? "min-w-0 px-2 sm:px-5" : "min-w-0"}>
      <PostCard
        post={reply}
        compact
        onReply={reply.deleted ? undefined : () => (composing ? closeComposer() : setComposing(true))}
        replyOpen={composing}
      />
      {composing ? (
        <div className="mb-5 sm:ml-12">
          <ReplyComposer
            compact
            autoFocus
            parentId={reply._id}
            parentHandle={reply.author.handle}
            onCancel={closeComposer}
            onPosted={(replyId) => {
              setPostedId(replyId);
              setExpanded(true);
              closeComposer();
            }}
          />
        </div>
      ) : null}
      {postedId ? (
        <p role="status" className="mb-5 px-2 text-sm text-muted sm:ml-12">
          Reply posted.{" "}
          <Link href={`/${reply.author.handle}/post/${reply._id}`} className="font-medium text-accent-text hover:underline">
            View thread
          </Link>
        </p>
      ) : null}
      {reply.hasReplies ? (
        <div className="ml-2 min-w-0 border-l border-line pl-1 sm:ml-[1.625rem] sm:pl-2">
          {!canNest ? (
            <Link href={postHref(reply)} className="inline-flex min-h-11 items-center rounded-full px-3 py-2 text-sm font-medium text-accent-text hover:bg-accent-soft">
              Continue this thread →
            </Link>
          ) : expanded ? (
            <ReplyList parentId={reply._id} depth={depth + 1} />
          ) : (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              aria-expanded={false}
              className="inline-flex min-h-11 items-center rounded-full px-3 py-2 text-sm font-medium text-accent-text hover:bg-accent-soft"
            >
              {reply.replyCount > 0
                ? `Show ${reply.replyCount === 1 ? "1 reply" : `${reply.replyCount} replies`}`
                : "Show replies"}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

// The chain above a reply, root first, so a permalink keeps its context.
export function Ancestors({ postId }: { postId: Id<"posts"> }) {
  const data = useQuery(api.replies.ancestors, { postId });
  if (data === undefined) {
    return (
      <div className="flex items-center gap-2 px-4 py-6 text-sm text-muted sm:px-8">
        <Spinner className="size-4" label="Loading earlier messages" />
      </div>
    );
  }
  if (data.posts.length === 0) return null;

  return (
    <nav aria-label="Earlier in this conversation" className="border-b border-line/70 px-2 pt-3 sm:px-5">
      {data.truncated && data.root ? (
        <Link href={postHref(data.root)} className="mb-2 inline-flex min-h-11 items-center rounded-full px-3 py-2 text-sm font-medium text-accent-text hover:bg-accent-soft">
          ↑ Go to the start of this conversation
        </Link>
      ) : null}
      <ol>
        {data.posts.map((ancestor) => (
          <li key={ancestor._id} className="relative">
            {/* Connector from each ancestor's avatar down to the next message. */}
            <span aria-hidden="true" className="absolute top-14 bottom-0 left-6 w-px bg-line/70 sm:top-16 sm:left-7" />
            <PostCard post={ancestor} compact />
          </li>
        ))}
      </ol>
    </nav>
  );
}
