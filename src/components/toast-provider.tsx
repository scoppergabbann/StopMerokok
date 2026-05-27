"use client";

import { CheckCircle2, Info, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ToastVariant = "success" | "info";

type Toast = {
  id: number;
  message: string;
  title: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Date.now();
      setToasts((current) => [...current, { ...toast, id }]);
      window.setTimeout(() => removeToast(id), 3200);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[min(92vw,380px)] flex-col gap-3">
        {toasts.map((toast) => {
          const Icon = toast.variant === "success" ? CheckCircle2 : Info;

          return (
            <div
              className="flex items-start gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-2xl shadow-slate-300/70"
              key={toast.id}
            >
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-2xl ${
                  toast.variant === "success"
                    ? "bg-[#DFF3E8] text-[#2F7D57]"
                    : "bg-[#E3F3F7] text-[#36798D]"
                }`}
              >
                <Icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-[#1F2933]">{toast.title}</p>
                <p className="mt-1 text-sm font-medium leading-6 text-slate-600">
                  {toast.message}
                </p>
              </div>
              <button
                aria-label="Tutup toast"
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                onClick={() => removeToast(toast.id)}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
