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
        className="pointer-events-none fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 flex flex-col items-center gap-2 md:bottom-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-full max-w-sm items-center justify-between gap-3 rounded-[1.25rem] border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-ink shadow-card"
          >
            <span className="min-w-0 wrap-anywhere">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="min-h-11 shrink-0 rounded-full px-3 font-semibold text-danger transition-colors duration-150 hover:bg-danger/10 md:min-h-9"
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
