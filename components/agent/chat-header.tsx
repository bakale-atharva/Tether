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
    <div className="border-b border-line px-4 py-3">
      {editing ? <form onSubmit={saveTitle} className="flex flex-wrap items-end gap-2"><Field id="chat-title" label="Conversation title" disabled={busy} value={newTitle} onChange={e => setNewTitle(e.target.value)} maxLength={80} autoFocus className="min-w-0 flex-1" /><Button type="submit" size="sm" loading={busy}>Save</Button><Button size="sm" variant="ghost" disabled={busy} onClick={() => setEditing(false)}>Cancel</Button></form>
        : <div className="flex items-center justify-between gap-3"><h2 className="min-w-0 truncate text-sm font-semibold">{title}</h2><Button size="sm" variant="ghost" onClick={() => { setNewTitle(title); setEditing(true); }}>Rename</Button></div>}
      <p className="mt-1 text-xs text-muted">Private · Only you can read this conversation</p>
    </div>
    {error && <p role="alert" className="px-4 py-2 text-sm text-danger">{error}</p>}
  </>;
}
