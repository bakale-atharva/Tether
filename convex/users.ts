import { ConvexError, v, type Infer } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query, type QueryCtx, type MutationCtx } from "./_generated/server";
import { getViewer, requireIdentity, requireViewer } from "./lib/auth";
import { bioProblem } from "./lib/content";
import { attachUpload, releaseUpload, uploadUrl } from "./uploads";
import {
  HANDLE_PROBLEM_MESSAGES,
  displayNameProblem,
  handleProblem,
  normalizeHandle,
  suggestHandle,
} from "./lib/handles";

// The only user shape that leaves the backend. No email, no billing data.
export const publicProfileValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  handle: v.string(),
  displayName: v.string(),
  bio: v.union(v.string(), v.null()),
  avatarUrl: v.union(v.string(), v.null()),
  bannerUrl: v.union(v.string(), v.null()),
});

export type PublicProfile = Infer<typeof publicProfileValidator>;

export async function toPublicProfile(ctx: QueryCtx | MutationCtx, user: Doc<"users">) {
  return {
    _id: user._id,
    _creationTime: user._creationTime,
    handle: user.handle,
    displayName: user.displayName,
    bio: user.bio ?? null,
    avatarUrl: await uploadUrl(ctx, user.avatarUploadId) ?? user.avatarUrl ?? null,
    bannerUrl: await uploadUrl(ctx, user.bannerUploadId),
  };
}

// Drives client routing: signed out, signed in but not onboarded, or ready.
export const viewer = query({
  args: {},
  returns: v.union(
    v.object({ status: v.literal("signedOut") }),
    v.object({
      status: v.literal("needsOnboarding"),
      suggestedDisplayName: v.string(),
      suggestedHandle: v.string(),
    }),
    v.object({ status: v.literal("ready"), profile: publicProfileValidator }),
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) return { status: "signedOut" as const };

    const user = await getViewer(ctx);
    if (user !== null) {
      return { status: "ready" as const, profile: await toPublicProfile(ctx, user) };
    }

    const name =
      identity.name ??
      [identity.givenName, identity.familyName].filter(Boolean).join(" ");
    return {
      status: "needsOnboarding" as const,
      suggestedDisplayName: name.trim().slice(0, 50),
      suggestedHandle: suggestHandle(identity.nickname ?? name),
    };
  },
});

export const checkHandle = query({
  args: { handle: v.string() },
  returns: v.object({
    available: v.boolean(),
    message: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const handle = normalizeHandle(args.handle);
    const problem = handleProblem(handle);
    if (problem !== null) {
      return { available: false, message: HANDLE_PROBLEM_MESSAGES[problem] };
    }
    const existing = await ctx.db
      .query("users")
      .withIndex("by_handleLower", (q) => q.eq("handleLower", handle.toLowerCase()))
      .unique();
    if (existing === null) return { available: true, message: null };

    // The viewer's own handle counts as available to them.
    const identity = await ctx.auth.getUserIdentity();
    if (identity !== null && existing.tokenIdentifier === identity.tokenIdentifier) {
      return { available: true, message: null };
    }
    return { available: false, message: HANDLE_PROBLEM_MESSAGES.taken };
  },
});

export const completeOnboarding = mutation({
  args: { handle: v.string(), displayName: v.string() },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const handle = normalizeHandle(args.handle);
    const displayName = args.displayName.trim();
    const handleLower = handle.toLowerCase();

    const problem = handleProblem(handle);
    if (problem !== null) {
      throw new ConvexError({
        code: "INVALID_HANDLE",
        message: HANDLE_PROBLEM_MESSAGES[problem],
      });
    }
    const nameProblem = displayNameProblem(displayName);
    if (nameProblem !== null) {
      throw new ConvexError({ code: "INVALID_DISPLAY_NAME", message: nameProblem });
    }

    const existing = await getViewer(ctx);
    if (existing !== null) {
      // Idempotent for retries of the same submission.
      if (existing.handleLower === handleLower) return existing._id;
      throw new ConvexError({
        code: "ALREADY_ONBOARDED",
        message: "Your profile is already set up.",
      });
    }

    // Mutations are serializable, so this check-then-insert cannot race into
    // two users holding the same handle.
    const taken = await ctx.db
      .query("users")
      .withIndex("by_handleLower", (q) => q.eq("handleLower", handleLower))
      .unique();
    if (taken !== null) {
      throw new ConvexError({
        code: "HANDLE_TAKEN",
        message: HANDLE_PROBLEM_MESSAGES.taken,
      });
    }

    return await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      clerkUserId: identity.subject,
      handle,
      handleLower,
      displayName,
    });
  },
});

export const getByHandle = query({
  args: { handle: v.string() },
  returns: v.union(publicProfileValidator, v.null()),
  handler: async (ctx, args) => {
    const handleLower = normalizeHandle(args.handle).toLowerCase();
    if (handleLower.length === 0) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_handleLower", (q) => q.eq("handleLower", handleLower))
      .unique();
    return user === null ? null : await toPublicProfile(ctx, user);
  },
});

// No target user argument: a caller can edit only their verified profile.
export const updateProfile = mutation({
  args: {
    displayName: v.string(), bio: v.string(),
    avatarUploadId: v.optional(v.union(v.id("uploads"), v.null())),
    bannerUploadId: v.optional(v.union(v.id("uploads"), v.null())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const viewer = await requireViewer(ctx);
    const name = args.displayName.trim();
    const bio = args.bio.trim();
    const problem = displayNameProblem(name) ?? bioProblem(bio);
    if (problem) throw new ConvexError({ code: "INVALID_PROFILE", message: problem });
    const patch: Partial<Doc<"users">> = { displayName: name, bio };
    for (const purpose of ["avatar", "banner"] as const) {
      const key = purpose === "avatar" ? "avatarUploadId" : "bannerUploadId";
      const next = args[key];
      if (next === undefined) continue;
      if (next !== null) await attachUpload(ctx, next, viewer._id, purpose);
      const old = viewer[key];
      if (old) await releaseUpload(ctx, old);
      patch[key] = next ?? undefined;
      if (purpose === "avatar") patch.avatarUrl = undefined;
    }
    await ctx.db.patch("users", viewer._id, patch);
    return null;
  },
});
