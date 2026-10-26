"use client";

import { SignInButton } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { POST_MAX, characterCount, replyProblem } from "@/convex/lib/content";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonStyles } from "@/components/ui/button";
import { useViewer } from "@/hooks/use-viewer";
import { errorMessage } from "@/lib/errors";

export function replyInputId(parentId: string) {
  return `reply-input-${parentId}`;
}

type ReplyComposerProps = {
  parentId: Id<"posts">;
  parentHandle: string;
  autoFocus?: boolean;
  compact?: boolean;
  onPosted?: (replyId: Id<"posts">) => void;
  // Inline composers can be dismissed; the permalink composer stays open.
  onCancel?: () => void;
};

export function ReplyComposer({ parentId, parentHandle, autoFocus = false, compact = false, onPosted, onCancel }: ReplyComposerProps) {
  const viewer = useViewer();
  const createReply = useMutation(api.replies.create);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  if (viewer.status === "loading" || viewer.status === "needsOnboarding") return null;
  if (viewer.status === "signedOut") {
    return (
      <div className={`flex flex-wrap items-center justify-between gap-3 ${compact ? "rounded-xl bg-surface-2 p-3" : "border-b border-line bg-surface px-4 py-5 sm:px-6"}`}>
        <p className="text-sm text-muted">Sign in to join the conversation.</p>
        <SignInButton mode="modal">
          <button type="button" className={buttonStyles({ size: "sm" })}>Sign in to reply</button>
        </SignInButton>
      </div>
    );
  }

  const remaining = POST_MAX - characterCount(body.trim());
  const inputId = replyInputId(parentId);
  const errorId = `${inputId}-error`;

  async function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (sending) return;
    const problem = replyProblem(body);
    if (problem) { setError(problem); return; }
    setSending(true); setError(null);
    try {
      const replyId = await createReply({ parentId, body });
      setBody("");
      onPosted?.(replyId);
    } catch (cause) {
      setError(errorMessage(cause, "Your reply couldn't be posted. Check your connection and try again."));
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (sending || event.nativeEvent.isComposing) return;
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void submit();
    } else if (event.key === "Escape" && onCancel) {
      event.preventDefault();
      onCancel();
    }
  }

  return (
    <form
      onSubmit={submit}
      className={compact ? "rounded-xl border border-line bg-surface p-3" : "border-b border-line bg-surface px-4 py-5 sm:px-6"}
    >
      <div className="flex gap-3">
        <Avatar name={viewer.profile.displayName} src={viewer.profile.avatarUrl} size={compact ? "sm" : "md"} />
        <div className="min-w-0 flex-1">
          <label htmlFor={inputId} className="block text-sm wrap-anywhere text-muted">
            Replying to <span className="font-medium text-accent-text">@{parentHandle}</span>
          </label>
          <textarea
            disabled={sending}
            id={inputId}
            value={body}
            autoFocus={autoFocus}
            onChange={(event) => setBody(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Add to the conversation"
            rows={compact ? 2 : 3}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className="mt-2 min-h-20 w-full resize-y rounded-lg bg-transparent text-base leading-relaxed text-ink outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          />
          {error ? <p id={errorId} role="alert" className="mt-1 text-sm text-danger">{error}</p> : null}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-line pt-3">
        <span className={`mr-auto text-sm tabular-nums ${remaining < 0 ? "text-danger" : remaining <= 20 ? "text-accent-text" : "text-muted"}`}>
          {remaining < 0 ? `${-remaining} over the limit` : `${remaining} left`}
        </span>
        {onCancel ? <Button variant="ghost" size="sm" disabled={sending} onClick={onCancel}>Cancel</Button> : null}
        <Button type="submit" size="sm" loading={sending} disabled={body.trim().length === 0 || remaining < 0}>
          Reply
        </Button>
      </div>
    </form>
  );
}
