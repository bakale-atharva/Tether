# Phase 2 execution record

Source: `.claude/plans/PLAN.md`; scope: ATH-180 through ATH-185.
Branch: `claude/02-conversations`. No worktree. Base: `974b6ef` (Phase 1 merged).

## Decisions

- Replies are rows in the existing `posts` table. The client sends only
  `parentId` and `body`; `rootId`, author, and `authorKind` are derived on the
  server. Replies have no `images` argument, so attachments cannot be forged.
- A reply needs an existing, undeleted parent. Replies elsewhere in a thread
  stay possible after the root is deleted.
- Two optional counters on `posts` (optional so Phase 1 rows need no backfill):
  - `replyCount`: undeleted direct replies, shown on cards; decremented when a
    reply is deleted.
  - `childCount`: direct replies ever created. A deleted message stays as a
    placeholder while this is above zero, and a deleted leaf disappears.
  Both update in the same mutation as the insert or delete, so Convex's
  serializable transactions keep them exact under concurrency.
- Indexes: `by_parentId` (children, oldest first) and `by_rootId` (whole-thread
  lookups for Phase 8 context assembly).
- Each conversation level paginates on the server: 10 replies at the top, 3
  per nested level. Two levels expand automatically; deeper ones wait for
  "Show replies"; after four levels, "Continue this thread" opens that
  message's permalink.
- Reply permalinks reuse `/[handle]/post/[id]` and show the ancestor chain
  (capped at 50 hops, with a jump to the conversation start beyond that).
- The composer and cards reuse Phase 1's `PostCard`, `Avatar`, `Button`, and
  error states. Inline composers focus on open, support Cmd/Ctrl+Enter to post
  and Escape to cancel, and return focus to their Reply button on close.

## Tasks

- [x] ATH-180 reply relationships and backend validation.
- [x] ATH-181 reply composers at every level.
- [x] ATH-182 paginated nested conversations.
- [x] ATH-183 reply counts, permalinks, and ancestor navigation.
- [x] ATH-184 reply deletion and placeholders.
- [x] ATH-185 verification.

## Verification

- `node --test scripts/verify-p1.mjs scripts/verify-p2.mjs`: 5 passing.
- `pnpm verify` (lint, typecheck, production build): passed.
- Convex dev backend, via CLI identities (`verify_alpha`, `verify_beta`):
  - Rejected: extra `rootId` and `images` arguments (validator), empty and
    281-character replies, signed-out and not-onboarded callers, replies to a
    deleted parent, deleting another user's reply. 280 emoji are accepted.
  - `rootId` was derived correctly three levels deep, and `ancestors` returned
    the root-first chain.
  - 8 concurrent replies from two users moved the root's `replyCount` from 1
    to 9, matching the listed replies.
  - Deleting a reply that has replies left a placeholder with its subtree
    reachable. Deleting a leaf hid it. Each deletion decremented the parent
    count. No replies appear in the public feed.
- Browser (visitor): nested thread, placeholder, expansion, and visible counts
  at desktop width; ancestor chain at 375px with no horizontal scroll; sign-in
  prompt instead of a composer.
