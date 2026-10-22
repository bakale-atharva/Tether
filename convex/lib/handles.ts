// Shared handle and display-name rules. Imported by Convex functions and by
// the onboarding form so client hints match server enforcement.

export const HANDLE_MIN = 3;
export const HANDLE_MAX = 20;
export const DISPLAY_NAME_MAX = 50;

const HANDLE_PATTERN = /^[A-Za-z0-9_]+$/;

// The agent's account. Nobody can claim it, and nobody can follow it.
export const AGENT_HANDLE = "tether";

// The rest collide with app routes or would impersonate the platform.
export const RESERVED_HANDLES: ReadonlySet<string> = new Set([
  AGENT_HANDLE,
  "tetherai",
  "tether_ai",
  "admin",
  "administrator",
  "api",
  "app",
  "billing",
  "bookmarks",
  "explore",
  "help",
  "home",
  "login",
  "logout",
  "me",
  "mod",
  "moderator",
  "notifications",
  "onboarding",
  "pricing",
  "privacy",
  "root",
  "search",
  "settings",
  "signin",
  "signup",
  "sign_in",
  "sign_up",
  "support",
  "system",
  "terms",
]);

export type HandleProblem = "too_short" | "too_long" | "invalid_chars" | "reserved";

export function normalizeHandle(handle: string): string {
  return handle.trim().replace(/^@/, "");
}

export function handleProblem(rawHandle: string): HandleProblem | null {
  const handle = normalizeHandle(rawHandle);
  if (handle.length < HANDLE_MIN) return "too_short";
  if (handle.length > HANDLE_MAX) return "too_long";
  if (!HANDLE_PATTERN.test(handle)) return "invalid_chars";
  if (RESERVED_HANDLES.has(handle.toLowerCase())) return "reserved";
  return null;
}

export const HANDLE_PROBLEM_MESSAGES: Record<HandleProblem | "taken", string> = {
  too_short: `Handles need at least ${HANDLE_MIN} characters.`,
  too_long: `Handles can be at most ${HANDLE_MAX} characters.`,
  invalid_chars: "Use only letters, numbers, and underscores.",
  reserved: "That handle is reserved.",
  taken: "That handle is already taken.",
};

export function displayNameProblem(rawName: string): string | null {
  const name = rawName.trim();
  if (name.length === 0) return "Add a display name.";
  if (name.length > DISPLAY_NAME_MAX) {
    return `Display names can be at most ${DISPLAY_NAME_MAX} characters.`;
  }
  return null;
}

// Turns an arbitrary name into a handle suggestion that passes validation
// (availability is checked separately).
export function suggestHandle(source: string | undefined): string {
  const base = (source ?? "")
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, HANDLE_MAX);
  if (base.length >= HANDLE_MIN && !RESERVED_HANDLES.has(base.toLowerCase())) {
    return base.toLowerCase();
  }
  return "";
}
