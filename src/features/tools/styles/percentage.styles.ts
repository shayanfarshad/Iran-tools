import { StyleSheet } from "react-native";

import type { Language } from "@/lib/i18n/translations";
import { getTypography, radius, spacing, type ThemeColors } from "@/theme";

export function createPercentageStyles(
  language: Language,
  colors: ThemeColors,
) {
  const typography = getTypography(language);

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },

    container: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.bottom,
    },

    title: {
      ...typography.title,
      color: colors.text,
      marginBottom: spacing.xl,
    },

    modeContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      marginBottom: spacing.xl,
    },

    modeButton: {
      flexGrow: 1,
      flexBasis: "30%",
      minHeight: 48,
      paddingHorizontal: spacing.sm,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },

    activeModeButton: {
      backgroundColor: colors.primarySoft,
      borderColor: colors.primary,
    },

    modeText: {
      ...typography.caption,
      color: colors.textSecondary,
    },

    activeModeText: {
      color: colors.primary,
      fontFamily: typography.bold.fontFamily,
    },

    formCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
    },

    label: {
      ...typography.bodyMedium,
      color: colors.text,
      marginBottom: spacing.sm,
      marginTop: spacing.md,
    },

    inputWrapper: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },

    input: {
      ...typography.body,
      flex: 1,
      minWidth: 0,
      minHeight: 50,
      paddingVertical: spacing.sm,
      paddingHorizontal: 0,
      color: colors.text,
      fontSize: 18,
    },

    inputSuffix: {
      ...typography.bodyMedium,
      color: colors.textMuted,
      marginStart: spacing.sm,
    },

    resultCard: {
      marginTop: spacing.xl,
      padding: spacing.xl,
      backgroundColor: colors.primarySoft,
      borderRadius: radius.lg,
      alignItems: "center",
    },

    resultLabel: {
      ...typography.bodyMedium,
      color: colors.textSecondary,
    },

    resultValue: {
      ...typography.bold,
      fontSize: 32,
      color: colors.primary,
      marginTop: spacing.md,
    },

    changeLabel: {
      ...typography.bodyMedium,
      marginTop: spacing.sm,
    },
  });
}
