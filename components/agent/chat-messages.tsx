"use client";

import { useEffect, useRef } from "react";
import { useUIMessages } from "@convex-dev/agent/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/states";

export function ChatMessages({ threadId, followSignal }: { threadId: string; followSignal: number }) {
  const messages = useUIMessages(api.agentChat.messages, { threadId }, { initialNumItems: 20, stream: true });
  const end = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  const last = messages.results.at(-1);
  useEffect(() => {
    follow.current = true;
    end.current?.scrollIntoView({ block: "nearest" });
  }, [followSignal]);
  useEffect(() => { if (follow.current) end.current?.scrollIntoView({ block: "nearest" }); }, [messages.results.length, last?.text]);
  return <>
    <div className="max-h-[55dvh] min-h-64 overflow-y-auto px-4 py-5 sm:px-6" onScroll={e => { const el = e.currentTarget; follow.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90; }}>
      {messages.status === "LoadingFirstPage" ? <LoadingState label="Loading messages" /> : <>
        {messages.status === "CanLoadMore" && <div className="mb-5 text-center"><Button size="sm" variant="ghost" onClick={() => { follow.current = false; messages.loadMore(20); }}>Load earlier messages</Button></div>}
        {messages.status === "LoadingMore" && <p role="status" className="mb-4 text-sm text-muted">Loading earlier messages…</p>}
        {messages.results.length === 0 && <div className="py-10"><p className="font-display text-2xl font-semibold">Let’s think it through.</p><p className="mt-2 text-sm leading-relaxed text-muted">Ask a question, bring an idea, or start wherever you are.</p></div>}
        <ol className="space-y-6" aria-label="Messages">{messages.results.filter(m => m.role === "user" || m.role === "assistant").map(m => <li key={m.key} className={m.role === "user" ? "ml-6 rounded-2xl bg-surface-2 px-4 py-3" : "pr-3"}>
          <p className={`mb-1.5 text-xs font-semibold ${m.role === "assistant" ? "text-accent-text" : "text-muted"}`}>{m.role === "user" ? "You" : "Tether"}</p>
          <p className="whitespace-pre-wrap break-words text-sm leading-7 [overflow-wrap:anywhere]">{m.text || (m.status === "streaming" || m.status === "pending" ? "Thinking…" : "No response was saved.")}</p>
          {m.status === "failed" && <p className="mt-1 text-xs text-muted">Response interrupted</p>}
        </li>)}</ol>
      </>}
      <div ref={end} />
    </div>
  </>;
}
