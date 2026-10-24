"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useBilling } from "@/components/billing/billing-provider";
import { Button, buttonStyles } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { SparkIcon } from "@/components/shell/icons";
import { errorMessage } from "@/lib/errors";
import { ChatConversation } from "./chat-conversation";


export function ChatWorkspace() {
  const { summary, loading, refresh } = useBilling();
  const router = useRouter();
  const search = useSearchParams();
  const threadId = search.get("thread");
  const conversations = usePaginatedQuery(api.agentChat.list, {}, { initialNumItems: 10 });
  const detail = useQuery(api.agentChat.detail, threadId ? { threadId } : "skip");
  const create = useMutation(api.agentChat.create);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function newConversation() {
    if (busy) return;
    setBusy(true); setError(null);
    try { const id = await create({}); router.push(`/tether?thread=${encodeURIComponent(id)}`); }
    catch (e) { setError(errorMessage(e, "Couldn't create a conversation. Please try again.")); }
    finally { setBusy(false); }
  }
  const allowed = !!summary?.allowed;
  return <div className="min-w-0">
    {!allowed && <div className="border-b border-line bg-accent-soft px-4 py-4">
      <p className="text-sm font-medium">{loading ? "Checking your plan…" : summary?.verified ? "Make room for a conversation with Pro" : "We couldn't verify your plan"}</p>
      <p className="mt-1 text-sm text-muted">{summary?.verified ? "Get private AI conversations for $10/month. Your existing history is always here to read." : "Refresh your plan to try again. Your saved conversations are still available."}</p>
      <div className="mt-3 flex gap-2"><Link href="/pricing" className={buttonStyles({ size: "sm" })}>Explore Pro</Link><Button size="sm" variant="ghost" onClick={refresh} loading={loading}>Refresh plan</Button></div>
    </div>}
    <div className="sm:grid sm:grid-cols-[10rem_minmax(0,1fr)]">
    <nav aria-label="Private conversations" className="min-w-0 border-b border-line px-4 py-4 sm:border-r sm:border-b-0 sm:px-3">
      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-start"><h2 className="text-sm font-semibold">Your conversations</h2><Button size="sm" variant="secondary" loading={busy} onClick={newConversation}>New chat</Button></div>
      {conversations.status === "LoadingFirstPage" ? <p className="mt-3 text-sm text-muted" role="status">Loading conversations…</p> : conversations.results.length ? <ul className="mt-3 flex gap-2 overflow-x-auto pb-2 sm:max-h-[65dvh] sm:flex-col sm:overflow-y-auto">
        {conversations.results.map(c => <li key={c.threadId} className="shrink-0"><Link href={`/tether?thread=${encodeURIComponent(c.threadId)}`} aria-current={c.threadId === threadId ? "page" : undefined} className={`block max-w-48 truncate rounded-lg px-3 py-2 text-sm transition-colors ${c.threadId === threadId ? "bg-accent-soft font-medium text-accent-text" : "bg-surface-2 text-muted hover:text-ink"}`}>{c.title}</Link></li>)}
      </ul> : <p className="mt-3 text-sm text-muted">Your chats will be saved here.</p>}
      {conversations.status === "CanLoadMore" && <Button variant="ghost" size="sm" onClick={() => conversations.loadMore(10)}>Older conversations</Button>}
      {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
    </nav>
    <div className="min-w-0">{!threadId ? <EmptyState icon={<SparkIcon className="size-6" />} title="What’s on your mind?" action={<Button onClick={newConversation} loading={busy}>Start a conversation</Button>}>Untangle an idea, find the right words, or explore a question. Only you can read these chats.</EmptyState>
      : detail === undefined ? <LoadingState label="Loading conversation" />
      : detail === null ? <EmptyState title="Conversation not found" action={<Link className={buttonStyles({ variant: "secondary" })} href="/tether">Back to your conversations</Link>}>Choose a conversation from your list, or start a new one.</EmptyState>
      : <ChatConversation key={threadId} threadId={threadId} title={detail.title} allowed={allowed} />}</div>
    </div>
  </div>;
}
