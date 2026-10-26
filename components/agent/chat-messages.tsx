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
    <div className="max-h-[55dvh] min-h-64 overflow-y-auto overscroll-y-contain px-4 py-7 sm:px-6 sm:py-8" onScroll={e => { const el = e.currentTarget; follow.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90; }}>
      {messages.status === "LoadingFirstPage" ? <LoadingState label="Loading messages" /> : <>
        {messages.status === "CanLoadMore" && <div className="mb-5 text-center"><Button size="sm" variant="ghost" onClick={() => { follow.current = false; messages.loadMore(20); }}>Load earlier messages</Button></div>}
        {messages.status === "LoadingMore" && <p role="status" className="mb-4 text-sm text-muted">Loading earlier messages…</p>}
        {messages.results.length === 0 && <div className="max-w-sm py-10"><p className="font-display text-[1.75rem] leading-tight font-semibold tracking-tight text-balance">Let’s think it through.</p><p className="mt-3 text-base leading-relaxed text-muted">Ask a question, bring an idea, or start wherever you are.</p></div>}
        <ol className="space-y-6" aria-label="Messages">{messages.results.filter(m => m.role === "user" || m.role === "assistant").map(m => <li key={m.key} className={`rounded-[1.25rem] py-4 ${m.role === "user" ? "ml-auto max-w-[92%] bg-surface-2/75 px-4 sm:max-w-[88%] sm:px-5" : "max-w-[70ch] px-1"}`}>
          <p className="mb-2 text-sm font-semibold text-ink">{m.role === "user" ? "You" : "Tether"}</p>
          <p className="whitespace-pre-wrap break-words text-base leading-[1.6] text-ink [overflow-wrap:anywhere]">{m.text || (m.status === "streaming" || m.status === "pending" ? "Thinking…" : "No response was saved.")}</p>
          {m.status === "failed" && <p className="mt-1 text-xs text-muted">Response interrupted</p>}
        </li>)}</ol>
      </>}
      <div ref={end} />
    </div>
  </>;
}
