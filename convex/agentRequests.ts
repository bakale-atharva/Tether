import { abortStream, saveMessage } from "@convex-dev/agent";
import { v, ConvexError } from "convex/values";
import { action, query, mutation, internalMutation, internalQuery } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { components, internal } from "./_generated/api";
import { requireAgentEntitlement } from "./billing";
import { requireViewer } from "./lib/auth";
import { ownedConversation } from "./lib/agentAccess";
import { reserveAgentCapacity } from "./lib/agentQuota";
import { canRetry, isActive, promptProblem, REQUEST_LEASE_MS } from "./lib/agentPolicy";

const statusValidator = v.union(v.literal("queued"), v.literal("running"), v.literal("stopping"), v.literal("complete"), v.literal("failed"), v.literal("canceled"));
const errorValidator = v.object({ code: v.string(), message: v.string() });
const requestView = v.object({ id: v.id("agentRequests"), status: statusValidator, error: v.optional(errorValidator) });
const view = (r: Doc<"agentRequests">) => ({ id: r._id, status: r.status, ...(r.error ? { error: r.error } : {}) });

export const state = query({
  args: { threadId: v.string() }, returns: v.object({ latest: v.union(requestView, v.null()), active: v.union(requestView, v.null()) }),
  handler: async (ctx, { threadId }) => {
    const { viewer, conversation } = await ownedConversation(ctx, threadId);
    const lock = await ctx.db.query("agentLocks").withIndex("by_ownerId", q => q.eq("ownerId", viewer._id)).unique();
    const latest = conversation.lastRequestId ? await ctx.db.get("agentRequests", conversation.lastRequestId) : null;
    const active = lock?.requestId ? await ctx.db.get("agentRequests", lock.requestId) : null;
    return { latest: latest ? view(latest) : null, active: active ? view(active) : null };
  },
});
export const send = action({
  args: { threadId: v.string(), prompt: v.string(), clientRequestId: v.string() }, returns: v.id("agentRequests"),
  handler: async (ctx, args): Promise<Id<"agentRequests">> => {
    await requireAgentEntitlement(ctx);
    return await ctx.runMutation(internal.agentRequests.enqueue, args);
  },
});
export const retry = action({
  args: { requestId: v.id("agentRequests") }, returns: v.null(),
  handler: async (ctx, args) => {
    await requireAgentEntitlement(ctx);
    await ctx.runMutation(internal.agentRequests.restart, args);
    return null;
  },
});
async function schedule(ctx: MutationCtx, requestId: Id<"agentRequests">, attempt: number) {
  await ctx.scheduler.runAfter(0, internal.agentGeneration.run, { requestId, attempt });
  await ctx.scheduler.runAfter(REQUEST_LEASE_MS, internal.agentRequests.expire, { requestId, attempt });
}
export const enqueue = internalMutation({
  args: { threadId: v.string(), prompt: v.string(), clientRequestId: v.string() }, returns: v.id("agentRequests"),
  handler: async (ctx, args) => {
    const { viewer, conversation } = await ownedConversation(ctx, args.threadId);
    const problem = promptProblem(args.prompt);
    if (problem) throw new ConvexError({ code: "INVALID_PROMPT", message: problem });
    if (!/^[a-zA-Z0-9-]{16,80}$/.test(args.clientRequestId)) throw new ConvexError({ code: "INVALID_REQUEST", message: "Please try sending again." });
    const previous = await ctx.db.query("agentRequests").withIndex("by_ownerId_and_clientRequestId", q => q.eq("ownerId", viewer._id).eq("clientRequestId", args.clientRequestId)).unique();
    if (previous) {
      if (previous.threadId !== args.threadId) throw new ConvexError({ code: "INVALID_REQUEST", message: "Please try sending again." });
      return previous._id;
    }
    const lockId = await reserveAgentCapacity(ctx, viewer._id, false);
    const { messageId, message } = await saveMessage(ctx, components.agent, { threadId: args.threadId, prompt: args.prompt.trim() });
    const requestId = await ctx.db.insert("agentRequests", {
      ownerId: viewer._id, kind: "private", conversationId: conversation._id, threadId: args.threadId,
      clientRequestId: args.clientRequestId, promptMessageId: messageId, promptOrder: message.order,
      status: "queued", attempt: 1, expiresAt: Date.now() + REQUEST_LEASE_MS,
    });
    await ctx.db.patch("agentLocks", lockId, { requestId });
    await ctx.db.patch("agentConversations", conversation._id, {
      lastRequestId: requestId, updatedAt: Date.now(),
      ...(conversation.lastRequestId ? {} : { title: args.prompt.trim().slice(0, 80) }),
    });
    await schedule(ctx, requestId, 1);
    return requestId;
  },
});
export const restart = internalMutation({
  args: { requestId: v.id("agentRequests") }, returns: v.null(),
  handler: async (ctx, { requestId }) => {
    const viewer = await requireViewer(ctx);
    const r = await ctx.db.get("agentRequests", requestId);
    if (!r || r.ownerId !== viewer._id || !r.conversationId) throw new ConvexError({ code: "NOT_FOUND", message: "Request not found." });
    const c = await ctx.db.get("agentConversations", r.conversationId);
    if (!canRetry(r.status, c?.lastRequestId === r._id)) throw new ConvexError({ code: "INVALID_RETRY", message: "Only the latest stopped or failed request can be retried." });
    const lockId = await reserveAgentCapacity(ctx, viewer._id, true);
    await ctx.db.patch("agentRequests", r._id, { status: "queued", error: undefined, attempt: r.attempt + 1, expiresAt: Date.now() + REQUEST_LEASE_MS });
    await ctx.db.patch("agentLocks", lockId, { requestId });
    await schedule(ctx, requestId, r.attempt + 1);
    return null;
  },
});
export const stop = mutation({
  args: { requestId: v.id("agentRequests") }, returns: v.null(),
  handler: async (ctx, { requestId }) => {
    const viewer = await requireViewer(ctx);
    const r = await ctx.db.get("agentRequests", requestId);
    if (!r || r.ownerId !== viewer._id) throw new ConvexError({ code: "NOT_FOUND", message: "Request not found." });
    if (!isActive(r.status)) return null;
    await abortStream(ctx, components.agent, { threadId: r.threadId, order: r.promptOrder, reason: "Stopped by owner" });
    if (r.status === "queued") await settle(ctx, r, "canceled");
    else await ctx.db.patch("agentRequests", r._id, { status: "stopping" });
    return null;
  },
});
async function settle(ctx: MutationCtx, r: Doc<"agentRequests">, status: "complete" | "failed" | "canceled", error?: { code: string; message: string }) {
  await ctx.db.patch("agentRequests", r._id, { status, error });
  const lock = await ctx.db.query("agentLocks").withIndex("by_ownerId", q => q.eq("ownerId", r.ownerId)).unique();
  if (lock?.requestId === r._id) await ctx.db.patch("agentLocks", lock._id, { requestId: undefined });
}
export const claim = internalMutation({
  args: { requestId: v.id("agentRequests"), attempt: v.number() },
  returns: v.union(v.object({ threadId: v.string(), promptMessageId: v.string(), clerkUserId: v.string() }), v.null()),
  handler: async (ctx, args) => {
    const r = await ctx.db.get("agentRequests", args.requestId);
    if (!r || r.attempt !== args.attempt || r.status !== "queued") return null;
    if (Date.now() >= r.expiresAt) { await settle(ctx, r, "failed", { code: "TIMEOUT", message: "This request timed out. Please retry." }); return null; }
    const owner = await ctx.db.get("users", r.ownerId);
    if (!owner) { await settle(ctx, r, "canceled"); return null; }
    await ctx.db.patch("agentRequests", r._id, { status: "running", expiresAt: Date.now() + REQUEST_LEASE_MS });
    await ctx.scheduler.runAfter(REQUEST_LEASE_MS, internal.agentRequests.expire, args);
    return { threadId: r.threadId, promptMessageId: r.promptMessageId, clerkUserId: owner.clerkUserId };
  },
});
export const running = internalQuery({
  args: { requestId: v.id("agentRequests"), attempt: v.number() }, returns: v.boolean(),
  handler: async (ctx, args) => {
    const r = await ctx.db.get("agentRequests", args.requestId);
    return !!r && r.attempt === args.attempt && r.status === "running";
  },
});
export const finish = internalMutation({
  args: { requestId: v.id("agentRequests"), attempt: v.number(), error: v.optional(errorValidator) }, returns: v.null(),
  handler: async (ctx, args) => {
    const r = await ctx.db.get("agentRequests", args.requestId);
    if (r && r.attempt === args.attempt && isActive(r.status)) await settle(ctx, r, r.status === "stopping" ? "canceled" : args.error ? "failed" : "complete", args.error);
    return null;
  },
});
export const expire = internalMutation({
  args: { requestId: v.id("agentRequests"), attempt: v.number() }, returns: v.null(),
  handler: async (ctx, args) => {
    const r = await ctx.db.get("agentRequests", args.requestId);
    if (r && r.attempt === args.attempt && isActive(r.status) && Date.now() >= r.expiresAt) {
      await abortStream(ctx, components.agent, { threadId: r.threadId, order: r.promptOrder, reason: "Request timed out" });
      await settle(ctx, r, r.status === "stopping" ? "canceled" : "failed", { code: "TIMEOUT", message: "This request timed out. Please retry." });
    }
    return null;
  },
});
