import { paginationOptsValidator, paginationResultValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireViewer } from "./lib/auth";
import { ANCESTOR_LIMIT, isVisibleInConversation, replyProblem } from "./lib/content";
import { publicPost, publicPostValidator } from "./posts";

// The client names only the message it replies to. The conversation root and
// author come from the database and verified identity, never from arguments.
export const create = mutation({
  args: { parentId: v.id("posts"), body: v.string() },
  returns: v.id("posts"),
  handler: async (ctx, args) => {
    const viewer = await requireViewer(ctx);
    const body = args.body.trim();
    const problem = replyProblem(body);
    if (problem) throw new ConvexError({ code: "INVALID_REPLY", message: problem });

    const parent = await ctx.db.get("posts", args.parentId);
    if (!parent || parent.deleted) {
      throw new ConvexError({
        code: "PARENT_UNAVAILABLE",
        message: "This message was deleted, so it can't receive replies.",
      });
    }

    const replyId = await ctx.db.insert("posts", {
      authorId: viewer._id,
      authorKind: "user",
      parentId: parent._id,
      rootId: parent.rootId ?? parent._id,
      body,
      images: [],
      deleted: false,
      replyCount: 0,
      childCount: 0,
      likeCount: 0,
    });
    // Serializable mutations keep both counters exact under concurrent replies.
    await ctx.db.patch("posts", parent._id, {
      replyCount: (parent.replyCount ?? 0) + 1,
      childCount: (parent.childCount ?? 0) + 1,
    });
    return replyId;
  },
});

// Direct replies to one message, oldest first. Deleted replies without their
// own replies are dropped, so a page can hold fewer than `numItems` entries.
export const list = query({
  args: { parentId: v.id("posts"), paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(publicPostValidator),
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("posts")
      .withIndex("by_parentId", (q) => q.eq("parentId", args.parentId))
      .order("asc")
      .paginate(args.paginationOpts);
    const visible = result.page.filter(isVisibleInConversation);
    return { ...result, page: await Promise.all(visible.map((post) => publicPost(ctx, post))) };
  },
});

// The chain from the conversation root down to (not including) the message.
export const ancestors = query({
  args: { postId: v.id("posts") },
  returns: v.object({
    posts: v.array(publicPostValidator),
    truncated: v.boolean(),
    // Present only when the chain was cut short, so the UI can link to the start.
    root: v.union(publicPostValidator, v.null()),
  }),
  handler: async (ctx, args) => {
    const post = await ctx.db.get("posts", args.postId);
    if (!post) return { posts: [], truncated: false, root: null };

    const chain = [];
    let parentId = post.parentId;
    while (parentId !== null && chain.length < ANCESTOR_LIMIT) {
      const parent = await ctx.db.get("posts", parentId);
      if (!parent) {
        parentId = null;
        break;
      }
      chain.push(parent);
      parentId = parent.parentId;
    }
    chain.reverse();
    const truncated = parentId !== null;
    const root = truncated && post.rootId ? await ctx.db.get("posts", post.rootId) : null;
    return {
      posts: await Promise.all(chain.map((ancestor) => publicPost(ctx, ancestor))),
      truncated,
      root: root ? await publicPost(ctx, root) : null,
    };
  },
});
