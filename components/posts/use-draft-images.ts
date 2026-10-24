"use client";

import { useEffect, useRef, useState } from "react";
import { IMAGE_MAX, imageProblem } from "@/convex/lib/content";

export type DraftImage = { file: File; preview: string; alt: string };

export function useDraftImages() {
  const [images, setImages] = useState<DraftImage[]>([]);
  const previews = useRef(new Set<string>());
  useEffect(() => {
    const allocated = previews.current;
    return () => { allocated.forEach(url => URL.revokeObjectURL(url)); allocated.clear(); };
  }, []);

  function add(files: FileList | null): string | null {
    if (!files) return null;
    const chosen = Array.from(files).slice(0, IMAGE_MAX - images.length);
    for (const file of chosen) {
      const problem = imageProblem(file.type, file.size);
      if (problem) return problem;
    }
    const next = chosen.map(file => {
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      return { file, preview, alt: "" };
    });
    setImages(current => [...current, ...next]);
    return chosen.length < files.length ? "You can attach up to four images." : null;
  }
  function remove(index: number) {
    const image = images[index];
    if (!image) return;
    URL.revokeObjectURL(image.preview);
    previews.current.delete(image.preview);
    setImages(current => current.filter(value => value.preview !== image.preview));
  }
  function clear() {
    previews.current.forEach(url => URL.revokeObjectURL(url));
    previews.current.clear();
    setImages([]);
  }
  function describe(index: number, alt: string) {
    setImages(current => current.map((image, i) => i === index ? { ...image, alt } : image));
  }
  return { images, add, remove, clear, describe };
}
