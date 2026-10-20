import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { IMAGE_BYTES_MAX, imageBytesMatch, imageProblem } from "./lib/content";
import type { UploadPurpose } from "./uploads";

const http = httpRouter();
// Bearer-token requests, no cookies or credentialed CORS. Convex validates
// Clerk's JWT and propagates that identity to the internal functions.
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Cache-Control": "no-store",
};

http.route({ path: "/images/upload", method: "OPTIONS", handler: httpAction(async () => new Response(null, { status: 204, headers: cors })) });
http.route({ path: "/images/upload", method: "POST", handler: httpAction(async (ctx, request) => {
  const fail = (message: string, status = 400) => Response.json({ message }, { status, headers: cors });
  if (!(await ctx.auth.getUserIdentity())) return fail("Sign in to upload an image.", 401);
  try { await ctx.runQuery(internal.uploads.uploadViewer, {}); }
  catch { return fail("Finish setting up your profile first.", 403); }
  const purpose = new URL(request.url).searchParams.get("purpose");
  if (purpose !== "post" && purpose !== "avatar" && purpose !== "banner") return fail("Choose an image destination.");
  const type = request.headers.get("Content-Type") ?? "";
  const headerProblem = imageProblem(type, 1);
  if (headerProblem) return fail(headerProblem);
  if (Number(request.headers.get("Content-Length")) > IMAGE_BYTES_MAX) return fail("Each image must be 5 MB or smaller.", 413);
  if (!request.body) return fail("This image is empty.");
  const reader = request.body.getReader();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > IMAGE_BYTES_MAX) { await reader.cancel(); return fail("Each image must be 5 MB or smaller.", 413); }
      chunks.push(new Uint8Array(value));
    }
  } catch { return fail("The upload was interrupted. Please try again."); }
  const problem = imageProblem(type, size);
  if (problem) return fail(problem);
  const blob = new Blob(chunks, { type });
  if (!imageBytesMatch(type, new Uint8Array(await blob.arrayBuffer()))) return fail("The file doesn't match its image type.");
  const storageId = await ctx.storage.store(blob);
  try {
    const uploadId = await ctx.runMutation(internal.uploads.register, { storageId, purpose: purpose as UploadPurpose });
    return Response.json({ uploadId }, { headers: cors });
  } catch {
    await ctx.storage.delete(storageId);
    return fail("Couldn't save this image. Please try again.", 500);
  }
}) });

export default http;
