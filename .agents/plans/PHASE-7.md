# Phase 7 — Private agent implementation

Spec: [PLAN.md](PLAN.md), Phase 7 and agreed Agent behavior. Execute inline using
Superpowers executing-plans; use the current checkout, no worktree.

## Architecture and decisions

Convex Agent owns messages and durable stream deltas. App-owned conversation
rows authorize every history/stream read. An app request ledger and per-user
active lock coordinate all agent surfaces; the rate-limiter component enforces
50 requests per UTC day and a five-second cooldown. Retries retain the original
request and prompt, consume no additional daily unit, and get a new attempt fence.
Scheduled actions recheck live Clerk entitlement before invoking OpenRouter.
Only the configured model is used; no paid fallback or data-modification tools.

The existing `/tether` surface gains a compact conversation list, rename control,
URL-selected conversation, paginated messages, streamed response, and composer.
Use existing Tether tokens and controls; retain history after downgrade.

Ruling: the supplied plan already fixes the integration and intended behavior;
implement it without a second design approval. No Vitest or E2E tooling, per spec.
Use node:test and direct development-backend checks. Keep Phase 8 publication out
of scope; make the quota service reusable by trusted mention jobs.

## Tasks

- [x] ATH-210: Install compatible Agent/OpenRouter/rate-limiter packages; mount
  components, define typed server env, configure tool-free agent and free default.
- [x] ATH-211: Add conversation ownership schema and paginated list/create/rename,
  authorized message/stream query; test forged and cross-user access.
- [x] ATH-213: Add shared request ledger, UTC quota, cooldown, active generation
  lock, idempotent submissions, fenced retries and timeout recovery; test boundaries.
- [x] ATH-212/214: Schedule streamed responses with authoritative entitlement,
  stop/retry/provider failures; build responsive accessible persistent chat UI.
- [ ] ATH-215: Run node:test suites, lint, both TypeScript projects, build,
  development function checks, real-provider and desktop/mobile verification.
- [ ] Whole-branch review, fix findings, document evidence and limitations, commit,
  push and open PR; move implemented issues to In Review and stop before merge.

## Review focus

Cancellation must not release a lock while the provider is still running.
Stale scheduled attempts must never execute or overwrite a later attempt.
An unavailable provider or billing lookup must leave a recoverable request.
Wrong-user conversation URLs must reveal neither messages nor stream deltas.
Reload must restore the URL-selected conversation and its active request.

## Ledger

- Read bundled Next.js use-client/useSearchParams docs, Convex generated rules,
  current Context7 Agent/OpenRouter docs, and installed dependency compatibility.
- Existing main is clean and Phase 6 is merged. Target is personal development
  deployment `formal-buzzard-436`; no production operations authorized or needed.
- Linear ATH-210–215 started; corrected their branch references to `codex/`.

- Implemented ATH-210–214. Full verification evidence and known browser gap are
  recorded in docs/PHASE-7.md. Independent review found no high-impact defects.
- Isolate provider-error cleanup failed; Node action runtime fixes recovery.
- Explicit working dev model is free Liquid; retain agreed NVIDIA code default.
  All model IDs must end in :free, with no fallback and zero price ceilings.
- Browser visual/reload checks remain pending: in-app browser failed, native
  computer-use permission denied. Keep ATH-215/milestone open for those checks.
- Owner explicitly requested direct merge after checks, overriding the PR stop
  gate. Owner authorized coordination with Code Review and UI/UX Redesign chats.
- Preserve redesign-only .gitignore/PRODUCT.md work outside phase commits.
- Coordinate Code Review changes as a separate commit; SDK class-instance
  regression reproduced RED and fixed GREEN with class-safe object narrowing.
- Shared Clerk Billing SDK commit was preserved. Final checks run against it.
