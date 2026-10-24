"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { privateAgent } from "./lib/agent";
import { GENERATION_TIMEOUT_MS, requestFailure } from "./lib/agentPolicy";

export const run = internalAction({
  args: { requestId: v.id("agentRequests"), attempt: v.number() }, returns: v.null(),
  handler: async (ctx, args) => {
    const job = await ctx.runMutation(internal.agentRequests.claim, args);
    if (!job) return null;
    try {
      // Background actions have no end-user auth. Use only the claimed owner's id.
      await ctx.runAction(internal.billing.requirePro, { clerkUserId: job.clerkUserId });
      if (!await ctx.runQuery(internal.agentRequests.running, args)) {
        await ctx.runMutation(internal.agentRequests.finish, args);
        return null;
      }
      const abort = new AbortController();
      let streamError: unknown;
      let lastCheck = 0;
      const result = await privateAgent().streamText(ctx, { threadId: job.threadId }, {
        promptMessageId: job.promptMessageId, maxOutputTokens: 2048, maxRetries: 0,
        abortSignal: AbortSignal.any([abort.signal, AbortSignal.timeout(GENERATION_TIMEOUT_MS)]),
        onChunk: async () => {
          if (Date.now() - lastCheck < 500) return;
          lastCheck = Date.now();
          if (!await ctx.runQuery(internal.agentRequests.running, args)) abort.abort();
        },
        onError: ({ error }) => { streamError = error; },
      }, { saveStreamDeltas: { throttleMs: 150 } });
      await result.consumeStream();
      if (streamError) throw streamError;
      if (!await result.text) throw new Error("Empty response");
      await ctx.runMutation(internal.agentRequests.finish, args);
    } catch (error) {
      await ctx.runMutation(internal.agentRequests.finish, { ...args, error: requestFailure(error) });
    }
    return null;
  },
});
