import { defineApp } from "convex/server";
import { v } from "convex/values";
import aggregate from "@convex-dev/aggregate/convex.config";

const app = defineApp({ env: { CLERK_SECRET_KEY: v.optional(v.string()), CLERK_WEBHOOK_SIGNING_SECRET: v.optional(v.string()) } });
// Per-post like counts, kept in step with the `likes` table.
app.use(aggregate, { name: "likeCounts" });
// Per-user follower and following counts, kept in step with the `follows` table.
app.use(aggregate, { name: "followerCounts" });
app.use(aggregate, { name: "followingCounts" });
export default app;
