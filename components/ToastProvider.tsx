"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
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

const TOAST_DURATION = 3200;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutMapRef = useRef<Record<number, ReturnType<typeof setTimeout>>>(
    {},
  );

  const removeToast = useCallback((id: number) => {
    const timeout = timeoutMapRef.current[id];
    if (timeout) {
      clearTimeout(timeout);
      delete timeoutMapRef.current[id];
    }

    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const startAutoRemove = useCallback(
    (id: number) => {
      const timeout = setTimeout(() => {
        removeToast(id);
      }, TOAST_DURATION);

      timeoutMapRef.current[id] = timeout;
    },
    [removeToast],
  );

  const showToast = useCallback(
    ({ title, message, type }: Omit<ToastItem, "id">) => {
      const id = Date.now() + Math.random();

      setToasts((prev) => [...prev, { id, title, message, type }]);
      startAutoRemove(id);
    },
    [startAutoRemove],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-4 z-[9999] flex justify-center px-4 sm:top-6 sm:justify-end sm:px-6">
        <div className="flex w-full max-w-md flex-col gap-3">
          {toasts.map((toast) => {
            const styles = {
              success: {
                icon: (
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E67E22] shadow-md">
                    <CheckCircle2 size={20} className="text-white" />
                  </div>
                ),
                border: "border-[#E7A96A]",
                bg: "bg-[#FDE7D2]",
                glow: "shadow-[0_20px_50px_rgba(230,126,34,0.22)]",
                progress: "bg-[#E67E22]",
                accent: "bg-[#E67E22]",
                title: "text-[#2A211B]",
                message: "text-[#5C4632]",
                close: "text-[#8C6A4A] hover:bg-[#F7D9BC]",
              },
              error: {
                icon: (
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D9534F] shadow-md">
                    <AlertCircle size={20} className="text-white" />
                  </div>
                ),
                border: "border-[#E7A4A1]",
                bg: "bg-[#FCE1E0]",
                glow: "shadow-[0_20px_50px_rgba(217,83,79,0.20)]",
                progress: "bg-[#D9534F]",
                accent: "bg-[#D9534F]",
                title: "text-[#2A1F1F]",
                message: "text-[#6A4A4A]",
                close: "text-[#9B6B6B] hover:bg-[#F6D4D3]",
              },
              info: {
                icon: (
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A67C52] shadow-md">
                    <Info size={20} className="text-white" />
                  </div>
                ),
                border: "border-[#D8B48B]",
                bg: "bg-[#F5E6D6]",
                glow: "shadow-[0_20px_50px_rgba(166,124,82,0.20)]",
                progress: "bg-[#A67C52]",
                accent: "bg-[#A67C52]",
                title: "text-[#2A211B]",
                message: "text-[#5E4C3C]",
                close: "text-[#8C745D] hover:bg-[#EEDBC7]",
              },
            }[toast.type];

            return (
              <div
                key={toast.id}
                className={`relative pointer-events-auto overflow-hidden rounded-[20px] border ${styles.border} ${styles.bg} ${styles.glow} animate-[toastSlideIn_0.28s_ease]`}
                role="status"
                aria-live="polite"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3.5">
                    <div className="shrink-0">{styles.icon}</div>

                    <div className="min-w-0 flex-1 pr-2">
                      <p className={`text-[15px] font-bold ${styles.title}`}>
                        {toast.title}
                      </p>

                      {toast.message && (
                        <p className={`mt-1.5 text-sm ${styles.message}`}>
                          {toast.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeToast(toast.id)}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${styles.close}`}
                      aria-label="Close notification"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="h-[4px] w-full bg-[#F3ECE3]">
                  <div
                    className={`h-full ${styles.progress} animate-[toastShrink_3.2s_linear_forwards]`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        @keyframes toastSlideIn {
          0% {
            opacity: 0;
            transform: translateY(-10px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes toastShrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
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
