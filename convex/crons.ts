import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.interval("clean abandoned image uploads", { minutes: 15 }, internal.uploads.cleanup, {});
export default crons;
