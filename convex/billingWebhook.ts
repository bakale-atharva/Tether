import { verifyWebhook } from "@clerk/backend/webhooks";
import { httpAction, env } from "./_generated/server";
import { internal } from "./_generated/api";
import { billingEventUser, readAuthoritativeSubscription } from "./lib/billing";

export const clerkBilling = httpAction(async (ctx, request) => {
  if (!env.CLERK_WEBHOOK_SIGNING_SECRET || !env.CLERK_SECRET_KEY) return new Response("Billing is not configured", { status: 503 });
  let event;
  try {
    event = await verifyWebhook(request, { signingSecret: env.CLERK_WEBHOOK_SIGNING_SECRET });
  } catch { return new Response("Invalid signature", { status: 400 }); }
  const clerkUserId = billingEventUser(event);
  if (!clerkUserId) return new Response("Ignored", { status: 200 });
  const eventId = request.headers.get("svix-id");
  if (!eventId) return new Response("Missing event id", { status: 400 });
  if (await ctx.runQuery(internal.billing.seenEvent, { eventId })) return new Response("Already processed", { status: 200 });
  const summary = await readAuthoritativeSubscription(clerkUserId, env.CLERK_SECRET_KEY);
  // Do not acknowledge an outage: Clerk retries the event. Never persist a
  // temporary lookup failure over a valid subscription snapshot.
  if (!summary.verified) return new Response("Subscription lookup failed; retry delivery", { status: 503 });
  await ctx.runMutation(internal.billing.sync, { eventId, eventType: event.type, clerkUserId, summary });
  return new Response("Synced", { status: 200 });
});
