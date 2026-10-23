"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import { useAction, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Entitlement } from "@/convex/lib/billing";

const BillingContext = createContext<{ summary: Entitlement | null; loading: boolean; refresh: () => void }>({ summary: null, loading: false, refresh: () => {} });
export const useBilling = () => useContext(BillingContext);

export function BillingProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useConvexAuth();
  const { userId } = useAuth();
  const getStatus = useAction(api.billing.status);
  const [summary, setSummary] = useState<{ userId: string; value: Entitlement } | null>(null);
  const [loading, setLoading] = useState(false);
  const request = useRef({ id: 0 });
  const refresh = useCallback(() => {
    if (!isAuthenticated || !userId) return;
    const tracker = request.current;
    const id = ++tracker.id;
    setLoading(true);
    getStatus({}).then(value => {
      if (id === tracker.id) setSummary({ userId, value });
    }).catch(() => {
      if (id === tracker.id) setSummary(null);
    }).finally(() => { if (id === tracker.id) setLoading(false); });
  }, [getStatus, isAuthenticated, userId]);
  useEffect(() => {
    const tracker = request.current;
    const initial = setTimeout(refresh, 0);
    const onFocus = () => refresh();
    const timer = setInterval(refresh, 60_000);
    window.addEventListener("focus", onFocus);
    return () => { ++tracker.id; clearTimeout(initial); clearInterval(timer); window.removeEventListener("focus", onFocus); };
  }, [refresh]);
  const current = isAuthenticated && summary && summary.userId === userId ? summary.value : null;
  useEffect(() => {
    if (!current?.allowed || !current.accessUntil || !userId) return;
    const timer = setTimeout(() => {
      if (current.accessUntil! <= Date.now()) setSummary({ userId, value: { ...current, allowed: false, plan: "free" } });
      refresh();
    }, Math.min(Math.max(0, current.accessUntil - Date.now()), 2_147_483_647));
    return () => clearTimeout(timer);
  }, [current, refresh, userId]);
  return <BillingContext.Provider value={{ summary: current, loading, refresh }}>{children}</BillingContext.Provider>;
}
