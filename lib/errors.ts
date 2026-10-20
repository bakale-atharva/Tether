import { ConvexError } from "convex/values";

// Convex functions throw ConvexError({ code, message }) for expected failures;
// anything else is a network or server problem the user can retry.
export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ConvexError) {
    const data = error.data as { message?: unknown } | undefined;
    if (typeof data?.message === "string") return data.message;
  }
  return fallback;
}
