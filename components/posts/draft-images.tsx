/* eslint-disable @next/next/no-img-element -- local previews require object URLs. */
import { ALT_MAX } from "@/convex/lib/content";
import type { DraftImage } from "./use-draft-images";

export function DraftImages({ images, onRemove, onDescribe }: {
  images: DraftImage[];
  onRemove: (index: number) => void;
  onDescribe: (index: number, alt: string) => void;
}) {
  return <div className="grid min-w-0 grid-cols-1 gap-4 pb-5 sm:grid-cols-2">
    {images.map((image, index) => <div key={image.preview} className="min-w-0 overflow-hidden rounded-[20px] bg-surface-2/60">
      <img src={image.preview} alt="" className="h-40 w-full object-cover" />
      <div className="flex items-center justify-between gap-2 px-3 pt-2">
        <label className="text-xs font-medium text-muted" htmlFor={`alt-${index}`}>Image description</label>
        <button type="button" className="min-h-11 shrink-0 rounded-lg px-2 text-xs font-medium text-danger transition-colors hover:bg-danger-soft" onClick={() => onRemove(index)} aria-label={`Remove image ${index + 1}`}>Remove</button>
      </div>
      <input id={`alt-${index}`} value={image.alt} maxLength={ALT_MAX} onChange={event => onDescribe(index, event.target.value)} placeholder="Describe this image (optional)" className="mx-3 mb-3 block min-h-11 w-[calc(100%-1.5rem)] min-w-0 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-ring focus:ring-2 focus:ring-ring/20" />
    </div>)}
  </div>;
}
