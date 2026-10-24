# Window seat Frontend Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved Window seat design to all existing Tether screens without changing functionality.

**Architecture:** Restyle existing React components and shared theme primitives. Preserve hooks, handlers, providers, data contracts, routing, and server/client boundaries; add no component library or backend capability. Per the owner's explicit instruction, work in the existing checkout on `codex/window-seat-redesign`, with parallel subagents assigned exclusive file ownership and no worktrees.

**Tech Stack:** Next.js 16.4.2 App Router, React 19.3, Tailwind 4, existing Clerk and Convex integrations, TypeScript.

**Spec:** `docs/superpowers/specs/2026-10-24-frontend-redesign-design.md` (owner approved).

## Global Constraints

- Preserve all existing routes, URLs, permissions, fields, validation, pagination, uploads/alt text, feed order/default, subscription behavior, and AI lifecycle.
- Layout A: quiet sidebar and one reading column; no third informational rail.
- Window seat: light canvas #f0f3f7, surfaces #ffffff, ink #252b3a, muted #566074, violet #5145a0, lavender #e3dff3, borders #c7ceda.
- Dark starting values: canvas #171b26, surface #202635, ink #edf0f8, muted #b3bdd0, border #3d465d, action #b8acf5 with deep-violet foreground. Verify contrast before shipping.
- System sans typography; body 16px/1.6, metadata 12–14px, controls 14px, headings 26–32px. Controls 10–12px corners and mobile targets at least 44px where practical.
- Desktop >=1024px: 220–240px sidebar, reading column about 680px, workspace about 1000px. Tablet >=768px: compact rail. Mobile <768px: header and bottom navigation.
- No new dependencies, backend changes, fabricated production content, paid verification activity, service-configuration changes, production deployment, or merge.
- Read relevant installed Next.js documentation before editing routes/layouts. Preserve current Suspense and Cache Components behavior.
- Preserve other chats' commits and modifications. Stage explicit redesign-owned paths/hunks only.
- Code-first workflow confirmed in `.impeccable/config.json`; browser mockups are exploratory references, not product code.

## Review Focus

1. Long names, unbroken text, four image attachments, and 320px width: content remains readable with reachable actions and no horizontal document overflow. Task 3 owns visual checks.
2. Mobile keyboard, safe-area inset, and fixed bottom navigation: composers and errors remain reachable. Tasks 2 and 4 own checks.
3. Signed-out, onboarding, plan-loading, Free, and Pro states: existing actions and gating remain correct after moving shell content. Tasks 2, 4, and 5 own checks.
4. Dark/system theme, reload, and reduced motion: matching surfaces and persisted preference, no content hidden by motion. Tasks 1 and 6 own checks.
5. AI streaming, stopped/failed requests, rename, and downgraded history: existing keyboard, focus, scroll-follow, and access behavior survives presentation changes. Task 4 owns checks.

---

### Task 1: Establish baseline and shared visual foundations

**Files:** Modify `app/globals.css`, `app/layout.tsx`, `components/ui/button.tsx`, `components/ui/field.tsx`, `components/ui/avatar.tsx`, `components/ui/page-header.tsx`, `components/ui/spinner.tsx`, `components/ui/states.tsx`, `components/ui/toast.tsx`. Preserve `lib/theme.ts` and the theme persistence contract.

**Interfaces:** Consume existing semantic CSS variables and primitive prop types. Produce the same exports/props with Window seat tokens; no caller API changes.

- [x] Confirm Phase 7 stability window is over; baseline is merged `8143b15`. Owner explicitly prohibits worktrees and requests parallel agents: use existing checkout on `codex/window-seat-redesign` with exclusive file ownership. Keep unrelated modifications untouched.
- [ ] Read the approved spec and applicable installed Next.js guides for styling, layouts, fonts, and client boundaries; read Impeccable craft-floor immediately before UI edits. Record the direction contract in the surface brief with seed `3332da6a` and pinned layout A.
- [ ] Run baseline `pnpm lint`, `pnpm typecheck`, `node --test scripts/verify-p*.mjs scripts/verify-agent-context.mjs`, and `pnpm build`; record actual outcomes. If sandbox restrictions block the default builder, follow escalation requirements before using the already established `pnpm exec next build --webpack` fallback.
- [ ] Capture incumbent representative screens if browser access permits; record blockers accurately. Do not misreport unavailable signed-in screens as covered.
- [ ] Replace light/dark tokens together, retaining existing semantic names and Clerk mappings. Use one source for dark values if maintainable without changing theme selection semantics. Verify intended text/action contrast combinations, including disabled and danger states.
- [ ] Replace Google font declarations with a system sans stack and adjust metadata theme colors. Keep all providers, initialization scripts, hydration handling, and skip link intact.
- [ ] Update primitives' spacing, radii, typography, and focus states without changing prop types, loading/disabled logic, labels, or ARIA. Use 44px mobile target sizing where needed.
- [ ] Check theme toggle, system preference, reload persistence, keyboard focus, loading and error primitives in both themes. Run lint/typecheck; inspect diff for logic changes. Commit explicit Task 1 paths and approved design artifacts.

