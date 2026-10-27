# Floating charcoal panels: delivery evidence

## Branch and scope

Implemented on `codex/redesign-2.0`, based on local main merge `d029dd0`.
The owner requested merging the prior Window seat work first; its unfinished
account changes were checkpointed with two reviewed reachability fixes in
`4d45395`, merged locally, and `codex/window-seat-redesign` deleted. Local main
has not been pushed. The new redesign has not been merged or deployed.

The implementation preserves existing handlers, URLs, data/API/schema contracts,
permissions, validation, query timing and state ownership. No dependencies or
backend code changed. The Avatar profile size is additive. A native GET search
in the right sidebar uses the existing search route. No unsupported reference
features were added. The approved spec lives in
`docs/superpowers/specs/2026-10-26-charcoal-panels-design.md`.

## Automated checks

After the final pricing token correction:

- `pnpm lint`: passed.
- `pnpm typecheck`: passed, including frontend and Convex TypeScript projects.
- `node --test scripts/verify-p*.mjs scripts/verify-agent-context.mjs`:41 passed,
  zero failed. Existing Node module-type warnings remain; package configuration
  was not changed to suppress them.
- `pnpm exec next build --webpack`: passed,16 routes generated.
- Focused lint/diff checks and mechanical design checks on feature areas passed.

The default Turbopack CSS-worker local-port failure is preexisting and was
reproduced during the earlier baseline, including outside the sandbox. Webpack
is the established verification fallback. Production browser verification used
port3100 to avoid stale lazy-route development styles after builds.

## Browser evidence

An existing signed-in development test account was used without altering its
subscription or creating public content.

- Profile layouts checked at1440,1280,1024,768,390 and320px; no document horizontal
  overflow. Sidebars correctly become232/216/72px and the right panel hides
  below1280px. At600px height, sidebars remain bounded with vertical scrolling.
- Profile inline editor opened/closed at320px. Labels, file fields and Save
  remain within the viewport; no profile update was submitted.
- Four synthetic local PNGs selected into the composer at320px: four previews,
  four description fields and four Remove controls, no horizontal overflow.
  A261-character unbroken draft also fit. All draft images/text were cleared;
  no Post action was invoked and nothing was published.
- Feed keyboard ArrowRight/ArrowLeft selected Following/For everyone and updated
  the existing `?feed=following` URL correctly.
- Right-sidebar search submitted `Hey` through native GET and loaded existing
  results at `/search?q=Hey`.
- Existing private chat history loaded without generating a response. Both
  conversation-list and message-history scroll regions remain. Saved interrupted
  response/error/Retry and composer states were inspected; no retry/send used.
- Light/dark theme changes and system cycle were exercised. Skip-link navigation
  focused the main area. Captures show both themes and mobile navigation.
- Loaded Clerk pricing inspected at1440px and320px. Browser checks found an
  unreadable badge/CTA; the root cause was Clerk-local CSS token self-reference
  when passed `var(--accent)`. Collision-safe root `--clerk-color-*` aliases and
  supported CSS-object overrides resolve it without changing checkout behavior.
- Final computed pricing CTA: light text `rgb(251,251,252)` on
  `rgb(40,41,44)`; dark text `rgb(32,33,32)` on `rgb(244,244,242)`;44px high.
  Neutral badges also have distinct foreground/background in both themes.
- Literal palette contrast checks include text on both panel-gradient endpoints,
  secondary surfaces, selected states, errors, disabled controls and input borders.

The curated screenshots in this directory are settled production captures:
desktop/mobile profiles in both themes and loaded dark pricing. The profile
account has no banner/avatar upload or posts, so real empty states are shown
rather than manufactured imagery/content.

## Review results and limits

Each of the five task source gates approved its scoped changes. An independent
whole-branch code reviewer found no actionable regressions; the pricing fix
received a scoped follow-up approval. Independent visual finish review returned
**`disposition: ship`**, with no material findings in the supplied desktop,
mobile, tablet and pricing captures. This is visual approval at that scope,
not proof of every possible runtime state.

Not exercised live: publishing/deleting posts, saving profile changes, follow/
like/bookmark mutations, fresh sign-in/sign-up/onboarding, alternate subscription
states, checkout/cancellation, model generation/stop/retry and an actual phone's
software keyboard. Source contracts and existing tests cover parts of these;
they do not replace live end-to-end verification. No paid activity or service
configuration changes were performed.

## Decisions carried forward

- Parallel agents with exclusive file ownership: explicitly requested by owner;
  central Git/build ownership prevented collisions. Residual risk is integration
  behavior not represented by scoped source checks, addressed by combined tests.
- No worktrees: explicitly requested by owner; work stayed on the named branch
  in the shared checkout. No unrelated changes were reset or discarded.
- Large corners and subtle gradients: explicitly pinned by reference and user;
  these override generic style preferences while contrast remains required.
- Presentation verification uses existing behavior tests and browser evidence,
  without tests mirroring CSS classes. Remaining unexercised states are listed
  above instead of being claimed as passing.
