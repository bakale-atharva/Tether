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
