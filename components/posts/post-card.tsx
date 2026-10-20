"use client";
/* eslint-disable @next/next/no-img-element -- Convex storage URLs are signed at read time. */

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";
import { useViewer } from "@/hooks/use-viewer";

type Post = NonNullable<FunctionReturnType<typeof api.posts.get>>;

export function PostCard({ post, detail = false }: { post: Exclude<Post, null>; detail?: boolean }) {
  const viewer = useViewer();
  const remove = useMutation(api.posts.remove);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const isOwner = viewer.status === "ready" && viewer.profile._id === post.author._id;
  const href = `/${post.author.handle}/post/${post._id}`;
  const created = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: detail ? "numeric" : undefined, hour: "numeric", minute: "2-digit" }).format(post._creationTime);

  async function deletePost() {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    setRemoving(true); setError(null);
    try { await remove({ postId: post._id }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Couldn't delete this post."); }
    finally { setRemoving(false); }
  }

  if (post.deleted) {
    return <article className="border-b border-line px-4 py-5 text-sm italic text-muted md:px-6">This post was deleted.</article>;
  }
  return (
    <article className="border-b border-line px-4 py-4 transition-colors hover:bg-surface/50 md:px-6">
      <div className="flex gap-3">
        <Link href={`/${post.author.handle}`} aria-label={`View ${post.author.displayName}'s profile`}><Avatar name={post.author.displayName} src={post.author.avatarUrl} /></Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1 text-sm">
            <Link href={`/${post.author.handle}`} className="font-semibold text-ink hover:underline">{post.author.displayName}</Link>
            <Link href={`/${post.author.handle}`} className="text-muted hover:underline">@{post.author.handle}</Link>
            <span className="text-muted">·</span>
            <Link href={href} className="text-muted hover:underline"><time dateTime={new Date(post._creationTime).toISOString()}>{created}</time></Link>
          </div>
          <Link href={href} className="mt-1 block whitespace-pre-wrap break-words leading-relaxed text-ink">{post.body}</Link>
          {post.images.length ? <div className={`mt-3 grid gap-2 ${post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {post.images.map((image, index) => image.url ? <img key={index} src={image.url} alt={image.alt} className="max-h-[27.5rem] w-full rounded-2xl border border-line object-cover" /> : null)}
          </div> : null}
          {isOwner ? <div className="mt-3 flex justify-end"><Button variant="ghost" size="sm" loading={removing} onClick={deletePost}>Delete</Button></div> : null}
          {error ? <ErrorState title="Post wasn't deleted">{error}</ErrorState> : null}
        </div>
      </div>
    </article>
  );
}
