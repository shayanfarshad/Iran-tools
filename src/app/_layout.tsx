import AppKeyboardProvider from "@/components/keyboard/app-keyboard-provider";
import { StartupSplash } from "@/components/startup-splash";
import { VehicleReminderProvider } from "@/features/vehicles/reminder-provider";
import { InstallmentReminderProvider } from "@/features/installments/reminder-provider";
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
import { SafeAreaProvider } from "react-native-safe-area-context";

function AppNavigator({ fontsReady }: { fontsReady: boolean }) {
  const { direction, isReady } = useLanguage();
  const { colorScheme, isThemeReady } = useTheme();
  const themeColors = getColors(colorScheme);

  return (
    <StartupSplash
      ready={fontsReady && isReady && isThemeReady}
      statusBarStyle={colorScheme === "dark" ? "light" : "dark"}
    >
      <SafeAreaProvider>
        <AppKeyboardProvider>
          <LocaleProvider direction={direction}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: themeColors.background,
                },
              }}
            />
          </LocaleProvider>
        </AppKeyboardProvider>
      </SafeAreaProvider>
    </StartupSplash>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    EstedadThin: Estedad_100Thin,
    EstedadRegular: Estedad_400Regular,
    EstedadBold: Estedad_700Bold,

    InterThin: Inter_100Thin,
    InterRegular: Inter_400Regular,
    InterBold: Inter_700Bold,
  });

  return (
    <ThemeProvider>
      <LanguageProvider>
        <PremiumProvider>
          <InstallmentReminderProvider>
            <VehicleReminderProvider>
              <AppNavigator fontsReady={fontsLoaded || Boolean(fontError)} />
            </VehicleReminderProvider>
          </InstallmentReminderProvider>
        </PremiumProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
