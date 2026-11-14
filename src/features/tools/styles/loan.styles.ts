import { StyleSheet } from "react-native";

import { Language } from "@/lib/i18n/translations";
import { getTypography, radius, spacing, type ThemeColors } from "@/theme";

export function createLoanStyles(language: Language, colors: ThemeColors) {
  const typography = getTypography(language);

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },

    container: {
      padding: spacing.lg,
      paddingBottom: spacing.xl,
      gap: spacing.md,
      backgroundColor: colors.background,
    },

    title: {
      ...typography.title,
      color: colors.text,
    },

    hint: {
      ...typography.caption,
      color: colors.textMuted,
    },

    formCard: {
      padding: spacing.lg,
      gap: spacing.sm,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },

    label: {
      ...typography.bodyMedium,
      marginTop: spacing.xs,
      color: colors.text,
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
    },

    inputSuffix: {
      ...typography.bodyMedium,
      color: colors.textMuted,
      marginStart: spacing.sm,
    },

    currencyContainer: {
      flexDirection: "row",
      width: "100%",
      gap: spacing.xs,
    },

    currencyButton: {
      flex: 1,
      minWidth: 0,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },

    activeCurrencyButton: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },

    currencyText: {
      ...typography.bodyMedium,
      color: colors.text,
    },

    activeCurrencyText: {
      color: "#FFFFFF",
    },

    periodContainer: {
      flexDirection: "row",
      width: "100%",
      gap: spacing.xs,
    },

    periodButton: {
      flex: 1,
      minWidth: 0,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },

    activePeriodButton: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },

    periodText: {
      ...typography.bodyMedium,
      color: colors.text,
    },

    activePeriodText: {
      color: "#FFFFFF",
    },

    clearButton: {
      minHeight: 44,
      marginTop: spacing.sm,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.md,
      backgroundColor: colors.background,
    },

    clearButtonText: {
      ...typography.bodyMedium,
      color: colors.textMuted,
    },

    errorText: {
      ...typography.caption,
      marginTop: spacing.xs,
      color: colors.danger,
    },

    resultCard: {
      padding: spacing.lg,
      gap: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },

    resultTitle: {
      ...typography.heading,
      color: colors.text,
    },

    summaryCard: {
      padding: spacing.md,
      gap: spacing.xs,
      borderRadius: radius.md,
      backgroundColor: colors.primary + "15",
    },

    summaryLabel: {
      ...typography.bodyMedium,
      color: colors.textMuted,
    },

    summaryValue: {
      ...typography.heading,
      color: colors.primary,
    },

    resultRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    lastResultRow: {
      borderBottomWidth: 0,
      paddingBottom: 0,
    },

    resultLabel: {
      ...typography.body,
      flex: 1,
      color: colors.textMuted,
    },

    resultValue: {
      ...typography.bodyMedium,
      color: colors.text,
    },

    emptyText: {
      ...typography.body,
      paddingVertical: spacing.lg,
      color: colors.textMuted,
    },
  });
}
