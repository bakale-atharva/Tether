import { ConvexError } from "convex/values";

export const DEFAULT_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";
export const GENERATION_TIMEOUT_MS = 120_000;
export const REQUEST_LEASE_MS = 180_000;
export const FREE_PROVIDER = {
  allow_fallbacks: false,
  max_price: { prompt: 0, completion: 0, request: 0 },
} as const;
export function freeModel(configured: string | undefined) {
  const model = configured ?? DEFAULT_MODEL;
  if (!/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+:free$/.test(model)) {
    throw new ConvexError({ code: "PROVIDER_UNCONFIGURED" });
  }
  return model;
}
export function promptProblem(text: string) {
  return !text.trim() ? "Write a message first." : text.trim().length > 8000 ? "Keep messages to 8,000 characters." : null;
}
export function titleProblem(text: string) {
  return !text.trim() || text.trim().length > 80 ? "Use a title between 1 and 80 characters." : null;
}
export function isActive(status: string) {
  return status === "queued" || status === "running" || status === "stopping";
}
export function canRetry(status: string, latest: boolean) {
  return latest && (status === "failed" || status === "canceled");
}
export function requestFailure(error: unknown) {
  if (error instanceof ConvexError && typeof error.data === "object" && error.data !== null && "code" in error.data) {
    const code = error.data.code;
    if (code === "PRO_REQUIRED") return { code, message: "Upgrade to Pro to continue. Your history is still here." };
    if (code === "BILLING_UNAVAILABLE") return { code, message: "We couldn't verify your plan. Please retry." };
    if (code === "PROVIDER_UNCONFIGURED") return { code, message: "Tether AI is being set up. Please try again later." };
  }
  return { code: "PROVIDER_ERROR", message: "Tether couldn't finish this response. Please retry in a moment." };
}
