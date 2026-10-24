import { RateLimiter, DAY } from "@convex-dev/rate-limiter";
import { ConvexError } from "convex/values";
import { components } from "../_generated/api";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export const agentLimits = new RateLimiter(components.rateLimiter, {
  agentDaily: { kind: "fixed window", rate: 50, period: DAY, capacity: 50, start: 0 },
  agentCooldown: { kind: "token bucket", rate: 1, period: 5000, capacity: 1 },
});
// All surfaces call this in the same transaction as inserting/restarting a request.
export async function reserveAgentCapacity(ctx: MutationCtx, ownerId: Id<"users">, retry: boolean) {
  const lock = await ctx.db.query("agentLocks").withIndex("by_ownerId", q => q.eq("ownerId", ownerId)).unique();
  if (lock?.requestId) throw new ConvexError({ code: "AGENT_BUSY", message: "Wait for your current response to finish, or stop it first." });
  const cooldown = await agentLimits.limit(ctx, "agentCooldown", { key: ownerId });
  if (!cooldown.ok) throw new ConvexError({ code: "COOLDOWN", message: "Please wait five seconds between requests." });
  if (!retry) {
    const daily = await agentLimits.limit(ctx, "agentDaily", { key: ownerId });
    if (!daily.ok) throw new ConvexError({ code: "DAILY_QUOTA", message: "You've used your 50 requests for today. Your limit resets at midnight UTC." });
  }
  return lock?._id ?? await ctx.db.insert("agentLocks", { ownerId });
}
