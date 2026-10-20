import { ConvexError } from "convex/values";
import type { UserIdentity } from "convex/server";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type AuthCtx = Pick<QueryCtx, "auth">;
type DbCtx = Pick<QueryCtx | MutationCtx, "auth" | "db">;

// Every acting user is derived from the verified Clerk token. Never accept a
// user id or handle from the client for authorization.
export async function requireIdentity(ctx: AuthCtx): Promise<UserIdentity> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new ConvexError({ code: "UNAUTHENTICATED", message: "Sign in to continue." });
  }
  return identity;
}

export async function getViewer(ctx: DbCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();
}

// For signed-in features: requires a finished onboarding profile.
export async function requireViewer(ctx: DbCtx): Promise<Doc<"users">> {
  await requireIdentity(ctx);
  const viewer = await getViewer(ctx);
  if (viewer === null) {
    throw new ConvexError({
      code: "ONBOARDING_REQUIRED",
      message: "Finish setting up your profile first.",
    });
  }
  return viewer;
}
