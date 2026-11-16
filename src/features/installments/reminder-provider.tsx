import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import { useLanguage } from "../../lib/providers/language-provider";
import { changeReminders, initialReminderState, syncReminders, type ReminderState } from "./reminders";
import { subscribeBooks } from "./storage";

type ContextValue = {
  state: ReminderState; busy: boolean; error: boolean;
  refresh: () => Promise<void>; toggle: (enabled: boolean) => Promise<void>;
};
const Context = createContext<ContextValue | null>(null);

export function InstallmentReminderProvider({ children }: { children: ReactNode }) {
  const { language, isReady } = useLanguage();
  const [state, setState] = useState(initialReminderState);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState(false);
  const generation = useRef(0);

  const run = useCallback(async (enabled?: boolean) => {
    const current = ++generation.current;
    setBusy(true);
    setError(false);
    try {
      const next = enabled === undefined
        ? await syncReminders(language)
        : await changeReminders(enabled, language);
      if (current === generation.current) setState(next);
    } catch {
      if (current === generation.current) setError(true);
    } finally {
      if (current === generation.current) setBusy(false);
    }
  }, [language]);

  const refresh = useCallback(() => run(), [run]);
  useEffect(() => {
    if (!isReady) return;
    const startup = setTimeout(() => { void refresh(); }, 0);
    const unsubscribe = subscribeBooks(() => { void refresh(); });
    const subscription = AppState.addEventListener("change", status => {
      if (status === "active") void refresh();
    });
    return () => { clearTimeout(startup); unsubscribe(); subscription.remove(); };
  }, [isReady, refresh]);

  return <Context.Provider value={{ state, busy, error, refresh, toggle: run }}>{children}</Context.Provider>;
}

export function useInstallmentReminders() {
  const value = useContext(Context);
  if (!value) throw new Error("InstallmentReminderProvider is missing");
  return value;
}
