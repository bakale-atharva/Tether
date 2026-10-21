import { paginationOptsValidator, paginationResultValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireViewer } from "./lib/auth";
import { publicPost, publicPostValidator } from "./posts";

// Bookmarks are keyed on the verified viewer, so neither function accepts a
// user id: nobody can read or change another person's saves.
export const set = mutation({
  args: { postId: v.id("posts"), bookmarked: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const viewer = await requireViewer(ctx);
    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_userId_and_postId", (q) => q.eq("userId", viewer._id).eq("postId", args.postId))
      .unique();

    if (!args.bookmarked) {
      // Removal works even after the post is deleted, to clear placeholders.
      if (existing) await ctx.db.delete("bookmarks", existing._id);
      return null;
    }
    if (existing) return null;
    const post = await ctx.db.get("posts", args.postId);
    if (!post || post.deleted) {
      throw new ConvexError({ code: "CONTENT_UNAVAILABLE", message: "This post was deleted, so it can't be saved." });
    }
    if (post.parentId !== null) {
      throw new ConvexError({ code: "NOT_BOOKMARKABLE", message: "Only posts can be bookmarked, not replies." });
    }
    await ctx.db.insert("bookmarks", { userId: viewer._id, postId: post._id });
    return null;
  },
});

// The viewer's saved posts, most recently saved first. Deleted posts stay as
// placeholders so they can be removed from the list.
export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(v.object({ _id: v.id("bookmarks"), post: publicPostValidator })),
  handler: async (ctx, args) => {
    const viewer = await requireViewer(ctx);
    const result = await ctx.db
      .query("bookmarks")
      .withIndex("by_userId", (q) => q.eq("userId", viewer._id))
      .order("desc")
      .paginate(args.paginationOpts);
    const page = [];
    for (const bookmark of result.page) {
      const post = await ctx.db.get("posts", bookmark.postId);
      if (post) page.push({ _id: bookmark._id, post: await publicPost(ctx, post) });
    }
    return { ...result, page };
  },
});
