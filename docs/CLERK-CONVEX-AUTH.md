# Clerk–Convex authentication setup

Checked against current official documentation on 2026-10-27. This is guidance;
no Clerk account, deployment environment or authentication code was changed.

## Recommended: activate the native integration

Tether already uses `ConvexProviderWithClerk` and its backend expects audience
`convex`. A separate JWT template is not required for the native integration.

1. Open [Clerk's Convex integration setup](https://dashboard.clerk.com/apps/setup/convex).
2. Select the same Clerk application and development/production instance used
   by the frontend's Clerk keys. Choose **Activate Convex integration**.
3. Copy the displayed **Frontend API URL**. Development URLs look like
   `https://your-instance.clerk.accounts.dev`.
4. In the matching Convex deployment's environment variables, set
   `CLERK_FRONTEND_API_URL` to that complete URL. This exact variable name is
   used by this repository's `convex/auth.config.ts`.
5. For the development deployment, sync the existing auth configuration with
   `pnpm exec convex dev`, then refresh the app/sign in again if needed.

Convex backend functions do not read the frontend's `.env.local`, so setting the
issuer URL only there does not configure backend token verification. The native
integration pre-maps the required audience claim.

## If you specifically need a manual JWT template

The installed Convex provider also supports the legacy template path.

1. In the same Clerk application's dashboard, open **JWT templates**.
2. Choose **New template**. Use the Convex preset if available, otherwise a blank template.
3. Name it exactly **`convex`**.
4. Ensure its custom claims contain:

   ```json
   {
     "aud": "convex"
   }
   ```

5. Keep the default token lifetime (60 seconds) and allowed clock skew (5 seconds),
   then save. Clerk adds issuer, subject and expiry claims automatically.
6. Use that same instance's Frontend API URL for the Convex
   `CLERK_FRONTEND_API_URL` setting described above.

The template name matches the installed provider's fallback request, and the
audience matches the backend's `applicationID: "convex"`. No custom claims are
needed for Tether's profile fields or plan entitlements.

## Official references

- [Clerk's Convex integration](https://clerk.com/docs/guides/development/integrations/databases/convex)
- [Convex's Clerk integration](https://docs.convex.dev/auth/clerk)
- [Clerk JWT templates](https://clerk.com/docs/guides/sessions/jwt-templates)
