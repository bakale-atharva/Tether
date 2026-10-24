import { createClerkClient } from "@clerk/backend";

// Clerk Billing SDK resources use camelCase fields and millisecond timestamps.
// Keep this policy independent of session claims, metadata, and the webhook
// cache. Unknown values deny access.
export type Entitlement = {
  allowed: boolean;
  verified: boolean;
  plan: "free" | "pro";
  status: string;
  accessUntil: number | null;
  canceled: boolean;
  sourceUpdatedAt: number;
};
// SDK resources are class instances; accept objects while keeping every field
// unknown until its individual runtime check below. Arrays are not records.
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
const record = (value: unknown): Record<string, unknown> => isRecord(value) ? value : {};
const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
export const unavailable = (): Entitlement => ({ allowed: false, verified: false, plan: "free", status: "unavailable", accessUntil: null, canceled: false, sourceUpdatedAt: 0 });

export function agentEntitlement(value: unknown, now: number): Entitlement {
  const subscription = record(value);
  if (typeof subscription.id !== "string" || !finite(subscription.updatedAt) || !Array.isArray(subscription.subscriptionItems) || typeof subscription.status !== "string") return unavailable();
  const items = subscription.subscriptionItems.map(record);
  const sourceUpdatedAt = Math.max(subscription.updatedAt, ...items.map(i => finite(i.updatedAt) ? i.updatedAt : 0));
  const proItems = items.filter(i => record(i.plan).slug === "pro");
  const pro = proItems.find(i => {
    const plan = record(i.plan);
    return (subscription.status === "active" || subscription.status === "canceled") &&
      (i.status === "active" || i.status === "canceled") &&
      finite(i.periodStart) && i.periodStart <= now && finite(i.periodEnd) && i.periodEnd > now &&
      i.isFreeTrial === false && i.endedAt == null && i.pastDueAt == null &&
      Array.isArray(plan.features) && plan.features.some(f => record(f).slug === "tether_agent");
  });
  return {
    allowed: !!pro, verified: true, plan: pro ? "pro" : "free",
    status: String(pro?.status ?? proItems[0]?.status ?? subscription.status),
    accessUntil: pro && finite(pro.periodEnd) ? pro.periodEnd : null,
    // Clerk can keep a canceled item active until its paid period ends.
    canceled: !!pro && (pro.status === "canceled" || (finite(pro.canceledAt) && pro.canceledAt <= now)), sourceUpdatedAt,
  };
}

export async function readAuthoritativeSubscription(
  userId: string, secretKey: string | undefined, now?: number,
): Promise<Entitlement> {
  if (!secretKey || !userId.startsWith("user_")) return unavailable();
  try {
    const { billing } = createClerkClient({ secretKey });
    const subscription = await billing.getUserBillingSubscription(userId);
    if (subscription.subscriptionItems.some(item => item.plan?.slug === "pro")) {
      // Embedded subscription plans can omit features. Match the live user-plan
      // catalog by immutable ID before evaluating the feature entitlement.
      const { data: plans } = await billing.getPlanList({ payerType: "user", limit: 100 });
      const subscriptionItems = subscription.subscriptionItems.map(item => ({
        ...item,
        plan: plans.find(plan => plan.id === (item.planId ?? item.plan?.id) && plan.forPayerType === "user") ?? null,
      }));
      return agentEntitlement({ ...subscription, subscriptionItems }, now ?? Date.now());
    }
    return agentEntitlement(subscription, now ?? Date.now());
  } catch { return unavailable(); }
}

export function billingEventUser(value: unknown): string | null {
  const event = record(value);
  if (typeof event.type !== "string" || !/^(subscription\.|subscriptionItem\.|paymentAttempt\.)/.test(event.type)) return null;
  const payer = record(record(event.data).payer);
  return !payer.organization_id && typeof payer.user_id === "string" && payer.user_id.startsWith("user_") ? payer.user_id : null;
}

export function shouldApplySnapshot(previous: number | null, incoming: number): boolean {
  return previous === null || incoming > previous;
}
