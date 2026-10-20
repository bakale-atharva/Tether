"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageHeader } from "@/components/shell/app-shell";
import { PostCard } from "@/components/posts/post-card";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { buttonStyles } from "@/components/ui/button";

export function PostDetail({ handle, id }: { handle: string; id: string }) {
  const post = useQuery(api.posts.get, { handle, id });
  if (post === undefined) return <LoadingState label="Loading post" />;
  if (post === null) return <><PageHeader title="Post" /><EmptyState title="This post isn't available" action={<Link href={`/${handle}`} className={buttonStyles({ variant: "secondary" })}>Back to profile</Link>}>It may have been removed or the address is incorrect.</EmptyState></>;
  return <><PageHeader title="Post" /><PostCard post={post} detail /></>;
}
