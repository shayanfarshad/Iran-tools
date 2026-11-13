import { createContext, useContext, type ReactNode } from "react";

type PremiumContextValue = {
  isPremium: boolean;
};

const PremiumContext = createContext<PremiumContextValue | undefined>(
  undefined,
);

type PremiumProviderProps = {
  children: ReactNode;
};

export function PremiumProvider({ children }: PremiumProviderProps) {
  const value: PremiumContextValue = {
    isPremium: false,
  };

  return (
    <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);

  if (!context) {
    throw new Error("usePremium must be used within PremiumProvider");
  }

  return context;
}
