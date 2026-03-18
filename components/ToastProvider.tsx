"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: number;
  title: string;
  message?: string;
  type: ToastType;
};

type ToastContextType = {
  showToast: (toast: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, message, type }: Omit<ToastItem, "id">) => {
      const id = Date.now() + Math.random();

      setToasts((prev) => [...prev, { id, title, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 3200);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast Container */}
      <div className="pointer-events-none fixed right-4 top-20 z-[9999] flex w-full max-w-sm flex-col gap-3 sm:right-6 sm:top-24">
        {toasts.map((toast) => {
          const styles = {
            success: {
              icon: <CheckCircle2 size={20} className="text-[#E67E22]" />,
              border: "border-[#F1D3B8]",
              bg: "bg-[#FFF9F3]",
            },
            error: {
              icon: <AlertCircle size={20} className="text-red-500" />,
              border: "border-red-200",
              bg: "bg-[#FFF5F5]",
            },
            info: {
              icon: <Info size={20} className="text-[#E67E22]" />,
              border: "border-[#E5E0D8]",
              bg: "bg-white",
            },
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto overflow-hidden rounded-2xl border ${styles.border} ${styles.bg} shadow-lg animate-[toastSlideIn_0.3s_ease]`}
            >
              <div className="flex items-start gap-3 p-4">
                <div className="mt-0.5 shrink-0">{styles.icon}</div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#1F1F1F]">
                    {toast.title}
                  </p>

                  {toast.message && (
                    <p className="mt-1 text-sm leading-6 text-[#6B6B6B]">
                      {toast.message}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="rounded-full p-1 text-[#8A8175] transition hover:bg-[#F3ECE3] hover:text-[#1F1F1F]"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Progress bar */}
              <div className="h-[3px] w-full bg-[#F3E3D2]">
                <div className="h-full animate-[toastShrink_3.2s_linear_forwards] bg-[#E67E22]" />
              </div>
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