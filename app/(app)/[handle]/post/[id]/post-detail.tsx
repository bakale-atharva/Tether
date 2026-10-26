"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageHeader } from "@/components/ui/page-header";
import { Ancestors, ReplyList } from "@/components/posts/conversation";
import { PostCard } from "@/components/posts/post-card";
import { ReplyComposer, replyInputId } from "@/components/posts/reply-composer";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { buttonStyles } from "@/components/ui/button";

export function PostDetail({ handle, id }: { handle: string; id: string }) {
  const post = useQuery(api.posts.get, { handle, id });
  if (post === undefined) return <LoadingState label="Loading post" />;
  if (post === null) return <><PageHeader title="Post" /><EmptyState title="This post isn't available" action={<Link href={`/${handle}`} className={buttonStyles({ variant: "secondary" })}>Back to profile</Link>}>It may have been removed or the address is incorrect.</EmptyState></>;

  return (
    <>
      <PageHeader title={post.parentId ? "Thread" : "Post"} />
      {post.parentId ? <Ancestors postId={post._id} /> : null}
      <PostCard
        post={post}
        detail
        onReply={() => document.getElementById(replyInputId(post._id))?.focus()}
      />
      {post.deleted ? null : <ReplyComposer key={post._id} parentId={post._id} parentHandle={post.author.handle} />}
      <section aria-label="Replies" className="min-w-0 bg-surface pb-4">
        <h2 className="border-b border-line px-4 py-4 text-sm font-semibold text-ink sm:px-6">Replies</h2>
        <ReplyList parentId={post._id} depth={0} />
      </section>
    </>
  );
}
