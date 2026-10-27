"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/errors";
import { isActive } from "@/convex/lib/agentPolicy";

import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";

export function ChatConversation({ threadId, title, allowed }: { threadId: string; title: string; allowed: boolean }) {
  const state = useQuery(api.agentRequests.state, { threadId });
  const send = useAction(api.agentRequests.send);
  const retry = useAction(api.agentRequests.retry);
  const stop = useMutation(api.agentRequests.stop);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const lastSubmission = useRef<{ prompt: string; id: string } | null>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const restoreFocus = useRef(false);
  const [followSignal, setFollowSignal] = useState(0);
  useEffect(() => {
    if (!busy && restoreFocus.current) {
      composer.current?.focus();
      restoreFocus.current = false;
    }
  }, [busy]);
  const latest = state?.latest;
  const activeHere = latest && isActive(latest.status);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || state?.active || !allowed || !prompt.trim()) return;
    setBusy(true); setError(null);
    setFollowSignal(value => value + 1);
    const text = prompt.trim();
    // Retain the submission id across ambiguous network failures; never double charge.
    if (lastSubmission.current?.prompt !== text) lastSubmission.current = { prompt: text, id: crypto.randomUUID() };
    try {
      await send({ threadId, prompt: text, clientRequestId: lastSubmission.current.id });
      setPrompt(""); lastSubmission.current = null; restoreFocus.current = true;
    } catch (e) { setError(errorMessage(e, "Couldn't send your message. Try sending it again.")); }
    finally { setBusy(false); }
  }
  async function runControl(kind: "stop" | "retry") {
    if (!latest || busy) return;
    setBusy(true); setError(null);
    try { await (kind === "stop" ? stop({ requestId: latest.id }) : retry({ requestId: latest.id })); }
    catch (e) { setError(errorMessage(e, "Couldn't update this request. Please try again.")); }
    finally { setBusy(false); }
  }
  return <section aria-label="Current conversation" className="min-w-0">
    <ChatHeader threadId={threadId} title={title} />
    <ChatMessages threadId={threadId} followSignal={followSignal} />
    <div className="sr-only" role="status" aria-live="polite">{latest?.status === "complete" ? "Tether's response is ready." : latest?.status === "canceled" ? "Response stopped." : activeHere ? "Tether is responding." : ""}</div>
    <div className="border-t border-line px-4 py-5 sm:px-6 sm:py-6">
      {latest?.error && <div role="alert" className="mb-4 rounded-[1.25rem] bg-danger-soft p-4 text-sm leading-relaxed text-danger [overflow-wrap:anywhere]"><p>{latest.error.message}</p>{latest.error.code === "PRO_REQUIRED" && <Link href="/pricing" className="mt-2 inline-flex min-h-11 items-center font-semibold text-accent-text underline">Explore Pro</Link>}</div>}
      {(latest?.status === "failed" || latest?.status === "canceled") && <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted">{latest.status === "canceled" ? "Response stopped." : "Your message is saved."}</p><Button size="sm" variant="secondary" loading={busy} disabled={!allowed || !!state?.active} onClick={() => runControl("retry")}>Retry response</Button></div>}
      {error && <p role="alert" className="mb-4 text-sm leading-relaxed text-danger [overflow-wrap:anywhere]">{error}</p>}
      <form onSubmit={submit}>
        <label htmlFor="chat-message" className="mb-2 block text-sm font-semibold text-ink">Message Tether</label>
        <textarea ref={composer} id="chat-message" value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} maxLength={8000} disabled={!allowed || busy} aria-describedby="chat-help" placeholder={allowed ? "What would you like to explore?" : "Pro unlocks new responses"} className="block min-h-28 w-full resize-y scroll-mb-24 rounded-[1.25rem] border border-transparent bg-surface-2/70 px-4 py-3.5 text-base leading-[1.6] text-ink outline-none transition-colors duration-150 placeholder:text-muted focus:outline-solid focus:outline-2 focus:outline-offset-2 focus:outline-ring disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted" onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p id="chat-help" className="min-w-0 flex-1 basis-44 text-xs leading-5 text-muted">Enter to send · Shift + Enter for a new line<br />50 requests per UTC day, shared with mentions.</p>
          {activeHere ? <Button variant="secondary" loading={busy || latest.status === "stopping"} onClick={() => runControl("stop")}>{latest.status === "stopping" ? "Stopping…" : "Stop response"}</Button> : <Button type="submit" loading={busy} disabled={!allowed || !state || !!state.active || !prompt.trim()}>Send</Button>}
        </div>
        {state?.active && !activeHere && <p role="status" className="mt-4 rounded-[1.25rem] bg-surface-2/60 px-4 py-3 text-sm leading-relaxed text-muted">Tether is responding in another conversation. Wait for it to finish before sending.</p>}
      </form>
      <p className="mt-4 text-xs leading-relaxed text-muted">Tether can make mistakes. Check important information.</p>
    </div>
  </section>;
}
