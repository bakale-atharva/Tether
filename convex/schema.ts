import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Private display cache only. Live Clerk reads authorize every generation.
  billingSubscriptions: defineTable({
    clerkUserId: v.string(),
    summary: v.object({
      allowed: v.boolean(), verified: v.boolean(), plan: v.union(v.literal("free"), v.literal("pro")),
      status: v.string(), accessUntil: v.union(v.number(), v.null()), canceled: v.boolean(), sourceUpdatedAt: v.number(),
    }),
  }).index("by_clerkUserId", ["clerkUserId"]),
  billingEvents: defineTable({
    eventId: v.string(), eventType: v.string(), receivedAt: v.number(),
  }).index("by_eventId", ["eventId"]),
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
    // Undeleted direct replies, shown on cards. Optional: posts created before
    // conversations existed have no replies (read as 0).
    replyCount: v.optional(v.number()),
    // Every direct reply ever created, deleted or not. A deleted post keeps a
    // placeholder in its conversation while this is above zero.
    childCount: v.optional(v.number()),
  })
    .index("by_parentId", ["parentId"])
    .index("by_rootId", ["rootId"])
    .index("by_parentId_and_deleted", ["parentId", "deleted"])
    .index("by_authorId_and_parentId_and_deleted", ["authorId", "parentId", "deleted"])
    .searchIndex("search_body", {
      searchField: "body",
      filterFields: ["parentId", "deleted"],
    }),
  // One row per (user, message). Who liked what is never exposed; counts come
  // from the likeCounts aggregate (convex/lib/aggregates.ts).
  likes: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
  })
    .index("by_userId_and_postId", ["userId", "postId"])
    .index("by_postId", ["postId"]),
  // Private saves of top-level posts, readable only by their owner.
  bookmarks: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
  })
    .index("by_userId_and_postId", ["userId", "postId"])
    .index("by_userId", ["userId"]),
  // One row per (follower, followee). Public, like the lists built from it;
  // counts come from the followerCounts/followingCounts aggregates.
  follows: defineTable({
    followerId: v.id("users"),
    followeeId: v.id("users"),
  })
    .index("by_followerId_and_followeeId", ["followerId", "followeeId"])
    .index("by_followerId", ["followerId"])
    .index("by_followeeId", ["followeeId"]),
});
