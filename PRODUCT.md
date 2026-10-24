# Tether

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Everyday, casual users sharing ordinary life and catching up with other people.
The owner explicitly wants an experience less centered on arguments, debate,
and outreach than Twitter.

## Product Purpose

Public conversations, following people, finding and privately saving posts,
and optional AI assistance. The redesign should make these existing tasks
welcoming and approachable while preserving their functionality.

## Operating Context

Responsive browser application with desktop and mobile navigation. Visitors can
read public feeds, profiles, threads, and search. Signed-in users can participate
after onboarding. Existing private AI conversations are owned by the user.

## Capabilities and Constraints

Repository evidence: Next.js App Router, React, Tailwind, Clerk for identity and
billing, and Convex for application data and agent workflows.

Preserve existing routes, permissions, data behavior, query and mutation wiring,
form validation, uploads, pagination, authentication redirects, entitlements,
and conversation streaming/cancellation/retry behavior. Keep public and Following
feeds, posts and replies, images and alt text, likes, private bookmarks, search,
profiles and follows, onboarding, private AI chat, pricing, and billing.

The owner authorized a complete frontend UI/UX redesign with no functional
regressions. Existing uncommitted work from other chats is outside this
redesign's ownership and must be preserved. Implementation must use a stable
baseline after their coordinated checks.

## Brand Commitments

Keep the product name Tether. The owner chose the exploratory layout
“A familiar corner”: quiet sidebar navigation and a single conversation column.
Palette, typography, and final visual identity remain open; the initial layout
mockup did not approve those details.

## Evidence on Hand

Existing routes, components, and docs/SPEC.md describe current capabilities.
The Superpowers companion records the owner's selection of `a-calm-sidebar`.
Mockup people and posts are fictional examples, not production content or claims.

## Product Principles

- Make ordinary sharing feel welcome.
- Keep reading and contributing easy to find.
- Preserve existing functionality throughout the redesign.
- Keep private information and plan-gated actions within existing access rules.

## Accessibility & Inclusion

The repository specifies WCAG AA contrast, visible keyboard focus, a skip link,
responsive layouts, loading/empty/error states, and light and dark themes.
Preserve these capabilities and respect reduced motion preferences.
