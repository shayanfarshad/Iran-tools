import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { getBillingConfig, runBilling } from "@/features/billing/store";
import { AppState } from "react-native";

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
    } catch (error) {
      // Poolakey reports backing out of the payment UI as "purchase canceled".
      const message = error instanceof Error ? error.message : String(error);
      if (!/purchase cancel(?:ed|led)/i.test(message)) {
        setError(true);
        // A failed subscription refresh must not retain access indefinitely.
        if (!purchase && getBillingConfig()?.store === "bazaar") setPremium(false);
      }
    }
    finally { busy.current = false; setBusy(false); setReady(true); }
  }, []);
  useEffect(() => {
    if (!isAvailable) return;
    // Start the native store handshake after the provider has mounted.
    const timer = setTimeout(() => void execute(false), 0);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void execute(false);
    });
    // Recheck subscriptions even during long foreground sessions.
    const refresh = setInterval(() => {
      if (AppState.currentState === "active") void execute(false);
    }, 5 * 60 * 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(refresh);
      subscription.remove();
    };
  }, [isAvailable, execute]);
  return <PremiumContext.Provider value={{ isPremium, isReady, isBusy, isAvailable, price, error, purchase: () => execute(true), restore: () => execute(false) }}>{children}</PremiumContext.Provider>;
}
export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) throw new Error("usePremium must be used within PremiumProvider");
  return context;
}
