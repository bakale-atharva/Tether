"use client";
/* eslint-disable @next/next/no-img-element -- local previews require an object URL. */

import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";
import { useViewer } from "@/hooks/use-viewer";
import { useImageUpload } from "./use-image-upload";

type DraftImage = { file: File; preview: string; alt: string };

export function PostComposer() {
  const viewer = useViewer();
  const create = useMutation(api.posts.create);
  const discard = useMutation(api.uploads.discard);
  const upload = useImageUpload();
  const input = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState("");
  const [images, setImages] = useState<DraftImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  if (viewer.status !== "ready") return null;
  const remaining = 280 - Array.from(body).length;

  function addImages(files: FileList | null) {
    if (!files) return;
    const next = [...files].slice(0, 4 - images.length).map(file => ({ file, preview: URL.createObjectURL(file), alt: "" }));
    if (next.length < files.length) setError("You can attach up to four images.");
    setImages(current => [...current, ...next]);
  }
  function removeImage(index: number) {
    setImages(current => { URL.revokeObjectURL(current[index].preview); return current.filter((_, i) => i !== index); });
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(null);
    if (remaining < 0) return setError("Keep your post to 280 characters.");
    setSending(true);
    const uploaded: string[] = [];
    try {
      for (const image of images) uploaded.push(await upload(image.file, "post"));
      await create({ body, images: uploaded.map((uploadId, index) => ({ uploadId: uploadId as never, alt: images[index].alt })) });
      images.forEach(image => URL.revokeObjectURL(image.preview));
      setBody(""); setImages([]);
    } catch (cause) {
      await Promise.all(uploaded.map(uploadId => discard({ uploadId: uploadId as never }).catch(() => null)));
      setError(cause instanceof Error ? cause.message : "Your post couldn't be published.");
    } finally { setSending(false); }
  }
  return <form onSubmit={submit} className="border-b border-line px-4 py-4 md:px-6">
    <div className="flex gap-3"><Avatar name={viewer.profile.displayName} src={viewer.profile.avatarUrl} />
      <div className="min-w-0 flex-1">
        <label className="sr-only" htmlFor="post-body">Write a post</label>
        <textarea id="post-body" value={body} onChange={event => setBody(event.target.value)} placeholder="What are you tethering together?" rows={3} className="min-h-22 w-full resize-y bg-transparent text-lg leading-relaxed outline-none placeholder:text-muted" />
        {images.length ? <div className="grid grid-cols-2 gap-2 pb-3">{images.map((image, index) => <div key={image.preview} className="relative rounded-2xl border border-line p-2"><img src={image.preview} alt="" className="h-32 w-full rounded-xl object-cover" /><button type="button" className="absolute top-3 right-3 rounded-full bg-ink px-2 py-1 text-xs text-bg" onClick={() => removeImage(index)} aria-label={`Remove image ${index + 1}`}>Remove</button><label className="sr-only" htmlFor={`alt-${index}`}>Image description</label><input id={`alt-${index}`} value={image.alt} onChange={event => setImages(current => current.map((value, i) => i === index ? { ...value, alt: event.target.value } : value))} placeholder="Describe this image (optional)" className="mt-2 w-full bg-transparent text-sm outline-none placeholder:text-muted" /></div>)}</div> : null}
        <div className="flex items-center justify-between border-t border-line pt-3"><label className="cursor-pointer text-sm font-medium text-accent-text hover:underline">Add images<input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={event => { addImages(event.target.files); event.currentTarget.value = ""; }} /></label><div className="flex items-center gap-3"><span className={remaining < 0 ? "text-sm text-danger" : "text-sm text-muted"}>{remaining}</span><Button type="submit" loading={sending} disabled={sending || (body.trim().length === 0 && images.length === 0) || remaining < 0}>Post</Button></div></div>
        {error ? <ErrorState title="Post couldn't be published">{error}</ErrorState> : null}
      </div></div>
  </form>;
}
