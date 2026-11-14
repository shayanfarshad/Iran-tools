import {
  Estedad_100Thin,
  Estedad_400Regular,
  Estedad_700Bold,
  useFonts,
} from "@expo-google-fonts/estedad";

import {
  Inter_100Thin,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

import {
  LanguageProvider,
  useLanguage,
} from "@/lib/providers/language-provider";
import { PremiumProvider } from "@/lib/providers/premium-provider";

import { ThemeProvider, useTheme } from "@/lib/providers/theme-provider";
import { getColors } from "@/theme/colors";
import { LocaleProvider, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

function AppNavigator() {
  const { direction, isReady } = useLanguage();
  const { colorScheme, isThemeReady } = useTheme();
  const themeColors = getColors(colorScheme);

  if (!isReady || !isThemeReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <LocaleProvider direction={direction}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: themeColors.background,
            },
          }}
        />
      </LocaleProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    EstedadThin: Estedad_100Thin,
    EstedadRegular: Estedad_400Regular,
    EstedadBold: Estedad_700Bold,

    InterThin: Inter_100Thin,
    InterRegular: Inter_400Regular,
    InterBold: Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <PremiumProvider>
          <AppNavigator />
        </PremiumProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
