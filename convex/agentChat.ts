import { createThread, listUIMessages, syncStreams, vStreamArgs, vStreamMessagesReturnValue } from "@convex-dev/agent";
import { paginationOptsValidator, paginationResultValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { components } from "./_generated/api";
import { requireViewer } from "./lib/auth";
import { ownedConversation } from "./lib/agentAccess";
import { titleProblem } from "./lib/agentPolicy";

const conversationView = v.object({ threadId: v.string(), title: v.string(), updatedAt: v.number() });
export const list = query({
  args: { paginationOpts: paginationOptsValidator }, returns: paginationResultValidator(conversationView),
  handler: async (ctx, args) => {
    const viewer = await requireViewer(ctx);
    const result = await ctx.db.query("agentConversations").withIndex("by_ownerId_and_updatedAt", q => q.eq("ownerId", viewer._id)).order("desc").paginate(args.paginationOpts);
    return { ...result, page: result.page.map(({ threadId, title, updatedAt }) => ({ threadId, title, updatedAt })) };
  },
});
export const create = mutation({
  args: {}, returns: v.string(),
  handler: async ctx => {
    const viewer = await requireViewer(ctx);
    const threadId = await createThread(ctx, components.agent, { userId: viewer._id });
    await ctx.db.insert("agentConversations", { ownerId: viewer._id, threadId, title: "New conversation", updatedAt: Date.now() });
    return threadId;
  },
});
export const rename = mutation({
  args: { threadId: v.string(), title: v.string() }, returns: v.null(),
  handler: async (ctx, args) => {
    const { conversation } = await ownedConversation(ctx, args.threadId);
    const problem = titleProblem(args.title);
    if (problem) throw new ConvexError({ code: "INVALID_TITLE", message: problem });
    await ctx.db.patch("agentConversations", conversation._id, { title: args.title.trim(), updatedAt: Date.now() });
    return null;
  },
});
export const detail = query({
  args: { threadId: v.string() }, returns: v.union(conversationView, v.null()),
  handler: async (ctx, { threadId }) => {
    const viewer = await requireViewer(ctx);
    const c = await ctx.db.query("agentConversations").withIndex("by_threadId", q => q.eq("threadId", threadId)).unique();
    return c?.ownerId === viewer._id ? { threadId, title: c.title, updatedAt: c.updatedAt } : null;
  },
});
const uiMessage = v.object({
  key: v.string(), text: v.string(), role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
  status: v.union(v.literal("pending"), v.literal("success"), v.literal("failed"), v.literal("streaming")),
  order: v.number(), stepOrder: v.number(),
  parts: v.array(v.object({ type: v.literal("text"), text: v.string() })),
});
export const messages = query({
  args: { threadId: v.string(), paginationOpts: paginationOptsValidator, streamArgs: vStreamArgs },
  returns: v.object({ ...paginationResultValidator(uiMessage).fields, streams: vStreamMessagesReturnValue.fields.streams }),
  handler: async (ctx, args) => {
    await ownedConversation(ctx, args.threadId);
    const result = await listUIMessages(ctx, components.agent, args);
    const streams = await syncStreams(ctx, components.agent, args);
    return { ...result, page: result.page.map(m => ({
      key: m.key, text: m.text, role: m.role, status: m.status, order: m.order, stepOrder: m.stepOrder,
      parts: [{ type: "text" as const, text: m.text }],
    })), streams };
  },
});