### Task 2: Recompose global navigation and account surfaces

**Files:** Modify `components/shell/app-shell.tsx`, `components/shell/nav.tsx`, `components/shell/account.tsx`, `components/shell/theme-toggle.tsx`, `components/brand/logo.tsx` only where presentation requires it.

**Interfaces:** Preserve `AppShell({children})`, nav exports/fallbacks, account component auth checks, existing `useViewer()` states, navigation URLs and conditional Profile visibility. Consume Task 1 semantic tokens.

- [ ] Build desktop two-column workspace with 220–240px sidebar and about 680px reading column; use compact rail at tablet widths and existing mobile header/bottom navigation below 768px. Keep main landmark, Suspense fallbacks and Toast/Billing providers.
- [ ] Remove third informational rail. Relocate its unique plan/join/about information into a compact reachable shell footer/account area. Preserve sign-in, sign-up, theme and account actions at every breakpoint; avoid duplicating viewer summaries unnecessarily.
- [ ] Apply lavender selected-navigation inset, icon/text alignment, and 120–160ms color transitions without changing active-route logic or destinations.
- [ ] Check signed-out, loading, onboarding, and ready states at desktop, tablet and mobile. Tab through navigation; verify route labels and account actions. Check bottom safe-area space and 320px overflow.
- [ ] Run lint/typecheck and inspect only presentational diff. Commit explicit Task 2 paths.

### Task 3: Redesign public social surfaces

**Files:** Modify `app/(app)/page.tsx`, `app/(app)/home-welcome.tsx`, presentation in `components/posts/{post-composer,reply-composer,draft-images,feed-tabs,post-card,post-actions,post-feed-list,conversation}.tsx`, `app/(app)/[handle]/{profile-view,people-list}.tsx`, `app/(app)/[handle]/post/[id]/post-detail.tsx`, and `components/profiles/{profile-row,profile-identity,profile-editor,profile-posts,follow-button,follow-counts,missing-profile}.tsx`. Only touch additional route wrappers if presentation requires it.

**Interfaces:** Keep existing props and exports, especially PostCard reply callbacks, action IDs, feedTabId/feedPanelId, and all data-bearing hooks. Retain profile editing/upload helper boundaries introduced by the coordinated review.

- [ ] Add the approved welcoming home heading without changing feed selection, URL handling, retained mounted feeds, or scroll restoration. Keep Public/Following order and current labels.
- [ ] Restyle composers, attachment previews, upload and alt-text tools, counters, errors and submit controls. Preserve every field, upload lifecycle and handler; do not move drafting state into a new component owner.
- [ ] Recompose post identity/body/action rhythm with avatar gutter, 16px text, quiet separators, existing image layouts and clear focus. Preserve owner-only Delete, confirmation, placeholders, like/bookmark state, and reply/link behavior.
- [ ] Restyle thread hierarchy and profile/banner/identity/edit/follow layouts. Keep existing profile editor dialog semantics and lifecycle, people list pagination, author attribution, and missing profiles.
- [ ] Browser-check long/unbroken content, long names, four images and alt text at 320px and 390px; verify no clipped controls. Test reply focus, feed keyboard tabs/URL/scroll, follow and owner actions with available accounts. Do not create fake production sample content.
- [ ] Run relevant existing phase verification scripts, lint and typecheck. If a real behavioral regression is introduced, reproduce with a meaningful failing test before repair; do not add CSS-mirroring tests. Commit explicit Task 3 paths.

### Task 4: Redesign private AI workspace

**Files:** Modify presentation in `app/(app)/tether/page.tsx`, `components/agent/{private-chat,chat-workspace,chat-conversation,chat-header,chat-messages}.tsx` and `app/(app)/tether/error.tsx`.

**Interfaces:** Keep URL thread ID, workspace and message props, send/retry/stop actions, request idempotency, conversation rename handlers, followSignal and current live-region semantics unchanged.

- [ ] Style conversation navigation within the reading workspace and keep the current mobile selector behavior. Give messages, header, composer, plan and request states a consistent hierarchy using Task 1 tokens.
- [ ] Preserve all history/stream queries, author labels, request controls, Enter/Shift+Enter/IME handling, focus restoration, scroll-follow behavior, quota and warning text. Keep stop/retry and unavailable-generation messaging visible.
- [ ] Browser-check signed-out/Free/plan-loading states and, with authorized existing access, thread creation, selection, rename, history, send, streaming, stop and retry. Test mobile keyboard and bottom-nav reachability; verify downgraded history remains readable. Record any unavailable account/provider scenario instead of asserting it passed.
- [ ] Run existing Phase 7 and agent-context verification scripts plus lint/typecheck. Review diff for changed behavior or hooks; commit explicit Task 4 paths.

