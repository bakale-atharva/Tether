# Phase 3 execution record

Source: `.claude/plans/PLAN.md`; scope: ATH-186 through ATH-191.
Branch: `claude/03-likes-bookmarks`. No worktree. Base: `4db55b1` (Phase 2 merged).

## Decisions

- `likes` and `bookmarks` tables hold one row per (user, post), indexed by
  `by_userId_and_postId`. Bookmarks also use `by_userId` for the saved list,
  newest first. `likes.by_postId` is there for later cleanup and context work.
- `likes:set` and `bookmarks:set` set a requested state (`liked` /
  `bookmarked`) instead of toggling. Repeated or retried requests are no-ops.
  The acting user always comes from the verified identity.
- `posts.likeCount` is optional, so older rows need no backfill. It changes in
  the same mutation as the like row. `nextLikeCount` in `convex/lib/content.ts`
  is shared by the mutation and the client's optimistic update.
- New likes and saves are rejected for deleted content. Unliking and removing a
  bookmark still work, so nobody is stuck with a like or a bookmark. Replies
  can be liked but not bookmarked.
- `interactions:viewerState` returns one message's like count plus the
  viewer's own `liked` and `bookmarked` flags (false for visitors). Cards
  subscribe to it per message so optimistic updates have one target. No
  function exposes who liked a post, or any bookmark count.
- Failed interactions roll back automatically (Convex optimistic updates) and
  show a dismissible toast in an always-mounted `role="alert"` region
  (`components/ui/toast.tsx`).
- Bookmarked posts that were later deleted appear on `/bookmarks` as a
  placeholder with a Remove button.

## Tasks

- [x] ATH-186 idempotent likes for posts and replies.
- [x] ATH-187 reactive counts and optimistic interaction states.
- [x] ATH-188 private bookmark storage and authorization.
- [x] ATH-189 bookmark controls and paginated saved posts.
- [x] ATH-190 deleted content and failed interaction recovery.
- [x] ATH-191 verification.

## Verification

- `node --test scripts/verify-p1.mjs scripts/verify-p2.mjs scripts/verify-p3.mjs`: 7 passing.
- `pnpm verify` (lint, typecheck, production build): passed.
- Convex dev backend, using CLI identities (`verify_alpha`, `verify_beta`):
  - Liking twice left one row and a count of 1. Unliking a post that wasn't
    liked was a no-op. Visitors were rejected, and an extra `userId` argument
    was rejected by the validator.
  - 12 concurrent like/unlike calls from two users ended with a stored count
    equal to the like rows.
  - Saving a reply was rejected (`NOT_BOOKMARKABLE`). Saving twice left one
    bookmark. Beta's list and `viewerState` showed none of alpha's bookmarks,
    and visitors couldn't list bookmarks.
  - After the post was deleted: new likes and saves were rejected, unliking
    worked, the bookmark showed as a deleted placeholder with a like count of
    0, and removing it emptied the list.
- Browser (visitor, desktop and 375px):
  - A like from another identity showed up on the feed card live, without a
    reload.
  - The like control can be focused, and pressing Enter opens Clerk sign-in.
  - The accessible label includes the count ("Sign in to like. 1 like").
  - `/bookmarks` shows a sign-in prompt, with no horizontal scroll.
- Not checked in the browser: signed-in optimistic toggling and the error
  toast. The pane has no Clerk session, and signing in needs real credentials.
