# Tether: floating charcoal panels

Approved: owner explicitly requested implementation on 2026-10-26. Supersedes
the Window seat visual direction; product behavior remains authoritative.

## Purpose and visual authority

Keep Tether welcoming for casual, everyday sharing. Translate the owner's
attached dark social-profile reference into Tether: a sculpted static backdrop,
floating charcoal panels, subtle highlights, spacious imagery, large corners,
outlined secondary controls and white primary actions. Keep the Tether name,
logo, real content and existing functionality. Do not copy X branding or invent
trends, recommended accounts, notifications, verification or extra profile tabs.

The owner selected three desktop panels, both themes with dark-led design and
unchanged saved/system theme behavior, and a close material translation rather
than a flat interpretation. Continue code-first. No new dependencies, backend
changes, shaders, animated backgrounds, or model/service configuration changes.

## System contract

Retain existing semantic CSS names and primitive APIs. Dark: near-black backdrop,
charcoal panels, off-white ink, readable gray metadata, white primary controls,
blue text links. Light: cool-gray backdrop, porcelain panels, charcoal primary
controls and blue links. Use opaque base surfaces with subtle gradients and
soft offset shadows; backdrop filtering must not be necessary for readability.
Reference-pinned large panels/gradients override generic style detector taste.

System sans; body16px/1.6; controls14px; metadata12–14px; headings28–32px.
Outer panels32px desktop/20px mobile; controls pill-shaped, grouped inner
surfaces16–20px. Preserve focus, error semantics, readable disabled states,
44px mobile targets and reduced motion. No animated post entrances.

Shared additions: CSS `.shell-panel` for opaque graduated outer panels and
`.app-backdrop` for static CSS backdrop. Foundations owns their definitions;
other agents consume them without editing globals. Add backward-compatible
Avatar `size="profile"` = 96px mobile/112px sm+; existing sizes unchanged.

## Responsive shell

At >=1280px use max1440px workspace, padding32px, gaps24px, columns232px /
minmax(0,760px) / 288px, centered. Between1024–1279 use216px labeled navigation
plus main; hide right rail. Between768–1023 use72px icon rail plus main.
Below768 retain mobile56px header and safe-area bottom nav; panel corners20px,
small outer gutters. Never clip page actions at320px.

Sidebars sticky top32px desktop, maximum height calc(100dvh - 64px), vertical
scroll for short windows. Preserve document scroll, existing feed scroll
restoration and BOTH AI scroll regions: conversation list and message history.
Do not use overflow ancestors that break sticky headers or focus rings.

Right sidebar: native GET post search to /search?q=…, existing account/plan
information, About/Join and development notice. No new query/API needed. Unique
search label/id distinct from route's primary form. Below1280 retain compact
About/Join/plans footer and existing accessible search navigation. Keep account,
theme, sign-in/up and billing actions reachable at every breakpoint.

## Surfaces

Profiles are the closest reference translation: inset banner200px desktop /
160px mobile,32px/20px corners, overlapping profile avatar, spacious identity,
outlined Edit/Follow, existing bio/join date/counts/Posts. Preserve inline
editing and upload lifecycle; no fabricated profile metadata or tabs.

Feeds and threads: one continuous main panel containing composer, existing
tabs and avatar-led posts. Quiet separators, readable author hierarchy,
comfortable spacing and restrained actions. Preserve upload/alt text, four-image
grid, counts, reply/delete/like/bookmark, pagination and URL/state behavior.

AI: same materials on list/header/message/composer; retain all thread URLs,
history, streaming, rename, request ids, Enter/IME, focus/scroll-follow,
stop/retry, quota and permission states. No model calls needed for styling QA.

Search/saved/auth/onboarding/pricing/billing/not-found/errors/loading/empty:
consistent panel language, same fields/copy/actions and supported Clerk
appearance. No new checkout/auth implementation. Internal wrappers should
allow the outer material to read instead of repeatedly painting flat cards.

## Delivery and verification

Owner required: merge prior branch into local main, delete it, then work on
codex/redesign-2.0 without worktrees. Completed merge baseline d029dd0. Prior
account changes and two reviewed reachability fixes are preserved in4d45395.
Baseline lint/types41tests and Webpack production build pass. Existing Node
module-type warnings and Turbopack CSS-worker port issue are preexisting.

Run parallel implementers with exclusive file ownership. Controller alone owns
Git/index/commits and shared Next build/typegen/browser. Review tasks, then
whole-branch code and design review. Preserve all APIs/schemas/hooks/handlers/
permissions/validation and state ownership; no backend changes. Test relevant
existing behavior, no tests mirroring styling.

Browser checks:1440/1280/1024/768/390/320 widths, both themes,600px short
height, long names/text/images, focus, sidebar account reachability, mobile
safe areas, sticky headers and saved/system theme. Check actual gradient
contrast and fallback surfaces. Exercise available auth/social/search/profile/
saved/AI flows without paid activity; report unexercised cases honestly.
Capture desktop/mobile both themes and representative routes, inspect once,
fix in one batch, confirm. Document actual tokens in DESIGN.md and sidecar.
No deployment or merge of the new redesign is authorized.
