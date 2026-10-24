# Phase 7 — Private agent

`/tether` now provides private persistent conversations with paginated history,
conversation creation/renaming, a desktop conversation sidebar and mobile list,
streamed responses, stop/retry, upgrade prompts, and recoverable failures. The
selected thread lives in the URL. Existing history remains readable after a
subscription downgrade. Enter sends; Shift+Enter inserts a newline. A polite
live region announces completion and cancellation; streaming text is outside it.

## Integration and authorization

Convex Agent owns threads, messages and durable stream deltas; the application
owns `agentConversations` and checks its owner on every message/stream query,
rename, and request operation. Acting users come from verified auth, never args.
The component API is not publicly re-exported. Private context searches across
threads are disabled. Generation retains the newest complete exchanges within
a 28,000-byte serialized context budget, always preserving the current prompt.
Retries generate anew without replaying partial responses. The agent has no tools, image understanding or web access. Recent complete
exchanges are bounded to 28KB UTF-8 while retaining the current prompt.

Generation uses a scheduled internal Node action. Both public submission and the
worker perform live authoritative Clerk entitlement checks; cached UI plan state
never grants model execution. The worker checks the claimed owner's Clerk ID.
Cancellation of a subscription preserves only the paid period's access.

Dependencies are pinned together: Agent 0.7.7, AI SDK 7.0.28, provider 4.0.3,
provider-utils 5.0.10, OpenRouter provider 3.1.0, rate-limiter 0.4.2. Current newer
SDK/provider combinations produced incompatible types; these versions pass both
TypeScript projects. Node is required for reliable SDK stream-abort cleanup:
provider errors in the isolate runtime produced unhandled abort errors, while
Node persists a recoverable error and releases the lock immediately.

## Free-only provider configuration

`OPENROUTER_API_KEY` is a server-only Convex environment secret, configured by the
owner. Optional `OPENROUTER_MODEL` overrides the required plan default
`nvidia/nemotron-3-super-120b-a12b:free`. The server rejects identifiers that do not
end in `:free`, including paid models and automatic routers. Provider fallback
and automatic SDK retries are disabled. Provider price ceilings for prompt,
completion, and request are all zero. No code automatically changes models.

During verification the NVIDIA default returned HTTP 404. The personal
**development** deployment explicitly uses `liquid/lfm-2.5-2.6b:free`, listed by
OpenRouter with zero prompt/completion prices. It produced a real persisted
response. This override is visible in Convex's environment settings, not a paid
or automatic fallback. All development verification calls used free identifiers. A final check with
zero price ceilings received provider HTTP 429 and correctly persisted a
recoverable provider error; the provider can impose stricter free-tier limits
than the application quota. No paid fallback was attempted.

## Shared request controls

`agentRequests` is the shared private/mention request ledger for Phase 8 to reuse.
`reserveAgentCapacity` applies the rate-limiter component in the same transaction
as inserting/restarting a request:

- 50 new requests per UTC day; fixed window starts at epoch zero.
- Five-second token-bucket cooldown with capacity one.
- One app lock per owner across all conversations and request kinds.
- Client submission IDs deduplicate ambiguous network retries.
- Explicit response retry preserves the original request and prompt, increments
  the attempt fence, and consumes cooldown but no second daily request unit.
- Only the latest failed/canceled request in a conversation may retry.

Queued stop prevents worker claim. Running stop aborts the durable stream and
retains the lock until the worker settles. A 120-second abort signal bounds model
execution. A scheduled 180-second lease recovers interrupted workers; stale
claims, completions and expiry jobs cannot overwrite later attempts. Internal
summaries do not create new user requests. Phase 8 mention detection/publication
is intentionally not part of this phase.

## Verification evidence

- `node --test scripts/verify-*.mjs`: 41/41 tests pass. New policy and registered
  function tests cover ownership forgery, signed-out denial, quota UTC boundary,
  cooldown, duplicate submission, worker/attempt fencing, stop/lock lifecycle,
  retry accounting, and revoked entitlement before reaching the model.
- `pnpm lint` and `pnpm typecheck`: pass.
- `pnpm exec next build --webpack`: production build passes, including `/tether`.
  Default Turbopack build fails on a CSS worker local-port restriction, including
  after escalation. This environment limitation was also seen in Phase 6.
- Personal development backend pushed successfully; no production deployment.
- Live different-user detail returns null; messages and stream queries, rename,
  and request state reject. Signed-out list and forged owner args reject.
- A real Free Clerk account receives `PRO_REQUIRED` before creating a request or
  making a model call. The synthetic Pro account's canceled-but-paid period
  remains valid through the existing authoritative billing guard.
- Real free-model response persisted, owner-only UI query returns its visible text
  without reasoning, and active lock released on completion.
- Nonexistent free model produces recoverable `PROVIDER_ERROR`; restoring the
  working free model and retrying the same request completes successfully.
- Two live concurrent submissions accept exactly one. Durable stream observed;
  a separate fresh query recovers that stream. Stop reaches `canceled` and clears
  the active lock. This establishes backend recovery, not a browser reload test.
- Independent whole-branch review found no confirmed high-impact code defects.
- Mechanical UI detector returned no findings. **Desktop/mobile visual layout,
  browser reload during streaming, and interactive keyboard/focus checks are
  pending.** The in-app browser failed to open; native computer-use permission
  was denied. No browser screenshots or E2E tooling are claimed.

The owner subsequently requested direct merge after the implementation checks.
Implementation issues may be marked Done after merge; the verification issue
remains In Progress for the pending browser checks. The milestone remains open.


## Coordinated review fixes

The owner authorized coordination with the Code Review chat while changes were
being made in this checkout. Its independent review adds class-safe handling of
Clerk SDK resources, focused chat components, bounded context, submission-state
protections and a separate group of general refactors. The SDK instance
regression was reproduced with a failing test, fixed, and included in the green
suite. The original plan's NVIDIA default is retained; the verified free Liquid
override remains explicitly configured only in the development environment.