### Task 5: Complete search, saved, authentication and billing surfaces

**Files:** Modify presentation in `app/(app)/search/{page,search-content,search-results,error}.tsx`, `app/(app)/bookmarks/{page,saved-posts}.tsx`, `app/(app)/pricing/page.tsx`, `app/(app)/billing/page.tsx`, `components/billing/{pricing,subscription,plan-badge}.tsx`, `components/brand/auth-layout.tsx`, `app/onboarding/{page,onboarding-form}.tsx`, sign-in/up wrappers and `app/not-found.tsx` as needed.

**Interfaces:** Preserve route exports, search query/submit contract, all Clerk component props/redirects, entitlement provider ownership, onboarding debounced handle availability and validation.

- [ ] Style search and bookmarks with shared headers, fields, post presentation, and explicit loading/empty/error states. Keep search submission-only behavior and private bookmark gating.
- [ ] Recompose auth/onboarding wrappers using the selected surface/type system; remove decorative gradient/blur treatments. Preserve real copy, labels, redirects and validation feedback.
- [ ] Style existing Clerk pricing/subscription components through supported appearance tokens and wrappers. Verify CSS variable references resolve; keep factual prices, development notices and upgrade/refresh actions.
- [ ] Style not-found and existing route error states consistently. Ensure recovery links and retry actions remain reachable.
- [ ] Browser-check search URL submission/empty/results, signed-out bookmark prompts, onboarding errors and available account/billing states. Verify no invented claims or altered checkout flow. Run relevant phase scripts, lint/typecheck; commit explicit Task 5 paths.

### Task 6: Verify, review and document the delivered system

**Files:** Create `DESIGN.md`, `.impeccable/design.json`, surface brief and verification report under `docs/superpowers/`; screenshots under `.impeccable/review/`. Modify implementation only to fix confirmed findings.

**Interfaces:** Consume all completed tasks and approved spec. Produce reviewable commits and evidence; no deploy or merge.

- [ ] Run `pnpm lint`, `pnpm typecheck`, `node --test scripts/verify-p*.mjs scripts/verify-agent-context.mjs`, and production build. Compare with baseline; resolve introduced failures using systematic debugging. Re-run only affected checks after fixes, then final required suite once.
- [ ] Capture a bounded batch: 1440px desktop and 390px mobile in both themes, 768px tablet, plus 320px overflow check. Include available social, AI and account surfaces. Open captures to verify they show the named route/state and fully loaded content.
- [ ] Inspect contrast/focus, zoom/wrapping, safe areas, keyboard reachability, theme reload and reduced motion. Fix confirmed visual findings together; confirm in one additional screenshot batch. Run Impeccable mechanical detector once on changed UI paths and triage actual findings without broad suppressions.
- [ ] Invoke requesting-code-review and dispatch a fresh whole-branch reviewer against the baseline. Separately obtain the Impeccable finish review using the approved spec, direction contract, screenshot evidence, changed paths and detector results. No inherited framing; unavailable browser evidence must be disclosed.
- [ ] Resolve material review findings, verify fixes, and obtain required follow-up verdicts. Use verification-before-completion before claiming success.
- [ ] Have the documenter record the actual shipped visual tokens in DESIGN.md and `.impeccable/design.json`, plus a compact route surface brief. Verify consistency with the implementation and record test/browser limitations.
- [ ] Run the AGENTS.md Next.js feedback reporting pass: if verified qualifying candidates exist, run `npx --no-install next internal agent-feedback-instructions` once and follow its guidance. Otherwise record no candidates.
- [ ] Commit only redesign-owned files and use finishing-a-development-branch to hand over the reviewed redesign branch with concise change summary and evidence. Do not merge/deploy without new authorization.

## Plan self-review

Coverage: Tasks 1–2 establish global system and responsive shell; Task 3 covers
social screens; Task 4 AI; Task 5 account/search/saved/plans; Task 6 verification,
fresh review and durable documentation. Review Focus conditions have explicit
owning browser checks. Existing APIs remain unchanged; no new cross-task
function signatures are introduced. Style-only work uses meaningful existing
regression checks and browser verification, not tests mirroring implementation.

## Execution decision

Owner approved the plan and selected subagent-driven execution. Owner then
explicitly required parallel agents without worktrees. Tasks 1–5 have disjoint
file ownership and unchanged semantic token/prop contracts, so they may overlap.
The controller alone stages and commits each task's files, owns shared build
commands and task-ledger updates, and orders read-only reviews after reports.
Implementers must not stage, commit, change branches, run shared Next.js builds,
or edit files outside their exclusive allowlist. Task 6 starts after integration.
