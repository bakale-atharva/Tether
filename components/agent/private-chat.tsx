"use client";

import Link from "next/link";
import { useConvexAuth } from "convex/react";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { SparkIcon } from "@/components/shell/icons";
import { ChatWorkspace } from "./chat-workspace";

export function PrivateChat() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  if (isLoading) return <LoadingState label="Loading your account" />;
  if (!isAuthenticated) return <EmptyState icon={<SparkIcon className="size-6" />} title="A little space to think" action={<Link href="/sign-in?redirect_url=%2Ftether" className={buttonStyles()}>Sign in</Link>}>Talk things through with Tether. Your conversations stay private, and Pro unlocks responses.</EmptyState>;
  return <ChatWorkspace />;
}
