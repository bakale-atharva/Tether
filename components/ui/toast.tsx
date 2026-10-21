"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { TOAST_DURATION_MS } from "@/lib/constants";

type Toast = { id: number; message: string };

const ToastContext = createContext<(message: string) => void>(() => {});

// Short-lived error messages for actions without a natural inline spot, such
// as a like that failed and rolled back. The region is always mounted so
// screen readers announce each message as it is added.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((message: string) => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
  }, [dismiss]);

  return (
    <ToastContext value={notify}>
      {children}
      <div
        role="alert"
        className="pointer-events-none fixed inset-x-4 bottom-20 z-40 flex flex-col items-center gap-2 md:bottom-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-full max-w-sm items-center justify-between gap-3 rounded-2xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-ink shadow-card"
          >
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="shrink-0 rounded-full px-2 py-1 font-medium text-muted hover:bg-surface-2 hover:text-ink"
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
