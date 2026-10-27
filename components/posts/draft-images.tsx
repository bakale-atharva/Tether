/* eslint-disable @next/next/no-img-element -- local previews require object URLs. */
import { ALT_MAX } from "@/convex/lib/content";
import type { DraftImage } from "./use-draft-images";

export function DraftImages({ images, onRemove, onDescribe }: {
  images: DraftImage[];
  onRemove: (index: number) => void;
  onDescribe: (index: number, alt: string) => void;
}) {
  return <div className="grid min-w-0 gap-4 pb-5">
    {images.map((image, index) => <div key={image.preview} className="grid min-w-0 grid-cols-[5rem_minmax(0,1fr)] items-center gap-3">
      <img src={image.preview} alt="" className="size-20 rounded-xl object-cover" />
      <div className="min-w-0">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <label className="text-xs font-medium text-muted" htmlFor={`alt-${index}`}>Image description</label>
          <button type="button" className="min-h-11 shrink-0 rounded-full px-2 text-xs font-medium text-danger transition-colors hover:bg-danger-soft" onClick={() => onRemove(index)} aria-label={`Remove image ${index + 1}`}>Remove</button>
        </div>
        <input id={`alt-${index}`} value={image.alt} maxLength={ALT_MAX} onChange={event => onDescribe(index, event.target.value)} placeholder="Describe this image (optional)" className="block min-h-11 w-full min-w-0 rounded-xl bg-surface-2 px-3 text-sm text-ink outline-none placeholder:text-muted focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring" />
      </div>
    </div>)}
  </div>;
}
