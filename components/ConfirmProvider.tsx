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
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/45 px-4 backdrop-blur-[3px]">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-[#E7B07B] bg-[#FDE7D2] shadow-[0_24px_60px_rgba(230,126,34,0.20)]">
            <div className="relative p-6 sm:p-7">
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-[#8C6A4A] transition hover:bg-[#F7D9BC]"
                aria-label="Close confirmation"
              >
                <X size={17} />
              </button>

              <div className="pr-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E67E22] shadow-md">
                  <AlertTriangle size={24} className="text-white" />
                </div>

                <h3 className="mt-5 text-xl font-bold leading-tight text-[#2A211B]">
                  {options.title}
                </h3>

                <p className="mt-2 text-sm leading-7 text-[#5C4632] sm:text-[15px]">
                  {options.message}
                </p>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex items-center justify-center rounded-2xl border border-[#D8B48B] bg-[#FFF8F1] px-5 py-3 text-sm font-semibold text-[#5C4632] transition hover:bg-[#F7D9BC] sm:min-w-[120px]"
                >
                  {options.cancelText || "Cancel"}
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition sm:min-w-[140px] ${
                    options.danger
                      ? "bg-[#D9534F] hover:bg-[#c64541]"
                      : "bg-[#E67E22] hover:bg-[#cf6f1c]"
                  }`}
                >
                  {options.confirmText || "Confirm"}
                </button>
              </div>
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
