# Tether frontend redesign: Window seat

Status: approved by the owner on 2026-10-24. Layout A and Window seat are
selected; this document defines their full application-wide interpretation.

## Intent

Make Tether welcoming to everyday, casual users sharing ordinary life. The owner
does not want the experience to center on arguments, debate, or outreach. Redesign
the frontend completely while preserving current functionality. PRODUCT.md records
the confirmed product context.

Success means people can find the same features, read comfortably, post and reply
without friction, and use the app on mobile, desktop, and in either theme. The
product should feel consistent across social, account, and AI surfaces.

## Decisions and approaches

The owner chose **A, A familiar corner**, over B, An open journal, and C, The
common room. A uses quiet sidebar navigation and one continuous conversation
column. B would give individual updates more breathing room at the expense of
density and navigation visibility. C would separate writing into a companion
column but make the desktop busier and require a larger mobile rearrangement.

Within A, the owner chose **Window seat**, over Community garden and Simple
social. Window seat uses cool cloud surfaces, violet accents, and rounded,
clear typography. Community garden was more grounded and familiar in green;
Simple social was a conventional white-and-blue interface. Both were declined
in favor of Window seat. The owner also selected code-first interactive browser
mockups rather than generated image references.

Implementation approach proposed here: restyle the existing React components,
shared primitives, theme tokens, and presentational markup in place, preserving
hooks, handlers, providers, and request boundaries. A new component framework
would increase migration risk without helping this scope. A CSS-only recolor
would not deliver the requested full redesign. No backend rewrite is needed.

## Scope and non-goals

Cover the global shell, navigation, feeds, composers, posts, threads, profiles,
profile editing, follower/following lists, search, bookmarks, private AI chat,
pricing, billing, onboarding, sign-in/up wrappers, not-found and error surfaces,
and shared loading/empty/error states.

Preserve existing routes and URLs, navigation destinations, public access,
onboarding requirements, form fields and validation, query arguments and timing,
pagination, image uploads and alt text, action permissions and confirmations,
private data boundaries, feed order and default tab, subscription behavior,
theme preference persistence, and AI history/streaming/stop/retry semantics.
Do not add ranking, trends, notifications, reposts, direct messages, new feeds,
or new backend features. Do not invent people, posts, testimonials, or commercial
claims in the production UI. Mockup data stays confined to the companion.

An attractive result that hides existing actions, makes ordinary reading feel
technical, changes permissions or data flow, or discards other chats' work fails
this brief. Existing factual and instructional copy remains authoritative;
new conversational headings must not replace form labels or introduce claims.

## Visual system proposal

