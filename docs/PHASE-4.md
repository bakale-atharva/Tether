# Phase 4 execution record

Source: `.claude/plans/PLAN.md`; scope: ATH-192 through ATH-197.
Branch: `claude/04-following`. No worktree. Base: `de61c01` (Phase 3 merged).

## Decisions

- `follows` holds one public row per (follower, followee):
  `by_followerId_and_followeeId` for lookups, plus `by_followerId` and
  `by_followeeId` so both lists page newest first.
- `follows:set({ userId, following })` sets a state instead of toggling, like
  `likes:set`. The follower always comes from the verified identity. Following
  yourself or the `tether` agent (`AGENT_HANDLE`) is rejected. Unfollowing
  always works.
- Follower and following counts come from two aggregate components
  (`followerCounts`, `followingCounts` in `convex/lib/aggregates.ts`), updated
  in the same mutation as each row. Same reasoning as like counts: following
  someone never rewrites the profile document that every post card reads.
  `follows:state` returns an account's counts plus whether the viewer follows
  it. The follow button and counts subscribe to it, so optimistic updates have
  one target. `nextLikeCount` became `nextToggledCount`, shared by both.
- `posts:following` merges one indexed stream per followed account
  (`by_authorId_and_parentId_and_deleted`, newest first) with `mergedStream`
  from `convex-helpers`, instead of scanning the public feed. The client uses
  the `convex-helpers/react` `usePaginatedQuery`, which pins `endCursor` so
  reactive pages stay gapless.
- Each page reads from every followed account's stream, so following is capped
  at `FOLLOWING_MAX` (500) accounts.
- The home page has "For everyone" / "Following" tabs (ARIA tabs pattern, arrow
  keys, Home and End). The selection lives in `?feed=following`. Feeds stay
  mounted once opened, and each tab restores its own scroll position.
- The Following empty state says whether you follow nobody or your follows
  haven't posted, and offers a switch to the public feed. Visitors get a
  sign-in prompt.
- Shared pieces: `PostFeedList` (paginated cards, used by both home feeds and
  profiles), `ProfileRow`, `FollowButton`, `FollowCounts`, `MissingProfile`.

## Tasks

- [x] ATH-192 follow/unfollow relationships.
- [x] ATH-193 profile follow controls.
- [x] ATH-194 follower/following counts and paginated lists.
- [x] ATH-195 chronological Following feed.
- [x] ATH-196 feed switching and empty states.
- [x] ATH-197 verification.

## Verification

- `node --test scripts/verify-p*.mjs` and `pnpm verify` (lint, typecheck,
  production build): passed.
- Convex dev backend, as seeded CLI identities `zz_test_a/b/c`, each with four
  interleaved posts (kept in dev for manual testing; A follows B and C):
  - Visitors and accounts that haven't finished onboarding are rejected by
    `follows:set` and `posts:following`. Following yourself is rejected
    (`CANNOT_FOLLOW_SELF`).
  - Two concurrent duplicate follows from A to B left one row, with B's
    follower count at 1 and A's following count at 2.
  - A's feed in pages of 3: `c4,b4,c3 / b3,c2,b2 / c1,b1`. Newest first across
    both authors, with no duplicates or gaps and none of A's own posts.
  - Unfollowing C (twice, the second a no-op) zeroed C's counts and removed
    C's posts from the feed. B deleting `b4` dropped it from the feed.
    Following C again brought C's posts back in order.
  - `follows:followers` for B listed `zz_test_a`. `follows:set` takes no
    follower argument, so nobody can act on another account's follows.
- Browser (visitor, desktop and 375px):
  - Tabs switch with the arrow keys and update `?feed=following`, and the
    selection survives a reload.
  - Profile counts link to the lists. `/[handle]/followers` shows its empty
    state, and there were no console errors.
- Not checked in the browser: signed-in follow button toggling, the hover
  "Unfollow" state, and scroll restoration with real content. The pane has no
  Clerk session. The agent-follow rejection wasn't exercised, because no
  `tether` account exists yet (Phase 8).
