import { paginationOptsValidator, paginationResultValidator } from "convex/server";
import { ConvexError, v, type Infer } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { followerCounts, followingCounts } from "./lib/aggregates";
import { getViewer, requireViewer } from "./lib/auth";
import { FOLLOWING_MAX } from "./lib/content";
import { AGENT_HANDLE } from "./lib/handles";
import { publicProfileValidator, toPublicProfile } from "./users";

export const followStateValidator = v.object({
  followerCount: v.number(),
  followingCount: v.number(),
  following: v.boolean(),
});

export type FollowState = Infer<typeof followStateValidator>;

// Sets the viewer's follow to the requested state rather than toggling it, so a
// retried or duplicated request can never flip it back. The follower always
// comes from the verified identity; the row and both counts change in one
// serializable transaction, so concurrent requests leave one row or none.
export const set = mutation({
  args: { userId: v.id("users"), following: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const viewer = await requireViewer(ctx);
    const existing = await findFollow(ctx, viewer._id, args.userId);

    if (!args.following) {
      if (existing) {
        await ctx.db.delete("follows", existing._id);
        await followerCounts.delete(ctx, existing);
        await followingCounts.delete(ctx, existing);
      }
      return null;
    }
    if (existing) return null;

    const target = await ctx.db.get("users", args.userId);
    if (!target) throw new ConvexError({ code: "NOT_FOUND", message: "This account doesn't exist." });
    if (target._id === viewer._id) {
      throw new ConvexError({ code: "CANNOT_FOLLOW_SELF", message: "You can't follow yourself." });
    }
    if (target.handleLower === AGENT_HANDLE) {
      throw new ConvexError({ code: "CANNOT_FOLLOW_AGENT", message: "Tether can't be followed." });
    }
    if (await followingCounts.count(ctx, { namespace: viewer._id }) >= FOLLOWING_MAX) {
      throw new ConvexError({
        code: "FOLLOWING_LIMIT",
        message: `You can follow up to ${FOLLOWING_MAX} accounts. Unfollow someone first.`,
      });
    }

    const followId = await ctx.db.insert("follows", { followerId: viewer._id, followeeId: target._id });
    const follow = await ctx.db.get("follows", followId);
    if (follow) {
      await followerCounts.insert(ctx, follow);
      await followingCounts.insert(ctx, follow);
    }
    return null;
  },
});

// One account's counts plus whether the viewer follows it. Visitors get the
// counts with `following` false. Profiles and list rows read this per account
// so optimistic updates can target it directly.
export const state = query({
  args: { userId: v.id("users") },
  returns: followStateValidator,
  handler: async (ctx, args) => {
    const followerCount = await followerCounts.count(ctx, { namespace: args.userId });
    const followingCount = await followingCounts.count(ctx, { namespace: args.userId });
    const viewer = await getViewer(ctx);
    const following = viewer ? (await findFollow(ctx, viewer._id, args.userId)) !== null : false;
    return { followerCount, followingCount, following };
  },
});

const followRowValidator = v.object({ _id: v.id("follows"), profile: publicProfileValidator });

// Who follows `userId`, most recent first.
export const followers = query({
  args: { userId: v.id("users"), paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(followRowValidator),
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("follows")
      .withIndex("by_followeeId", (q) => q.eq("followeeId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts);
    return { ...result, page: await profileRows(ctx, result.page, (follow) => follow.followerId) };
  },
});

// Who `userId` follows, most recent first.
export const following = query({
  args: { userId: v.id("users"), paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(followRowValidator),
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("follows")
      .withIndex("by_followerId", (q) => q.eq("followerId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts);
    return { ...result, page: await profileRows(ctx, result.page, (follow) => follow.followeeId) };
  },
});

async function findFollow(ctx: QueryCtx, followerId: Id<"users">, followeeId: Id<"users">) {
  return await ctx.db
    .query("follows")
    .withIndex("by_followerId_and_followeeId", (q) => q.eq("followerId", followerId).eq("followeeId", followeeId))
    .unique();
}

async function profileRows(ctx: QueryCtx, follows: Doc<"follows">[], pick: (follow: Doc<"follows">) => Id<"users">) {
  const rows = [];
  for (const follow of follows) {
    const user = await ctx.db.get("users", pick(follow));
    if (user) rows.push({ _id: follow._id, profile: await toPublicProfile(ctx, user) });
  }
  return rows;
}
