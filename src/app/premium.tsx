import { Pressable, StyleSheet, Text, View } from "react-native";

import ScreenContainer from "@/components/screen-scroll-container";
import { useLanguage } from "@/lib/providers/language-provider";
import { colors, getTypography, radius, spacing } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function PremiumScreen() {
  const { t, language } = useLanguage();
  const styles = createPremiumStyles(language);

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.backButtonRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={32} color={colors.text} />
          </Pressable>
        </View>

        <Text style={styles.title}>{t("premiumTitle")}</Text>

        <Text style={styles.description}>{t("premiumDescription")}</Text>

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>{t("premiumBenefitsTitle")}</Text>

          <Text style={styles.benefit}>✓ {t("premiumBenefit1")}</Text>
          <Text style={styles.benefit}>✓ {t("premiumBenefit2")}</Text>
          <Text style={styles.benefit}>✓ {t("premiumBenefit3")}</Text>
          <Text style={styles.benefit}>✓ {t("premiumBenefit4")}</Text>
        </View>

        <View style={styles.upgradeSection}>
          <View style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>
              {t("premiumComingSoon")}
            </Text>
          </View>

          <Text style={styles.upgradeHint}>{t("premiumComingSoonHint")}</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

function createPremiumStyles(language: "fa" | "en") {
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
