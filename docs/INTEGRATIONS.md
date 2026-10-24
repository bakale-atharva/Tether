# Integration notes

Findings checked against current documentation (Context7: Clerk docs, Convex
docs; bundled Next.js 16 guides in `node_modules/next/dist/docs/`) and the
installed package types. Update this file whenever an integration changes.

| Package | Version |
| --- | --- |
| `next` | 16.4.2 |
| `@clerk/nextjs` | 7.9.x |
| `convex` | 1.47.x |

## Clerk ↔ Convex

- Clerk's **Convex integration** is activated in the Clerk Dashboard
  (`/apps/setup/convex`). Session tokens then carry `aud: "convex"`, so no JWT
  template is needed.
- `convex/auth.config.ts` points `domain` at `CLERK_FRONTEND_API_URL` with
  `applicationID: "convex"`. The variable must be set on the Convex deployment
  (`npx convex env set CLERK_FRONTEND_API_URL …`); Convex does not read
  `.env.local`.
- The browser client is `ConvexProviderWithClerk` from `convex/react-clerk`,
  passed Clerk's `useAuth`. It lives in a client component
  (`components/providers/convex-client-provider.tsx`) nested inside
  `<ClerkProvider>`.
- Client components gate on `useConvexAuth()` (not Clerk's `isSignedIn`) before
  calling authenticated functions, because Convex validates the token after
  Clerk reports a session.
- Server-side, identity comes only from `ctx.auth.getUserIdentity()`; ownership
  keys use `tokenIdentifier`. Helpers live in `convex/lib/auth.ts`.

## Next.js 16

- Middleware is `proxy.ts` with `clerkMiddleware()`. Route protection happens per
  resource (Convex functions and pages), not with the deprecated
  `createRouteMatcher()`.
- `cacheComponents` is enabled: anything reading request data (Clerk session,
  cookies, `searchParams`) must render inside a `<Suspense>` boundary. Clerk
  components that read auth state are wrapped accordingly.
- `LayoutProps<"/">` / `PageProps<"/route">` are global route-type helpers.

## Convex

- Follow `convex/_generated/ai/guidelines.md`: validators on every function,
  indexes instead of `.filter()`, bounded reads, `tokenIdentifier` for identity.
- Components to adopt in later phases: `@convex-dev/rate-limiter` (agent quotas),
  `@convex-dev/agent` (chat + mentions), `@convex-dev/aggregate` if counts need
  ranges.

## Verification tooling

- `pnpm lint` – ESLint (Next core-web-vitals + TypeScript rules).
- `pnpm typecheck` – `tsc --noEmit` for the app and the `convex/` project.
- `pnpm build` – production Next.js build.
- `pnpm verify` – all of the above in order.
- Browser verification uses the Claude preview (`.claude/launch.json`) at
  desktop and 375px mobile widths, light and dark.
- Per the plan, there is no Vitest or end-to-end test tooling.

## Clerk Billing (Phase 6)

- Development user plans: `free_user` (Free), `pro` ($10 USD/month); feature
  `tether_agent` on Pro. No annual Pro billing or trials. Configuration:
  `config/clerk-billing.dev.json`; preview with `clerk config patch --instance dev
  --file config/clerk-billing.dev.json --dry-run` before applying.
- Pricing uses `PricingTable for="user"`; management uses
  `SubscriptionDetailsButton` from `@clerk/nextjs/experimental`. Backend SDK is
  pinned at 3.25.0 for webhook verification.
- Convex typed env: `CLERK_SECRET_KEY` and `CLERK_WEBHOOK_SIGNING_SECRET`, both
  optional so an unconfigured environment fails closed. Store only in deployment
  env, never in source. This app does not configure Stripe directly.
- Live authorization fetches `/users/{id}/billing/subscription` plus
  `/billing/plans?payer_type=user&limit=100`. The embedded subscription plan can
  omit its features; join the authoritative catalog by plan ID. No session or
  cache-based entitlement grants. Details and verification: `docs/PHASE-6.md`.
- Development webhook: `/webhooks/clerk` on the Convex site domain, not Next.js.
  Signature verification occurs before any action. Duplicate IDs and stale
  snapshots are rejected atomically, and lookup outages return 503 for retries.
- Tailwind utilities now compile through `postcss.config.mjs` with the official
  `@tailwindcss/postcss` plugin for both bundlers. The previous custom Turbopack
  rule did not process utilities in production Webpack builds.

## Private Agent (Phase 7)

- Convex Agent 0.7.7 with AI SDK 7.0.28, provider 4.0.3 and provider-utils 5.0.10;
  OpenRouter provider 3.1.0; rate-limiter 0.4.2. Keep these versions aligned.
- Components mount as `agent` and `rateLimiter`. Typed optional env:
  `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`; generation runs in a Node action.
- All configured models must use an explicit `:free` identifier. SDK retries and
  provider fallback are disabled. The code default is the agreed NVIDIA model;
  the personal dev environment explicitly overrides it with verified free
  `liquid/lfm-2.5-2.6b:free` because the NVIDIA provider returned 404.
- Application conversation ownership authorizes every history/delta read.
  Live Clerk authorization is checked on submission and immediately before model
  execution. Shared transactional quotas/lock live in `lib/agentQuota.ts` and
  `agentRequests.ts`. See `docs/PHASE-7.md` for verification and remaining checks.
