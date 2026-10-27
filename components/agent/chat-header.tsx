"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { errorMessage } from "@/lib/errors";

export function ChatHeader({ threadId, title }: { threadId: string; title: string }) {
  const rename = useMutation(api.agentChat.rename);
  const [editing, setEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function saveTitle(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(null);
    try { await rename({ threadId, title: newTitle }); setEditing(false); }
    catch (e) { setError(errorMessage(e, "Couldn't rename this conversation.")); }
    finally { setBusy(false); }
  }
  return <>
    <div className="border-b border-line px-4 py-5 sm:px-6">
      {editing ? <form onSubmit={saveTitle} className="flex flex-wrap items-end gap-2"><Field id="chat-title" label="Conversation title" disabled={busy} value={newTitle} onChange={e => setNewTitle(e.target.value)} maxLength={80} autoFocus className="min-w-0 flex-1" /><Button type="submit" size="sm" loading={busy}>Save</Button><Button size="sm" variant="ghost" disabled={busy} onClick={() => setEditing(false)}>Cancel</Button></form>
        : <div className="flex items-start justify-between gap-2"><h2 className="min-w-0 self-center text-lg leading-snug font-semibold text-ink [overflow-wrap:anywhere]">{title}</h2><Button size="sm" variant="ghost" className="shrink-0" onClick={() => { setNewTitle(title); setEditing(true); }}>Rename</Button></div>}
      <p className="mt-2 text-xs leading-relaxed text-muted">Private · Only you can read this conversation</p>
    </div>
    {error && <p role="alert" className="border-b border-line bg-danger-soft px-4 py-3 text-sm leading-relaxed text-danger [overflow-wrap:anywhere] sm:px-6">{error}</p>}
  </>;
}
