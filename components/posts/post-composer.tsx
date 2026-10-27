"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { POST_MAX, characterCount, postProblem } from "@/convex/lib/content";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";
import { useViewer } from "@/hooks/use-viewer";
import { useUploadBatch } from "./use-upload-batch";
import { useDraftImages } from "./use-draft-images";
import { DraftImages } from "./draft-images";


export function PostComposer() {
  const viewer = useViewer();
  const create = useMutation(api.posts.create);
  const withUploads = useUploadBatch();
  const draft = useDraftImages();
  const { images } = draft;
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  if (viewer.status !== "ready") return null;
  const remaining = POST_MAX - characterCount(body.trim());

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const problem = postProblem(body, images.length);
    if (problem) { setError(problem); return; }
    setSending(true); setError(null);
    try {
      await withUploads(async upload => {
        const attachments = [];
        for (const image of images) attachments.push({ uploadId: await upload(image.file, "post"), alt: image.alt });
        await create({ body, images: attachments });
      });
      setBody(""); draft.clear();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your post couldn't be published.");
    } finally { setSending(false); }
  }
  return <form onSubmit={submit} className="border-b border-line/70 px-4 py-6 sm:px-8 sm:py-8">
    <fieldset disabled={sending} className="grid min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 gap-y-5 sm:gap-x-4"><Avatar name={viewer.profile.displayName} src={viewer.profile.avatarUrl} />
      <div className="min-w-0 flex-1">
        <label className="mb-1 block text-sm font-medium text-ink" htmlFor="post-body">Write a post</label>
        <textarea id="post-body" value={body} onChange={event => setBody(event.target.value)} placeholder="What are you tethering together?" rows={3} className="min-h-28 w-full resize-y rounded-2xl bg-surface-2 p-4 text-base leading-relaxed text-ink outline-none placeholder:text-muted focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring" />
      </div>
      <div className="col-span-2 min-w-0 sm:col-span-1 sm:col-start-2">
        {images.length > 0 && <DraftImages images={images} onRemove={draft.remove} onDescribe={draft.describe} />}
        <div className="flex flex-wrap items-center justify-between gap-2"><label className="relative inline-flex min-h-11 w-fit shrink-0 cursor-pointer items-center rounded-full px-3 text-sm font-medium text-accent-text transition-colors hover:bg-accent-soft focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring">Add images<input type="file" accept="image/jpeg,image/png,image/webp" multiple className="absolute inset-0 h-full w-full min-w-0 cursor-pointer opacity-0" onChange={event => { setError(draft.add(event.target.files)); event.currentTarget.value = ""; }} /></label><div className="flex items-center gap-3"><span aria-label={`${remaining} characters remaining`} className={`text-sm tabular-nums ${remaining < 0 ? "text-danger" : "text-muted"}`}>{remaining}</span><Button type="submit" loading={sending} disabled={sending || (body.trim().length === 0 && images.length === 0) || remaining < 0}>Post</Button></div></div>
        {error ? <ErrorState title="Post couldn't be published">{error}</ErrorState> : null}
      </div></fieldset>
  </form>;
}
