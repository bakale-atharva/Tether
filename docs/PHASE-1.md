# Phase 1 execution record

Source: `.agents/plans/PLAN.md`; scope: ATH-174 through ATH-179 only.
Branch: `codex/01-posts-profiles`. No worktree. Base: `a6bae1c`.

## Decisions

- Follow the checked-in plan's `codex/` prefix and prohibition on Vitest/E2E tooling.
- Preserve the existing design system. Profile edits use an inline form; deletion uses a native confirmation dialog with focus restoration.
- Profile display name and bio are editable; handles remain stable in P1. Avatar/banner replacement uses the same owned upload pipeline as posts.
- Use authenticated Convex HTTP uploads so the server binds each file to the verified uploader, rather than trusting a browser-supplied storage ID. Check bytes and metadata; expire unclaimed uploads after 24 hours with a bounded cron.
- One posts table with nullable parent/root IDs, explicit authorship, and indexed deletion state prepares future conversations without implementing them.
- Use dependency-free Node checks and direct dev-backend verification alongside lint/typecheck/build and manual browser inspection. No Vitest or E2E framework.

## Tasks

- [x] ATH-174 public profiles and owner editing.
- [x] ATH-175 owned uploads, validation, and cleanup.
- [x] ATH-176 posts and composer.
- [x] ATH-177 public feed and pagination.
- [x] ATH-178 permalinks and owner deletion.
- [x] ATH-179 verification, review, and PR; stop before merge.

## Verification

- `node --test scripts/verify-p1.mjs`: 3 passing dependency-free checks for post, profile, and encoded-image validation.
- `pnpm lint`, `pnpm typecheck`, and `git diff --check`: passed.
- `pnpm exec next build --webpack`: passed. The default Turbopack build is blocked in this runner because its CSS worker cannot bind a port, including when elevated.
- The running local server returned HTTP 200. The running Convex dev deployment accepted `posts:list` and rejected unauthenticated post creation and upload URL requests.
- Independent review findings were fixed: profile mutations omit absent upload IDs, the signed-out home includes the public feed, text inputs preserve the backend's Unicode code-point limits, and image validation now checks complete JPEG/PNG/WebP containers before storage.
