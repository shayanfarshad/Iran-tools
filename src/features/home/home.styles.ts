import { StyleSheet } from "react-native";

import type { ThemeColors } from "@/theme";
import { getTypography, radius, spacing } from "@/theme";

export const createHomeStyles = (
  language: "fa" | "en",
  colors: ThemeColors,
) => {
  const typography = getTypography(language);

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxxl,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerText: {
      flex: 1,
    },
    appName: {
      ...typography.bold,
      color: colors.primary,
      fontSize: 26,
    },
    subtitle: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: spacing.xs,
    },
    settingsButton: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    settingsIcon: {
      fontSize: 23,
      color: colors.text,
    },
    welcomeSection: {
      marginTop: spacing.xl,
      marginBottom: spacing.lg,
    },
    title: {
      ...typography.title,
      color: colors.text,
    },
    searchContainer: {
      minHeight: 54,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.lg,
    },
    searchIcon: {
      marginEnd: spacing.sm,
    },
    searchInput: {
      flex: 1,
      minHeight: 52,
      ...typography.body,
      color: colors.text,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    sectionTitle: {
      ...typography.heading,
      color: colors.text,
      fontSize: 16,
    },
    toolCount: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    toolsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
    },
    toolCardWrapper: {
      width: "48%",
    },
    emptyState: {
      padding: spacing.xxl,
      alignItems: "center",
    },
    emptyStateText: {
      ...typography.body,
      color: colors.textSecondary,
    },
    premiumBanner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.primarySoft,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      marginBottom: spacing.xl,
      marginTop: spacing.xl,
    },
    premiumBannerContent: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    premiumBannerText: {
      flex: 1,
    },
    premiumBannerTitle: {
      ...typography.bodyMedium,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    premiumBannerDescription: {
      ...typography.caption,
      color: colors.textSecondary,
    },
  });
};
