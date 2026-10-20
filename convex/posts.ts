import { paginationOptsValidator, paginationResultValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { requireViewer } from "./lib/auth";
import { ALT_MAX, characterCount, postProblem } from "./lib/content";
import { attachUpload, releaseUpload, uploadUrl } from "./uploads";
import { publicProfileValidator, toPublicProfile } from "./users";

const imageInput = v.object({ uploadId: v.id("uploads"), alt: v.string() });
export const publicPostValidator = v.object({
  _id: v.id("posts"), _creationTime: v.number(),
  author: publicProfileValidator,
  authorKind: v.union(v.literal("user"), v.literal("agent")),
  body: v.string(), deleted: v.boolean(),
  images: v.array(v.object({ url: v.union(v.string(), v.null()), alt: v.string() })),
});

async function publicPost(ctx: QueryCtx, post: Doc<"posts">) {
  const author = await ctx.db.get("users", post.authorId);
  if (!author) throw new Error("Post author is missing.");
  return {
    _id: post._id, _creationTime: post._creationTime,
    author: await toPublicProfile(ctx, author), authorKind: post.authorKind,
    body: post.deleted ? "" : post.body, deleted: post.deleted,
    images: post.deleted ? [] : await Promise.all(post.images.map(async image => ({
      url: await uploadUrl(ctx, image.uploadId), alt: image.alt,
    }))),
  };
}

export const create = mutation({
  args: { body: v.string(), images: v.array(imageInput) },
  returns: v.id("posts"),
  handler: async (ctx, args) => {
    const viewer = await requireViewer(ctx);
    const body = args.body.trim();
    const problem = postProblem(body, args.images.length);
    if (problem) throw new ConvexError({ code: "INVALID_POST", message: problem });
    if (new Set(args.images.map(image => image.uploadId)).size !== args.images.length) {
      throw new ConvexError({ code: "DUPLICATE_IMAGE", message: "Each attachment must be a different upload." });
    }
    for (const image of args.images) {
      if (characterCount(image.alt.trim()) > ALT_MAX) throw new ConvexError({ code: "INVALID_ALT", message: "Keep image descriptions to 1,000 characters." });
      await attachUpload(ctx, image.uploadId, viewer._id, "post");
    }
    return await ctx.db.insert("posts", {
      authorId: viewer._id, authorKind: "user", parentId: null, rootId: null,
      body, images: args.images.map(image => ({ ...image, alt: image.alt.trim() })), deleted: false,
    });
  },
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(publicPostValidator),
  handler: async (ctx, args) => {
    const result = await ctx.db.query("posts")
      .withIndex("by_parentId_and_deleted", q => q.eq("parentId", null).eq("deleted", false))
      .order("desc").paginate(args.paginationOpts);
    return { ...result, page: await Promise.all(result.page.map(post => publicPost(ctx, post))) };
  },
});

export const byAuthor = query({
  args: { authorId: v.id("users"), paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(publicPostValidator),
  handler: async (ctx, args) => {
    const result = await ctx.db.query("posts")
      .withIndex("by_authorId_and_parentId_and_deleted", q => q.eq("authorId", args.authorId).eq("parentId", null).eq("deleted", false))
      .order("desc").paginate(args.paginationOpts);
    return { ...result, page: await Promise.all(result.page.map(post => publicPost(ctx, post))) };
  },
});

// The URL id is untrusted text; malformed ids are ordinary not-found results.
export const get = query({
  args: { id: v.string(), handle: v.string() },
  returns: v.union(publicPostValidator, v.null()),
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("posts", args.id);
    if (!id) return null;
    const post = await ctx.db.get("posts", id);
    if (!post) return null;
    const result = await publicPost(ctx, post);
    return result.author.handle.toLowerCase() === args.handle.toLowerCase() ? result : null;
  },
});

export const remove = mutation({
  args: { postId: v.id("posts") }, returns: v.null(),
  handler: async (ctx, args) => {
    const viewer = await requireViewer(ctx);
    const post = await ctx.db.get("posts", args.postId);
    if (!post || post.authorId !== viewer._id) throw new ConvexError({ code: "FORBIDDEN", message: "You can only delete your own posts." });
    if (post.deleted) return null;
    for (const image of post.images) await releaseUpload(ctx, image.uploadId);
    await ctx.db.patch("posts", post._id, { body: "", images: [], deleted: true });
    return null;
  },
});
