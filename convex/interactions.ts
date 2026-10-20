import { v, type Infer } from "convex/values";
import { query } from "./_generated/server";
import { getViewer } from "./lib/auth";

export const interactionStateValidator = v.object({
  likeCount: v.number(),
  liked: v.boolean(),
  bookmarked: v.boolean(),
});

export type InteractionState = Infer<typeof interactionStateValidator>;

// One message's like count plus the viewer's own like and bookmark. Visitors
// get counts with both flags false; nobody learns another person's choices.
// Cards read this per message so optimistic updates can target it directly.
export const viewerState = query({
  args: { postId: v.id("posts") },
  returns: interactionStateValidator,
  handler: async (ctx, args) => {
    const post = await ctx.db.get("posts", args.postId);
    const likeCount = post && !post.deleted ? post.likeCount ?? 0 : 0;
    const viewer = await getViewer(ctx);
    if (!viewer) return { likeCount, liked: false, bookmarked: false };

    const like = await ctx.db
      .query("likes")
      .withIndex("by_userId_and_postId", (q) => q.eq("userId", viewer._id).eq("postId", args.postId))
      .unique();
    const bookmark = await ctx.db
      .query("bookmarks")
      .withIndex("by_userId_and_postId", (q) => q.eq("userId", viewer._id).eq("postId", args.postId))
      .unique();
    return { likeCount, liked: like !== null, bookmarked: bookmark !== null };
  },
});
