import { defineApp } from "convex/server";
import aggregate from "@convex-dev/aggregate/convex.config";

const app = defineApp();
// Per-post like counts, kept in step with the `likes` table.
app.use(aggregate, { name: "likeCounts" });
// Per-user follower and following counts, kept in step with the `follows` table.
app.use(aggregate, { name: "followerCounts" });
app.use(aggregate, { name: "followingCounts" });
export default app;
