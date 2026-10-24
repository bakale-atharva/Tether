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
  return <form onSubmit={submit} className="border-b border-line px-4 py-4 md:px-6">
    <fieldset disabled={sending} className="flex min-w-0 gap-3"><Avatar name={viewer.profile.displayName} src={viewer.profile.avatarUrl} />
      <div className="min-w-0 flex-1">
        <label className="sr-only" htmlFor="post-body">Write a post</label>
        <textarea id="post-body" value={body} onChange={event => setBody(event.target.value)} placeholder="What are you tethering together?" rows={3} className="min-h-22 w-full resize-y bg-transparent text-lg leading-relaxed outline-none placeholder:text-muted" />
        {images.length > 0 && <DraftImages images={images} onRemove={draft.remove} onDescribe={draft.describe} />}
        <div className="flex items-center justify-between border-t border-line pt-3"><label className="cursor-pointer text-sm font-medium text-accent-text hover:underline">Add images<input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={event => { setError(draft.add(event.target.files)); event.currentTarget.value = ""; }} /></label><div className="flex items-center gap-3"><span className={remaining < 0 ? "text-sm text-danger" : "text-sm text-muted"}>{remaining}</span><Button type="submit" loading={sending} disabled={sending || (body.trim().length === 0 && images.length === 0) || remaining < 0}>Post</Button></div></div>
        {error ? <ErrorState title="Post couldn't be published">{error}</ErrorState> : null}
      </div></fieldset>
  </form>;
}
