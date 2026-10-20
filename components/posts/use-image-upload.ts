"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export type UploadPurpose = "post" | "avatar" | "banner";

export function useImageUpload() {
  const { getToken } = useAuth();
  const getUploadUrl = useMutation(api.uploads.getUploadUrl);

  return async (file: File, purpose: UploadPurpose): Promise<string> => {
    const token = await getToken({ template: "convex" });
    if (!token) throw new Error("Your session is no longer active. Sign in and try again.");
    const endpoint = await getUploadUrl();
    const response = await fetch(`${endpoint}?purpose=${purpose}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": file.type },
      body: file,
    });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok || !data || typeof data !== "object" || !("uploadId" in data)) {
      const message = data && typeof data === "object" && "message" in data && typeof data.message === "string"
        ? data.message : "The image could not be uploaded. Please try again.";
      throw new Error(message);
    }
    return data.uploadId as string;
  };
}
