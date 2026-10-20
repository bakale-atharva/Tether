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

- [ ] ATH-174 public profiles and owner editing.
- [ ] ATH-175 owned uploads, validation, and cleanup.
- [ ] ATH-176 posts and composer.
- [ ] ATH-177 public feed and pagination.
- [ ] ATH-178 permalinks and owner deletion.
- [ ] ATH-179 verification, review, and PR; stop before merge.

## Verification

Pending implementation. Record actual results and limitations here before PR creation.
