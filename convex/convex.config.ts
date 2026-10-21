import { defineApp } from "convex/server";
import aggregate from "@convex-dev/aggregate/convex.config";

const app = defineApp();
// Per-post like counts, kept in step with the `likes` table.
app.use(aggregate, { name: "likeCounts" });
export default app;
