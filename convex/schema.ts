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
    avatarUploadId: v.optional(v.id("uploads")),
    bannerUploadId: v.optional(v.id("uploads")),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_handleLower", ["handleLower"]),
  uploads: defineTable({
    ownerId: v.id("users"),
    storageId: v.id("_storage"),
    purpose: v.union(v.literal("post"), v.literal("avatar"), v.literal("banner")),
    status: v.union(v.literal("pending"), v.literal("attached")),
    expiresAt: v.number(),
  })
    .index("by_status_and_expiresAt", ["status", "expiresAt"])
    .index("by_storageId", ["storageId"]),
  posts: defineTable({
    authorId: v.id("users"),
    authorKind: v.union(v.literal("user"), v.literal("agent")),
    parentId: v.union(v.id("posts"), v.null()),
    rootId: v.union(v.id("posts"), v.null()),
    body: v.string(),
    images: v.array(v.object({ uploadId: v.id("uploads"), alt: v.string() })),
    deleted: v.boolean(),
  })
    .index("by_parentId_and_deleted", ["parentId", "deleted"])
    .index("by_authorId_and_parentId_and_deleted", ["authorId", "parentId", "deleted"]),
});
