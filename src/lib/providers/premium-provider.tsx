import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { getBillingConfig, runBilling } from "@/features/billing/store";

type PremiumContextValue = {
  isPremium: boolean;
  isReady: boolean;
  isBusy: boolean;
  isAvailable: boolean;
  price: string | null;
  error: boolean;
  purchase: () => Promise<void>;
  restore: () => Promise<void>;
};
const PremiumContext = createContext<PremiumContextValue | undefined>(undefined);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setPremium] = useState(false);
  const [isReady, setReady] = useState(() => !getBillingConfig());
  const [isBusy, setBusy] = useState(false);
  const [price, setPrice] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const busy = useRef(false);
  const isAvailable = Boolean(getBillingConfig());
  const execute = useCallback(async (purchase: boolean) => {
    if (busy.current) return;
    busy.current = true;
    setBusy(true);
    setError(false);
    try {
      const result = await runBilling(purchase);
      setPremium(result.owned);
      setPrice(result.price);
    } catch { setError(true); }
    finally { busy.current = false; setBusy(false); setReady(true); }
  }, []);
  useEffect(() => {
    if (!isAvailable) return;
    // Start the native store handshake after the provider has mounted.
    const timer = setTimeout(() => void execute(false), 0);
    return () => clearTimeout(timer);
  }, [isAvailable, execute]);
  return <PremiumContext.Provider value={{ isPremium, isReady, isBusy, isAvailable, price, error, purchase: () => execute(true), restore: () => execute(false) }}>{children}</PremiumContext.Provider>;
}
export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) throw new Error("usePremium must be used within PremiumProvider");
  return context;
}
