"use client";

import { useConvexAuth, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";

export type Viewer =
  | { status: "loading" }
  | FunctionReturnType<typeof api.users.viewer>;

// Gates on Convex auth (not just Clerk) so authenticated queries only run once
// Convex has validated the token.
export function useViewer(): Viewer {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const viewer = useQuery(api.users.viewer, isAuthenticated ? {} : "skip");

  if (isLoading) return { status: "loading" };
  if (!isAuthenticated) return { status: "signedOut" };
  return viewer ?? { status: "loading" };
}
