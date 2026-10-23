// Clerk Backend API JSON uses milliseconds. Keep this policy independent of
// session claims, metadata, and the webhook cache. Unknown values deny access.
export type Entitlement = {
  allowed: boolean;
  verified: boolean;
  plan: "free" | "pro";
  status: string;
  accessUntil: number | null;
  canceled: boolean;
  sourceUpdatedAt: number;
};
const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" ? value as Record<string, unknown> : {};
const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
export const unavailable = (): Entitlement => ({ allowed: false, verified: false, plan: "free", status: "unavailable", accessUntil: null, canceled: false, sourceUpdatedAt: 0 });

export function agentEntitlement(value: unknown, now: number): Entitlement {
  const subscription = record(value);
  if (typeof subscription.id !== "string" || !finite(subscription.updated_at) || !Array.isArray(subscription.subscription_items) || typeof subscription.status !== "string") return unavailable();
  const items = subscription.subscription_items.map(record);
  const sourceUpdatedAt = Math.max(subscription.updated_at, ...items.map(i => finite(i.updated_at) ? i.updated_at : 0));
  const proItems = items.filter(i => record(i.plan).slug === "pro");
  const pro = proItems.find(i => {
    const plan = record(i.plan);
    return (subscription.status === "active" || subscription.status === "canceled") &&
      (i.status === "active" || i.status === "canceled") &&
      finite(i.period_start) && i.period_start <= now && finite(i.period_end) && i.period_end > now &&
      i.is_free_trial === false && i.ended_at == null && i.past_due_at == null &&
      Array.isArray(plan.features) && plan.features.some(f => record(f).slug === "tether_agent");
  });
  return {
    allowed: !!pro, verified: true, plan: pro ? "pro" : "free",
    status: String(pro?.status ?? proItems[0]?.status ?? subscription.status),
    accessUntil: pro && finite(pro.period_end) ? pro.period_end : null,
    // Clerk can keep a canceled item active until its paid period ends.
    canceled: !!pro && (pro.status === "canceled" || (finite(pro.canceled_at) && pro.canceled_at <= now)), sourceUpdatedAt,
  };
}

export async function readAuthoritativeSubscription(
  userId: string, secretKey: string | undefined, fetcher: typeof fetch = fetch, now?: number,
): Promise<Entitlement> {
  if (!secretKey || !userId.startsWith("user_")) return unavailable();
  try {
    const response = await fetcher(`https://api.clerk.com/v1/users/${encodeURIComponent(userId)}/billing/subscription`, {
      headers: { Authorization: `Bearer ${secretKey}` },
      cache: "no-store", signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return unavailable();
    const subscription = record(await response.json());
    if (Array.isArray(subscription.subscription_items) && subscription.subscription_items.some(i => record(record(i).plan).slug === "pro")) {
      // Clerk can omit features from the plan embedded in a subscription.
      // Read the live user-plan catalog and match immutable plan IDs. Neither
      // the subscription's embedded features nor a client flag can grant access.
      const plansResponse = await fetcher("https://api.clerk.com/v1/billing/plans?payer_type=user&limit=100", {
        headers: { Authorization: `Bearer ${secretKey}` },
        cache: "no-store", signal: AbortSignal.timeout(10_000),
      });
      if (!plansResponse.ok) return unavailable();
      const catalog = record(await plansResponse.json());
      if (!Array.isArray(catalog.data)) return unavailable();
      const plans = catalog.data.map(record);
      subscription.subscription_items = subscription.subscription_items.map(value => {
        const item = record(value);
        const planId = item.plan_id ?? record(item.plan).id;
        const plan = plans.find(p => typeof planId === "string" && p.id === planId && p.for_payer_type === "user");
        return { ...item, plan: plan ?? null };
      });
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
