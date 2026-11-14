import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "light" | "dark" | "system";
export type ColorScheme = "light" | "dark";

type ThemeContextType = {
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  setThemeMode: (mode: ThemeMode) => void;
  isThemeReady: boolean;
};

const STORAGE_KEY = "@iran-tools/theme-mode";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [isThemeReady, setIsThemeReady] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const savedTheme = await AsyncStorage.getItem(STORAGE_KEY);

        if (
          savedTheme === "light" ||
          savedTheme === "dark" ||
          savedTheme === "system"
        ) {
          setThemeMode(savedTheme);
        }
      } catch (error) {
        console.warn("Failed to load theme preference:", error);
      } finally {
        setIsThemeReady(true);
      }
    }

    loadTheme();
  }, []);

  useEffect(() => {
    if (!isThemeReady) return;

    AsyncStorage.setItem(STORAGE_KEY, themeMode).catch((error) => {
      console.warn("Failed to save theme preference:", error);
    });
  }, [themeMode, isThemeReady]);

  const colorScheme: ColorScheme =
    themeMode === "system"
      ? systemColorScheme === "dark"
        ? "dark"
        : "light"
      : themeMode;

  const value = useMemo(
    () => ({
      themeMode,
      colorScheme,
      setThemeMode,
      isThemeReady,
    }),
    [themeMode, colorScheme, isThemeReady],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
