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
import { PostCard, postHref, replyButtonId, type PublicPost } from "./post-card";
import { ReplyComposer } from "./reply-composer";

// Levels rendered beneath the focused message before handing off to the
// deeper message's own permalink, which keeps indentation readable on phones.
const MAX_DEPTH = 4;
// Levels that load their replies automatically; deeper ones wait for a tap.
const AUTO_EXPAND_DEPTH = 2;
const FIRST_PAGE = 10;
const NESTED_PAGE = 3;

export function ReplyList({ parentId, depth }: { parentId: Id<"posts">; depth: number }) {
  const pageSize = depth === 0 ? FIRST_PAGE : NESTED_PAGE;
  const { results, status, loadMore } = usePaginatedQuery(api.replies.list, { parentId }, { initialNumItems: pageSize });

  if (status === "LoadingFirstPage") {
    return (
      <div className="flex items-center gap-2 px-4 py-4 text-sm text-muted">
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
      <ol className="flex flex-col gap-1">
        {results.map((reply) => (
          <li key={reply._id}>
            <ReplyNode reply={reply} depth={depth} />
          </li>
        ))}
      </ol>
      {status === "CanLoadMore" || status === "LoadingMore" ? (
        <div className={depth === 0 ? "px-4 py-3 md:px-6" : "px-3 py-1"}>
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
  const [expanded, setExpanded] = useState(depth + 1 < AUTO_EXPAND_DEPTH);
  const [postedId, setPostedId] = useState<Id<"posts"> | null>(null);
  const canNest = depth + 1 < MAX_DEPTH;

  function closeComposer() {
    setComposing(false);
    // Return focus to the control that opened the composer.
    requestAnimationFrame(() => document.getElementById(replyButtonId(reply._id))?.focus());
  }

  return (
    <div className={depth === 0 ? "px-2 md:px-4" : ""}>
      <PostCard
        post={reply}
        compact
        onReply={reply.deleted ? undefined : () => (composing ? closeComposer() : setComposing(true))}
        replyOpen={composing}
      />
      {composing ? (
        <div className="mb-2 ml-11">
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
        <p role="status" className="mb-2 ml-11 text-sm text-muted">
          Reply posted.{" "}
          <Link href={`/${reply.author.handle}/post/${reply._id}`} className="font-medium text-accent-text hover:underline">
            View thread
          </Link>
        </p>
      ) : null}
      {reply.hasReplies ? (
        <div className="ml-4 border-l-2 border-line pl-1.5 sm:ml-[1.625rem] sm:pl-2">
          {!canNest ? (
            <Link href={postHref(reply)} className="inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-accent-text hover:bg-accent-soft">
              Continue this thread →
            </Link>
          ) : expanded ? (
            <ReplyList parentId={reply._id} depth={depth + 1} />
          ) : (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              aria-expanded={false}
              className="inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-accent-text hover:bg-accent-soft"
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
      <div className="flex items-center gap-2 px-4 py-4 text-sm text-muted md:px-6">
        <Spinner className="size-4" label="Loading earlier messages" />
      </div>
    );
  }
  if (data.posts.length === 0) return null;

  return (
    <nav aria-label="Earlier in this conversation" className="border-b border-line px-2 pt-2 md:px-4">
      {data.truncated && data.root ? (
        <Link href={postHref(data.root)} className="mb-1 inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-accent-text hover:bg-accent-soft">
          ↑ Go to the start of this conversation
        </Link>
      ) : null}
      <ol>
        {data.posts.map((ancestor) => (
          <li key={ancestor._id} className="relative">
            {/* Connector from each ancestor's avatar down to the next message. */}
            <span aria-hidden="true" className="absolute top-12 bottom-0 left-[1.75rem] w-0.5 bg-line" />
            <PostCard post={ancestor} compact />
          </li>
        ))}
      </ol>
    </nav>
  );
}
