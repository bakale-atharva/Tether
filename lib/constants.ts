// Client-side constants. Limits the server enforces live in
// convex/lib/content.ts and convex/lib/handles.ts so both sides share them.

// Feeds and profile post lists.
export const FEED_PAGE_SIZE = 12;

// Conversations.
// Levels rendered beneath the focused message before handing off to the
// deeper message's own permalink, which keeps indentation readable on phones.
export const THREAD_MAX_DEPTH = 4;
// Levels that load their replies automatically; deeper ones wait for a tap.
export const THREAD_AUTO_EXPAND_DEPTH = 2;
// Replies fetched per page directly under the focused message, and per nested level.
export const THREAD_FIRST_PAGE_SIZE = 10;
export const THREAD_NESTED_PAGE_SIZE = 3;

// How long an error toast stays before dismissing itself.
export const TOAST_DURATION_MS = 6000;

// Theme preference in localStorage.
export const THEME_STORAGE_KEY = "tether-theme";
