import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireViewer } from "./lib/auth";
import { nextLikeCount } from "./lib/content";

// Sets the viewer's like to the requested state rather than toggling it, so a
// retried or duplicated request can never flip the like back. The row and the
// post's count change in one serializable transaction.
export const set = mutation({
  args: { postId: v.id("posts"), liked: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const viewer = await requireViewer(ctx);
    const post = await ctx.db.get("posts", args.postId);
    if (!post) throw new ConvexError({ code: "NOT_FOUND", message: "This message no longer exists." });

    const existing = await ctx.db
      .query("likes")
      .withIndex("by_userId_and_postId", (q) => q.eq("userId", viewer._id).eq("postId", post._id))
      .unique();
    const wasLiked = existing !== null;
    if (wasLiked === args.liked) return null;

    if (args.liked) {
      if (post.deleted) {
        throw new ConvexError({ code: "CONTENT_UNAVAILABLE", message: "This message was deleted, so it can't be liked." });
      }
      await ctx.db.insert("likes", { userId: viewer._id, postId: post._id });
    } else if (existing) {
      // Unliking stays possible after deletion so nobody is stuck with a like.
      await ctx.db.delete("likes", existing._id);
    }
    await ctx.db.patch("posts", post._id, { likeCount: nextLikeCount(post.likeCount ?? 0, wasLiked, args.liked) });
    return null;
  },
});
