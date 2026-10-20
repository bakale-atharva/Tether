import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { env, internalMutation, internalQuery, mutation, type MutationCtx, type QueryCtx } from "./_generated/server";
import { requireViewer } from "./lib/auth";
import { imageProblem } from "./lib/content";

export const uploadPurpose = v.union(v.literal("post"), v.literal("avatar"), v.literal("banner"));
export type UploadPurpose = "post" | "avatar" | "banner";

// The endpoint authenticates the actual upload, not just URL issuance. The
// client never registers arbitrary storage IDs or chooses the owner.
export const getUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireViewer(ctx);
    return `${env.CONVEX_SITE_URL}/images/upload`;
  },
});

export const uploadViewer = internalQuery({
  args: {},
  returns: v.id("users"),
  handler: async (ctx) => (await requireViewer(ctx))._id,
});

export const register = internalMutation({
  args: { storageId: v.id("_storage"), purpose: uploadPurpose },
  returns: v.id("uploads"),
  handler: async (ctx, args) => {
    const owner = await requireViewer(ctx);
    const metadata = await ctx.db.system.get("_storage", args.storageId);
    const problem = metadata === null ? "Image upload was not found." : imageProblem(metadata.contentType ?? "", metadata.size);
    if (problem) throw new ConvexError({ code: "INVALID_IMAGE", message: problem });
    const existing = await ctx.db.query("uploads").withIndex("by_storageId", q => q.eq("storageId", args.storageId)).unique();
    if (existing) throw new ConvexError({ code: "DUPLICATE_UPLOAD", message: "This image is already registered." });
    return await ctx.db.insert("uploads", {
      ownerId: owner._id, storageId: args.storageId, purpose: args.purpose,
      status: "pending", expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
  },
});

export async function attachUpload(ctx: MutationCtx, id: Id<"uploads">, ownerId: Id<"users">, purpose: UploadPurpose) {
  const upload = await ctx.db.get("uploads", id);
  if (!upload || upload.ownerId !== ownerId || upload.purpose !== purpose || upload.status !== "pending" || upload.expiresAt <= Date.now()) {
    throw new ConvexError({ code: "INVALID_UPLOAD", message: "This image isn't available. Upload it again." });
  }
  const metadata = await ctx.db.system.get("_storage", upload.storageId);
  if (!metadata || imageProblem(metadata.contentType ?? "", metadata.size)) {
    throw new ConvexError({ code: "INVALID_IMAGE", message: "This image is no longer available." });
  }
  await ctx.db.patch("uploads", id, { status: "attached" });
}

export async function releaseUpload(ctx: MutationCtx, id: Id<"uploads">) {
  const upload = await ctx.db.get("uploads", id);
  if (upload) {
    await ctx.storage.delete(upload.storageId);
    await ctx.db.delete("uploads", id);
  }
}

export async function uploadUrl(ctx: QueryCtx | MutationCtx, id: Id<"uploads"> | undefined): Promise<string | null> {
  if (!id) return null;
  const upload = await ctx.db.get("uploads", id);
  return upload?.status === "attached" ? await ctx.storage.getUrl(upload.storageId) : null;
}

export const discard = mutation({
  args: { uploadId: v.id("uploads") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const viewer = await requireViewer(ctx);
    const upload = await ctx.db.get("uploads", args.uploadId);
    if (!upload) return null;
    if (upload.ownerId !== viewer._id || upload.status !== "pending") {
      throw new ConvexError({ code: "FORBIDDEN", message: "You can't discard this image." });
    }
    await releaseUpload(ctx, upload._id);
    return null;
  },
});

export const cleanup = internalMutation({
  args: {}, returns: v.number(),
  handler: async (ctx) => {
    const expired = await ctx.db.query("uploads")
      .withIndex("by_status_and_expiresAt", q => q.eq("status", "pending").lte("expiresAt", Date.now()))
      .take(100);
    for (const upload of expired) await releaseUpload(ctx, upload._id);
    return expired.length;
  },
});
