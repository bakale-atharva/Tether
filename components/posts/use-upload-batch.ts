"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useImageUpload } from "./use-image-upload";

// A failed commit releases every upload created for that submission.
export function useUploadBatch() {
  const upload = useImageUpload();
  const discard = useMutation(api.uploads.discard);
  return async <T,>(commit: (uploadImage: typeof upload) => Promise<T>): Promise<T> => {
    const fresh: Id<"uploads">[] = [];
    try {
      return await commit(async (file, purpose) => {
        const id = await upload(file, purpose);
        fresh.push(id);
        return id;
      });
    } catch (error) {
      await Promise.all(fresh.map(uploadId => discard({ uploadId }).catch(() => null)));
      throw error;
    }
  };
}
