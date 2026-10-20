import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // One document per person who finished onboarding. Keyed on the verified
  // Clerk token identifier; email and billing data stay in Clerk.
  users: defineTable({
    tokenIdentifier: v.string(),
    clerkUserId: v.string(),
    handle: v.string(),
    handleLower: v.string(),
    displayName: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_handleLower", ["handleLower"]),
});
