# Tether specification

Tether is a development MVP of a social platform with public conversations,
personalized discovery, private bookmarks, and subscription-gated AI
assistance. The authoritative delivery plan lives in
[`.claude/plans/PLAN.md`](../.claude/plans/PLAN.md) and is tracked in the Linear
project **Tether** (team **Dev**).

## Stack and ownership

| Concern | Owner |
| --- | --- |
| Authentication, sessions, billing, subscriptions | Clerk |
| Application data, public profiles, files, background jobs | Convex |
| UI, routing, server rendering | Next.js 16 (App Router, Cache Components) + React 19 + Tailwind 4 |
| Language models | OpenRouter via the AI SDK provider, orchestrated by Convex Agent |

## Identity and onboarding (Phase 0)

- Every Convex function derives the acting user from `ctx.auth.getUserIdentity()`
  and keys records on `tokenIdentifier`. No function accepts a user id for
  authorization.
- A `users` document is created when a signed-in person claims a handle during
  onboarding. Until then, signed-in features redirect to `/onboarding`.
- **Handle rules:** 3–20 characters, ASCII letters, digits, or underscore.
  Uniqueness is case-insensitive (stored as `handleLower`) and the original
  casing is kept for display. Reserved: `tether` (the agent) plus system words
  used by routes (`admin`, `api`, `bookmarks`, `home`, `onboarding`, `pricing`,
  `search`, `settings`, `sign-in`, `sign-up`, and similar).
- **Display name:** 1–50 characters after trimming.
- Public profile responses contain only `handle`, `displayName`, `bio`,
  `avatarUrl`, `bannerUrl`, and creation time. Email addresses and billing data
  never leave Clerk through Tether's public API.

## Social model (Phases 1–5)

- One typed `posts` table holds root posts and replies with `parentId`/`rootId`
  and explicit `authorKind: "user" | "agent"`.
- Human posts and replies: 280 characters. Root posts: up to four JPEG, PNG, or
  WebP images, 5 MB each, optional alt text. Replies are text-only.
- Deletion removes text and attachments but keeps a structural placeholder.
- Indexed relationship tables: `follows`, `likes`, `bookmarks` (private).
- Public and Following feeds show top-level posts newest first; Following merges
  indexed per-author streams.
- Search covers undeleted top-level post text by relevance at `/search?q=…` and
  runs only on submission.
- Visitors can read feeds, profiles, conversations, and search. Writing,
  interactions, follows, bookmarks, and private resources require sign-in.

## Billing and agent (Phases 6–8)

- Free and Pro ($10 USD/month, no annual billing, no trial) individual plans in
  Clerk development billing. Pro carries the `tether_agent` feature.
- Entitlement is checked against authoritative Clerk subscription data before
  every model execution; webhook-synced state is a cache only.
- 50 agent requests per UTC day shared across private chat and mentions, one
  active generation per user, and a five-second cooldown.
- Public `@tether` mentions in human replies create at most one request each and
  publish one labeled agent reply beneath the mention.

## Experience

- Visual identity: warm ivory surfaces, deep ink text, coral accents, restrained
  borders, accessible light and dark themes.
- Responsive shell: left sidebar on desktop, bottom tab bar on mobile, skip
  link, visible focus rings, WCAG AA contrast.
- Every collection has loading, empty, and error states.

## Out of scope

Live payments, production deployment, reposts, DMs, notifications, content
editing, image understanding, and agent web browsing.
