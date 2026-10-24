import { defineApp } from "convex/server";
import { v } from "convex/values";
import aggregate from "@convex-dev/aggregate/convex.config";
import agent from "@convex-dev/agent/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";

const app = defineApp({ env: { CLERK_SECRET_KEY: v.optional(v.string()), CLERK_WEBHOOK_SIGNING_SECRET: v.optional(v.string()), OPENROUTER_API_KEY: v.optional(v.string()), OPENROUTER_MODEL: v.optional(v.string()) } });
app.use(agent);
app.use(rateLimiter);
// Per-post like counts, kept in step with the `likes` table.
app.use(aggregate, { name: "likeCounts" });
// Per-user follower and following counts, kept in step with the `follows` table.
app.use(aggregate, { name: "followerCounts" });
app.use(aggregate, { name: "followingCounts" });
export default app;
