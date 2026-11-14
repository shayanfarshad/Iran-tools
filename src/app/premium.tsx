import { usePremium } from "@/lib/providers/premium-provider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import ScreenContainer from "@/components/screen-scroll-container";
import { useLanguage } from "@/lib/providers/language-provider";
import {
    getColors,
    getTypography,
    radius,
    spacing,
    useTheme,
    type ThemeColors,
} from "@/theme";

export default function PremiumScreen() {
  const { t, language } = useLanguage();
  const { isPremium, isBusy, isAvailable, price, error, purchase, restore } = usePremium();
  const { colorScheme } = useTheme();

  const themeColors = getColors(colorScheme);
  const styles = createPremiumStyles(language, themeColors);

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.backButtonRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={32} color={themeColors.text} />
          </Pressable>
        </View>

        <Text style={styles.title}>{t("premiumTitle")}</Text>

        <Text style={styles.description}>{t("premiumDescription")}</Text>

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>{t("premiumBenefitsTitle")}</Text>

          <Text style={styles.benefit}>✓ {t("premiumBenefit1")}</Text>
          <Text style={styles.benefit}>✓ {t("premiumBenefit2")}</Text>
          <Text style={styles.benefit}>✓ {t("premiumBenefit4")}</Text>
        </View>

        <View style={styles.upgradeSection}>
          <Text style={styles.upgradeHint}>{t("premiumLifetimeHint")}</Text>
          {isPremium ? <Text style={styles.benefitsTitle}>{t("premiumActive")}</Text> : (
            <Pressable accessibilityRole="button" disabled={!isAvailable || isBusy} onPress={() => void purchase()} style={[styles.upgradeButton, (!isAvailable || isBusy) && { opacity: 0.5 }]}>
              <Text style={styles.upgradeButtonText}>{isBusy ? t("billingLoading") : `${t("premiumBuy")}${price ? ` — ${price}` : ""}`}</Text>
            </Pressable>
          )}
          <Pressable accessibilityRole="button" disabled={!isAvailable || isBusy} onPress={() => void restore()} style={styles.restoreButton}>
            <Text style={styles.benefit}>{t("premiumRestore")}</Text>
          </Pressable>
          {!isAvailable && <Text style={styles.upgradeHint}>{t("billingUnavailable")}</Text>}
          {error && <Text accessibilityRole="alert" style={styles.upgradeHint}>{t("billingError")}</Text>}
        </View>
      </View>
    </ScreenContainer>
  );
}

function createPremiumStyles(language: "fa" | "en", colors: ThemeColors) {
  const typography = getTypography(language);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.lg,
    },
    backButton: {
      alignSelf: "flex-start",
      justifyContent: "center",
      width: 80,
      height: 50,
    },
    title: {
      ...typography.title,
      color: colors.text,
      marginBottom: spacing.lg,
    },
    description: {
      ...typography.body,
      color: colors.textSecondary,
    },
    benefitsCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginTop: spacing.xl,
    },
    benefitsTitle: {
      ...typography.heading,
      color: colors.text,
      marginBottom: spacing.lg,
    },
    benefit: {
      ...typography.body,
      color: colors.textSecondary,
      marginBottom: spacing.md,
    },
    upgradeSection: {
      marginTop: spacing.xl,
    },
    upgradeButton: {
      minHeight: 56,
      backgroundColor: colors.primary,
      borderRadius: radius.lg,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
    },
    upgradeButtonText: {
      ...typography.bodyMedium,
      color: colors.white,
    },
    restoreButton: {
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.md,
    },
    upgradeHint: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: spacing.md,
    },
    backButtonRow: {
      width: "100%",
      direction: "ltr",
      alignItems: "flex-start",
    },
  });
}
