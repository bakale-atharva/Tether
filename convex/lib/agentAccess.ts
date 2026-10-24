import { ConvexError } from "convex/values";
import type { QueryCtx, MutationCtx } from "../_generated/server";
import { requireViewer } from "./auth";

export async function ownedConversation(ctx: QueryCtx | MutationCtx, threadId: string) {
  const viewer = await requireViewer(ctx);
  const conversation = await ctx.db.query("agentConversations").withIndex("by_threadId", q => q.eq("threadId", threadId)).unique();
  if (!conversation || conversation.ownerId !== viewer._id) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Conversation not found." });
  }
  return { viewer, conversation };
}
