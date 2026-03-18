// components/ConfirmProvider.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { AlertTriangle, X } from "lucide-react";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

type ConfirmContextType = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(
    null,
  );

  const confirm = useCallback((options: ConfirmOptions) => {
    setOptions(options);

    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleClose = useCallback(() => {
    if (resolver) resolver(false);
    setOptions(null);
    setResolver(null);
  }, [resolver]);

  const handleConfirm = useCallback(() => {
    if (resolver) resolver(true);
    setOptions(null);
    setResolver(null);
  }, [resolver]);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      {options && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-[#FFF4E8] p-2 text-[#E67E22]">
                  <AlertTriangle size={20} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#1F1F1F]">
                    {options.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#6B6B6B]">
                    {options.message}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-1 text-[#8A8175] transition hover:bg-[#F3ECE3]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-2xl border border-[#D9D2C7] px-5 py-3 font-semibold text-[#1F1F1F] transition hover:bg-[#F7F4EE]"
              >
                {options.cancelText || "Cancel"}
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className={`rounded-2xl px-5 py-3 font-semibold text-white transition ${
                  options.danger
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-[#E67E22] hover:bg-[#cf6f1c]"
                }`}
              >
                {options.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);

  if (!context) {
    throw new Error("useConfirm must be used inside ConfirmProvider");
  }

  return context;
}
