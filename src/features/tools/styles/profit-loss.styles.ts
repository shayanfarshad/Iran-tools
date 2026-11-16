import { getTypography, radius, spacing, type ThemeColors } from "@/theme";
import { StyleSheet } from "react-native";

export function createProfitLossStyles(
  language: "fa" | "en",
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
      marginBottom: spacing.sm,
    },
    hint: {
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
    },
    currencyContainer: {
      flexDirection: "row",
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    currencyButton: {
      flex: 1,
      minHeight: 44,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
    },
    activeCurrencyButton: {
      backgroundColor: colors.primarySoft,
      borderColor: colors.primary,
    },
    currencyText: {
      ...typography.bodyMedium,
      color: colors.textSecondary,
    },
    activeCurrencyText: {
      color: colors.primary,
      fontFamily: typography.bold.fontFamily,
    },
    formCard: {
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    label: {
      ...typography.bodyMedium,
      color: colors.text,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    inputWrapper: {
      width: "100%",
      minHeight: 52,
      flexDirection: "row",
      flexWrap: "nowrap",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.background,
    },
    input: {
      ...typography.body,
      flex: 1,
      minWidth: 0,
      minHeight: 50,
      paddingHorizontal: 0,
      paddingVertical: spacing.sm,
      color: colors.text,
      fontSize: 18,
    },
    inputSuffix: {
      ...typography.caption,
      color: colors.textSecondary,
      marginStart: spacing.sm,
      flexShrink: 0,
      alignSelf: "center",
    },
    clearButton: {
      minHeight: 46,
      marginTop: spacing.lg,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.primarySoft,
      borderRadius: radius.md,
    },
    clearButtonText: {
      ...typography.bodyMedium,
      color: colors.primary,
    },
    resultCard: {
      marginTop: spacing.xl,
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    resultTitle: {
      ...typography.heading,
      color: colors.text,
      marginBottom: spacing.md,
    },
    summaryCard: {
      padding: spacing.lg,
      alignItems: "center",
      backgroundColor: colors.primarySoft,
      borderRadius: radius.md,
      marginBottom: spacing.md,
    },
    summaryLabel: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    summaryValue: {
      ...typography.bold,
      fontSize: 26,
      marginTop: spacing.sm,
    },
    statusText: {
      ...typography.bodyMedium,
      marginTop: spacing.xs,
    },
    resultRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: spacing.sm,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    lastResultRow: {
      borderBottomWidth: 0,
    },
    resultLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      flexShrink: 1,
    },
    resultValue: {
      ...typography.bodyMedium,
      color: colors.text,
      flexShrink: 1,
    },
    emptyText: {
      ...typography.body,
      color: colors.textSecondary,
    },
    errorText: {
      ...typography.body,
      color: colors.danger,
    },
  });
}
