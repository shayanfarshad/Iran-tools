import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useLanguage } from "@/lib/providers/language-provider";
import { getColors, useTheme } from "@/theme";
import { useHomeStyles } from "../use-home-styles";

export default function PremiumBanner() {
  const { t, language } = useLanguage();
  const { colorScheme } = useTheme();

  const colors = getColors(colorScheme);
  const styles = useHomeStyles();

  return (
    <Pressable
      style={styles.premiumBanner}
      onPress={() => router.push("/premium")}
      accessibilityRole="button"
    >
      <View style={styles.premiumBannerContent}>
        <Ionicons name="sparkles-outline" size={20} color={colors.primary} />

        <View style={styles.premiumBannerText}>
          <Text style={styles.premiumBannerTitle}>{t("premium")}</Text>

          <Text style={styles.premiumBannerDescription}>
            {t("premiumDescription")}
          </Text>
        </View>
      </View>

      <Ionicons
        name={language === "fa" ? "chevron-back" : "chevron-forward"}
        size={20}
        color={colors.textSecondary}
      />
    </Pressable>
  );
}
