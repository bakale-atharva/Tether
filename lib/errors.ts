import { ConvexError } from "convex/values";

// Convex functions throw ConvexError({ code, message }) for expected failures;
// anything else is a network or server problem the user can retry.
export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ConvexError && hasMessage(error.data)) return error.data.message;
  return fallback;
}

// Narrows untrusted payloads (ConvexError data, HTTP JSON) without casting.
export function hasMessage(data: unknown): data is { message: string } {
  return typeof data === "object" && data !== null && "message" in data && typeof data.message === "string";
}
