"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { hasMessage } from "@/lib/errors";

export type UploadPurpose = "post" | "avatar" | "banner";

// The upload endpoint answers with the id it registered; narrow the JSON
// instead of casting it.
function hasUploadId(data: unknown): data is { uploadId: Id<"uploads"> } {
  return typeof data === "object" && data !== null && "uploadId" in data && typeof data.uploadId === "string";
}

export function useImageUpload() {
  const { getToken } = useAuth();
  const getUploadUrl = useMutation(api.uploads.getUploadUrl);

  return async (file: File, purpose: UploadPurpose): Promise<Id<"uploads">> => {
    const token = await getToken({ template: "convex" });
    if (!token) throw new Error("Your session is no longer active. Sign in and try again.");
    const endpoint = await getUploadUrl();
    const response = await fetch(`${endpoint}?purpose=${purpose}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": file.type },
      body: file,
    });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok || !hasUploadId(data)) {
      throw new Error(hasMessage(data) ? data.message : "The image could not be uploaded. Please try again.");
    }
    return data.uploadId;
  };
}