Light scene: someone casually catching up on a phone or laptop during the day.
A cool, pale blue-gray canvas (#f0f3f7), white reading and input surfaces,
dark slate text (#252b3a), slate secondary text (#566074), and violet primary
actions (#5145a0) establish the selected mockup. Pale lavender (#e3dff3) marks
selected navigation and quiet emphasis. Borders (#c7ceda) delineate controls
and entries without enclosing every post in a floating card. Verify final
combinations for WCAG AA; exact supporting tokens remain an implementation call.

Dark scene: the same casual reading after dark. Use deep slate canvas, slightly
lighter reading surfaces, pale text, subdued slate metadata, lavender actions,
and darker violet selected surfaces. Starting values: canvas #171b26,
surface #202635, text #edf0f8, muted #b3bdd0, borders #3d465d, action #b8acf5
with deep-violet text. These are a proposed translation, not a separate identity.

Use a workhorse system sans-serif stack, with rounded-feeling, clear forms and
semibold headings. This avoids a font download dependency and matches the chosen
HTML preview. Body 16px with 1.6 leading, labels/actions 14px, secondary metadata
12–14px, page headings 26–32px. Text remains selectable and responsive. No serif
display treatment, decorative gradients, glows, or ornamental illustrations.
Preserve the Tether name and existing logo geometry, translating its color.

Use an 8px spacing rhythm with 4px adjustments, 10–12px control corners,
16px grouped-panel corners, round avatars, restrained borders, and minimal
shadows. Standard interactive targets should be at least 44px on mobile;
compact desktop actions may retain their current density with clear focus.

## Shell and responsive behavior

Desktop at 1024px and above: center an approximately 1000px workspace with a
220–240px sidebar and a reading column capped around 680px. The sidebar holds
the brand, existing primary destinations, theme toggle, and account controls.
The reading column remains the visual focus. Remove the repeated informational
right rail; retain its unique plan/join/about content in compact shell footer
or account-adjacent sections that remain reachable. Do not remove authenticated
or signed-out account actions. No third content column or feed recommendations.

Tablet from 768px to 1023px: compact icon rail with accessible names; full-width
reading area within the same maximum measure. Mobile below 768px: existing
header/account/theme affordances and bottom navigation, with safe-area spacing.
Keep all current destinations and conditional profile visibility. The bottom
bar must not obscure controls, error messages, upload tools, or chat input.

Avoid nested main-page scroll containers. Preserve document scroll for social
surfaces and the existing chat scroll-follow behavior. Test at 390px, 768px,
and 1440px and inspect at 320px for horizontal overflow. Long names and handles
must wrap or truncate without hiding actions; content must survive zoom.

## Screen-by-screen composition

### Home and posts

Use a small page label and welcoming heading above the existing composer. Show
Public/Following in their current order and preserve the default selection and
keyboard tab behavior. Keep the composer inline with image picker, previews,
removal, alt text, character counter, pending states, and errors. Posts use a
consistent avatar gutter, legible author/handle/time row, comfortable body text,
existing image grid, and a quieter action row. Keep all current reply, like,
bookmark, and owner-only delete behavior; retain deletion placeholders.

### Threads and profiles

Threads distinguish the focused post from replies using scale and surface tone,
with visible conversation hierarchy. Keep reply toggles, focus restoration,
pagination, and the existing reply composer behavior. Do not add collapse or
sorting behavior.

Profiles keep banner uploads, avatar, display name, handle, bio, joined date,
follow controls, follower/following links, posts, and current editing entry.
Use a clean banner region and grouped identity area. Existing dialogs/forms
keep their lifecycle and validation; only their presentation changes. People
lists align avatars, identity, and follow actions and retain pagination.

### Search and bookmarks

Search begins with the existing labeled search field and submit action. Keep
URL query handling, submission-only execution, results, and empty/error states.
Bookmarks reuse the same post presentation and preserve private access and
signed-out prompts. Avoid empty-state content that implies automatic discovery.

### Private AI chat

Keep existing conversation list, new chat, selected thread URL, rename controls,
message history, live text, and composer. On wide screens use the current nested
conversation-list/content structure within the main workspace, with enough
width for the message pane; the global sidebar remains visually secondary.
On small screens keep the existing accessible horizontal conversation selector
or its current equivalent, rather than adding new drawer behavior.

Human and assistant messages use clear author labels and distinct quiet surfaces.
Preserve live-region announcements, scroll-follow logic, Enter/Shift+Enter/IME
handling, send idempotency, disabled states, stop/retry, active-request messaging,
quota text, upgrade/refresh controls, and access to saved history when generation
is unavailable. Do not change plan loading into an allowed state or hide errors.

### Account, onboarding, pricing, billing

Auth wrappers use the same brand, surfaces, type, and focus treatment, while
Clerk retains ownership of authentication and payment flows. Use supported
appearance tokens; no custom replacement checkout or sign-in implementation.
Keep onboarding labels, availability checking, validation, redirects, and save
states. Pricing and billing keep their factual copy, development notices,
authoritative plan state, redirects, and Clerk components. No new prices or claims.

## Interaction and accessibility

Signature detail: a restrained lavender selected-navigation inset and clear
active feed underline provide orientation. Existing hover and press feedback
uses roughly 120–160ms color transitions; avoid layout movement and animated
post entrances. Reduced-motion users get immediate state changes.

Preserve semantic headings, landmarks, skip link, focus rings, ARIA labels,
live regions, tabs keyboard handling, form associations, image alt text, and
disabled/busy state communication. Error styling uses a semantic error color
and text, never color alone. Loading, empty, unavailable, signed-out, and
permission-gated states are part of every affected screen's design.

## Implementation boundaries and coordination

Other chats are currently completing/reviewing Phase 7 in this shared checkout.
Do not mutate their files during their requested stability window. Before
implementation, confirm that work has settled. The owner subsequently explicitly
prohibited worktrees: use the current checkout on a separate redesign branch,
with parallel subagents and disjoint file ownership, as subsequently requested
by the owner. Preserve all unrelated modifications.
Docs and ignored companion files are the only redesign changes so far. Stage
only redesign-owned files/hunks; no blanket add, reset, checkout, or stash.

Read relevant installed Next.js documentation before editing routes/layouts and
keep server/client and Suspense boundaries intact. Backend code is outside
scope; if an unavoidable issue is found, report it and route it separately.

## Verification and completion

Before edits, establish baseline lint/typecheck/build results on the settled
checkout and record existing failures. Inspect existing verification scripts
and run those relevant to the preserved behavior. Add a regression test only
where a meaningful behavior risk is introduced; do not write tests that merely
mirror styles or mockup markup.

After implementation: lint, both TypeScript projects through the project command,
production build, and relevant current verification scripts. Browser checks
cover home/feed switches, posting and image tools, thread/reply actions,
profile/follow/edit, search submission, bookmarks, theme persistence,
onboarding/auth wrappers, pricing/billing states, and AI history/stream/send/
stop/retry/rename where test accounts and existing services permit. Do not
create paid activity or change service configuration to obtain screenshots.

Capture desktop/mobile light and dark, plus tablet layout; inspect the batch,
fix findings in one batch, and confirm. Explicitly disclose checks blocked by
accounts, permissions, or service availability. A visual pass does not establish
functional parity. Obtain fresh implementation review and design review, resolve
material findings, document the shipped tokens in DESIGN.md and the design
sidecar, and provide reviewable commits/branch output. This request does not
authorize production deployment or merging the redesign.

## Builder discretion

Exact spacing within the proposed ranges, responsive utility classes,
supporting semantic colors verified for contrast, reusable presentation helper
extraction, icon sizing, and minor composition adjustments are delegated to the
builder. Preserve the chosen single-column layout and Window seat identity.
Any change to routes, workflows, permissions, default feed, or feature set is
outside that discretion.
