/* eslint-disable @next/next/no-img-element -- local previews require object URLs. */
import { ALT_MAX } from "@/convex/lib/content";
import type { DraftImage } from "./use-draft-images";

export function DraftImages({ images, onRemove, onDescribe }: {
  images: DraftImage[];
  onRemove: (index: number) => void;
  onDescribe: (index: number, alt: string) => void;
}) {
  return <div className="grid grid-cols-2 gap-2 pb-3">
    {images.map((image, index) => <div key={image.preview} className="relative rounded-2xl border border-line p-2">
      <img src={image.preview} alt="" className="h-32 w-full rounded-xl object-cover" />
      <button type="button" className="absolute top-3 right-3 rounded-full bg-ink px-2 py-1 text-xs text-bg" onClick={() => onRemove(index)} aria-label={`Remove image ${index + 1}`}>Remove</button>
      <label className="sr-only" htmlFor={`alt-${index}`}>Image description</label>
      <input id={`alt-${index}`} value={image.alt} maxLength={ALT_MAX} onChange={event => onDescribe(index, event.target.value)} placeholder="Describe this image (optional)" className="mt-2 w-full bg-transparent text-sm outline-none placeholder:text-muted" />
    </div>)}
  </div>;
}
