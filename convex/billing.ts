import { v, ConvexError } from "convex/values";
import { action, internalAction, internalMutation, internalQuery, query, env } from "./_generated/server";
import { requireIdentity } from "./lib/auth";
import { readAuthoritativeSubscription, shouldApplySnapshot } from "./lib/billing";
import type { ActionCtx } from "./_generated/server";

export const entitlementValidator = v.object({
  allowed: v.boolean(), verified: v.boolean(), plan: v.union(v.literal("free"), v.literal("pro")),
  status: v.string(), accessUntil: v.union(v.number(), v.null()), canceled: v.boolean(), sourceUpdatedAt: v.number(),
});

// Public callers can only inspect their own live subscription. No user-id arg.
export const status = action({
  args: {}, returns: entitlementValidator,
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    return await readAuthoritativeSubscription(identity.subject, env.CLERK_SECRET_KEY);
  },
});

// Call immediately before each private model execution; never gate from cache.
export async function requireAgentEntitlement(ctx: Pick<ActionCtx, "auth">) {
  const identity = await requireIdentity(ctx);
  await requireProForClerkUser(identity.subject);
  return identity;
}

async function requireProForClerkUser(clerkUserId: string) {
  const entitlement = await readAuthoritativeSubscription(clerkUserId, env.CLERK_SECRET_KEY);
  if (!entitlement.allowed) throw new ConvexError({
    code: entitlement.verified ? "PRO_REQUIRED" : "BILLING_UNAVAILABLE",
    message: entitlement.verified ? "Upgrade to Pro to use Tether AI." : "We couldn't verify your plan. Please try again.",
  });
  return entitlement;
}

// For future background mention jobs. Only trusted server code can supply an id.
export const requirePro = internalAction({
  args: { clerkUserId: v.string() }, returns: entitlementValidator,
  handler: async (_ctx, { clerkUserId }) => await requireProForClerkUser(clerkUserId),
});

export const cachedStatus = query({
  args: {}, returns: v.union(entitlementValidator, v.null()),
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const cached = await ctx.db.query("billingSubscriptions").withIndex("by_clerkUserId", q => q.eq("clerkUserId", identity.subject)).unique();
    return cached?.summary ?? null;
  },
});

export const seenEvent = internalQuery({
  args: { eventId: v.string() }, returns: v.boolean(),
  handler: async (ctx, { eventId }) => !!(await ctx.db.query("billingEvents").withIndex("by_eventId", q => q.eq("eventId", eventId)).unique()),
});

// Both dedupe and snapshot ordering commit in one transaction. Webhook events
// trigger fresh Clerk reads, so stale payloads can never resurrect a paid plan.
export const sync = internalMutation({
  args: { eventId: v.string(), eventType: v.string(), clerkUserId: v.string(), summary: entitlementValidator },
  returns: v.null(),
  handler: async (ctx, args) => {
    const seen = await ctx.db.query("billingEvents").withIndex("by_eventId", q => q.eq("eventId", args.eventId)).unique();
    if (seen) return null;
    if (!args.summary.verified) throw new Error("Unverified billing snapshot");
    const current = await ctx.db.query("billingSubscriptions").withIndex("by_clerkUserId", q => q.eq("clerkUserId", args.clerkUserId)).unique();
    if (shouldApplySnapshot(current?.summary.sourceUpdatedAt ?? null, args.summary.sourceUpdatedAt)) {
      const value = { clerkUserId: args.clerkUserId, summary: args.summary };
      if (current) await ctx.db.patch("billingSubscriptions", current._id, value);
      else await ctx.db.insert("billingSubscriptions", value);
    }
    await ctx.db.insert("billingEvents", { eventId: args.eventId, eventType: args.eventType, receivedAt: Date.now() });
    return null;
  },
});
