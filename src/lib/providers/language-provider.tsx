import AsyncStorage from "@react-native-async-storage/async-storage";
import { reloadAppAsync } from "expo";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { I18nManager, Platform } from "react-native";

import {
    translations,
    type Language,
    type TranslationKey,
} from "@/lib/i18n/translations";

const LANGUAGE_STORAGE_KEY = "iran-tools-language";

type LanguageContextValue = {
  language: Language;
  direction: "rtl" | "ltr";
  isReady: boolean;
  t: (key: TranslationKey) => string;
  changeLanguage: (language: Language) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initializeLanguage() {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

      const initialLanguage: Language = savedLanguage === "fa" ? "fa" : "en";

      const shouldBeRTL = initialLanguage === "fa";

      if (Platform.OS !== "web" && I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);

        await reloadAppAsync("Apply saved language direction");
        return;
      }

      if (mounted) {
        setLanguage(initialLanguage);
        setIsReady(true);
      }
    }

    initializeLanguage();

    return () => {
      mounted = false;
    };
  }, []);

  const changeLanguage = useCallback(
    async (nextLanguage: Language) => {
      if (nextLanguage === language) return;

      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);

      if (Platform.OS === "web") {
        setLanguage(nextLanguage);
        return;
      }

      const shouldBeRTL = nextLanguage === "fa";

      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);

      await reloadAppAsync("User changed app language");
    },
    [language],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      direction: language === "fa" ? "rtl" : "ltr",
      isReady,
      t: (key) => translations[language][key],
      changeLanguage,
    }),
    [language, isReady, changeLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
