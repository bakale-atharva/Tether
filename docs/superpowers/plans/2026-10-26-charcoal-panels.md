# Floating Charcoal Panels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Owner explicitly requires parallel implementers with exclusive file ownership and no worktrees.

**Goal:** Implement the approved reference-driven three-panel Tether redesign without functional changes.
**Architecture:** Restyle existing components and semantic CSS tokens; add one shell sidebar component and an additive Avatar profile size. Existing backend/data/auth/URL/state contracts remain unchanged.
**Tech Stack:** Existing Next16.4.2/React19/Tailwind4/Clerk/Convex; no dependency changes.
**Spec:** docs/superpowers/specs/2026-10-26-charcoal-panels-design.md.

## Global Constraints

- Current checkout on codex/redesign-2.0, baseline d029dd0; no worktrees.
- Parallel exclusive allowlists below. Controller alone stages/commits/builds/typegens/browses; agents never mutate Git or spawn children.
- Existing semantic token/primitive contracts unchanged except additive Avatar profile size.
- Dark reference with white primary controls, blue links, opaque graduated panels and static sculpted background; matching light theme. Preserve system/saved selection.
- Body16px, controls14px, metadata12–14px, headings28–32px; panel32px desktop/20px mobile;44px mobile targets.
- No new features, fabricated content, backend/API/schema/permission changes, dependency changes, paid/model calls, deploy or merge.
- Read installed relevant Next guides and craft-floor before UI edits. User-pinned panel gradients/corners override generic style preferences.

## Review Focus

1. Narrow320px controls and long content: no overflow or overlapping invisible upload inputs (Tasks1/3).
2. Short600px sidebar and keyboard focus: all account actions reachable (Task2).
3. Hidden right rail: About/Join/plans still reachable at all smaller breakpoints (Task2).
4. Dark/system theme and gradients: contrast and saved preference preserved (Task1/finalQA).
5. AI list/history scroll regions and streaming focus/controls retain behavior (Task4).

### Task 1: Materials and shared primitives

Files EXCLUSIVE: app/globals.css, app/layout.tsx, components/ui/*.
Interfaces: preserve semantic CSS names/primitive props; produce .shell-panel,
.app-backdrop and additive Avatar size profile (96px mobile/112px sm+).

- [ ] Read spec/reference/craft floor and installed styling/layout docs.
- [ ] Replace light/dark palettes, panel material/backdrop, typography and metadata colors. Keep theme precedence, providers and reduced motion intact.
- [ ] Update buttons/fields/cards/states/header/toast to coherent reference shapes, readable disabled/focus states. Coordinate PageHeader sticky offset56px mobile and32px desktop with shell. No clipping ancestors.
- [ ] Focused lint/diff check and literal palette contrast checks; report exact files and remaining browser checks. No shared builds or Git writes.

### Task 2: Floating shell and right sidebar

Files EXCLUSIVE: components/shell/*, components/brand/logo.tsx. May create
components/shell/right-sidebar.tsx. Do not edit globals/UI/profile.
Interfaces: consume .shell-panel/.app-backdrop and unchanged tokens/props.

- [ ] Build spec's >=1280 three-column/1024 two-column/768 icon/mobile shell, bounded scrollable sidebars, mobile56px header and safe bottom nav.
- [ ] Add right sidebar native GET search with unique shell-search id; reuse existing account/plan/about/join information without new backend calls. Preserve compact info footer below1280.
- [ ] Preserve all provider/Suspense/landmark/nav/account/auth/theme logic; no inaccessible duplicate landmarks or hidden-only actions.
- [ ] Focused lint/diff/self-review; report for source review and central browser check at short600px height.

### Task 3: Profiles and social surfaces

Files EXCLUSIVE: components/posts/*.tsx, components/profiles/*.tsx,
app/(app)/page.tsx, home-welcome.tsx, app/(app)/[handle]/{profile-view,people-list}.tsx,
app/(app)/[handle]/post/[id]/post-detail.tsx. No .ts hooks or globals/UI/shell.
Interfaces: existing props/handlers unchanged; consume Avatar size profile.

- [ ] Make profile reference-led with inset160/200px banner, profile avatar overlap, spacious identity and outlined actions; keep inline editor/data intact.
- [ ] Recompose feeds/composers/threads/people with generous continuous-panel rhythm, clear tabs/actions, restrained borders and source-authoritative copy. Keep upload input explicitly bounded.
- [ ] Preserve all queries/handlers/effects/URLs/form fields/permissions/validation/state ownership/pagination. Structural surfaces transparent where outer panel should show.
- [ ] Focused lint/relevant existing tests/diff check, report. Browser long text/four images/320px/focus centrally owned.

### Task 4: Private AI presentation

Files EXCLUSIVE: components/agent/*.tsx, app/(app)/tether/{page,error}.tsx.
Interfaces: existing props/hooks/action ids/scroll behavior unchanged.

- [ ] Restyle list/header/messages/composer and plan/error states for charcoal/porcelain materials, rounded controls and responsive message width.
- [ ] Preserve BOTH list and history scroll regions, follow behavior, all streaming/send/stop/retry/rename/IME/permissions/URL semantics.
- [ ] Focused lint/existing agent tests/diff check, report. No service/model calls or Git mutations.

### Task 5: Search, saved and account surfaces

Files EXCLUSIVE: app/(app)/search/*, bookmarks/*, pricing/page.tsx,
billing/page.tsx; components/billing/{pricing,subscription,plan-badge}.tsx;
components/brand/auth-layout.tsx; onboarding/sign-in/sign-up routes; app/not-found.tsx.
Interfaces: retain Clerk flows/appearance API, search GET contract, validation.

- [ ] Translate existing wrappers, forms, current-plan and pricing states to matching panel material, avoiding repeated flat nested shells.
- [ ] Preserve all copy/labels/redirects/query timing/pagination/gating/refresh/payment behavior; no custom auth/checkout.
- [ ] Focused lint/diff and installed Clerk type checks as needed; report. No package/config/backend edits.

### Task 6: Integration, reviews and documentation

Files: controller-owned docs/PRODUCT/surface brief; documenter-owned DESIGN.md
and .impeccable/design.json after implementation and visual review.

- [ ] Review each disjoint task diff and fix actual findings through its owner; commit scoped files centrally.
- [ ] Run complete lint/typecheck41test suite and production Webpack build; compare baseline and diagnose introduced failures.
- [ ] Browser matrix from spec; desktop/mobile both themes and representative profile/feed/AI/account screenshots. Validate screenshots, fix a bounded batch and confirm. Triage detector once per changed area.
- [ ] Fresh whole-branch code review and independent visual finish review with screenshot packet/reference. Resolve material issues and obtain scoped verdicts.
- [ ] Document actual shipped system, update superseded product/brief context, verification limitations and Next feedback reporting pass. No new merge/deploy.

## Preflight

All five code tasks have disjoint owned files and consume unchanged semantic
contracts. Task3's Avatar profile size is the sole additive dependency, fixed
above. Controller checks full TypeScript after all tasks integrate. Shared
Next generation/build/Git operations never run from agents. Parallel execution
overrides skill sequential default by explicit owner instruction.
