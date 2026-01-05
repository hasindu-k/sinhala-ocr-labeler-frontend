"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastEventDetail {
  message: string;
  variant?: ToastVariant;
  duration?: number;
}

const variantStyles: Record<ToastVariant, string> = {
  success: "bg-emerald-500 text-white",
  error: "bg-destructive text-destructive-foreground",
  info: "bg-primary text-primary-foreground",
};

export function AppToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<ToastEventDetail>;
      const {
        message,
        variant = "info",
        duration = 3500,
      } = custom.detail || {};
      if (!message) return;
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    };

    window.addEventListener("app:toast", handler as EventListener);
    return () =>
      window.removeEventListener("app:toast", handler as EventListener);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] flex items-end justify-end px-4 pb-6 sm:px-6 sm:pb-8">
      <div className="flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto rounded-lg px-4 py-3 shadow-lg shadow-black/10 ring-1 ring-black/5 transition-all",
              variantStyles[toast.variant]
            )}
          >
            <p className="text-sm font-medium leading-snug">{toast.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
