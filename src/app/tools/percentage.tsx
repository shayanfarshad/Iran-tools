import { Stack } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import ScreenContainer from "@/components/screen-scroll-container";
import {
    calculatePercentage,
    calculatePercentageChange,
    calculateWhatPercent,
} from "@/features/tools/calculators/percentage";
import { useLanguage } from "@/lib/providers/language-provider";
import { colors, getTypography, radius, spacing } from "@/theme";

type Mode = "percentage" | "what-percent" | "change";

function parseNumber(value: string): number | null {
  const normalized = value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[٬,]/g, "")
    .trim();

  if (!normalized) return null;

  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

export default function PercentageScreen() {
  const { t, language } = useLanguage();
  const styles = createPercentageStyles(language);

  const [mode, setMode] = useState<Mode>("percentage");
  const [firstValue, setFirstValue] = useState("");
  const [secondValue, setSecondValue] = useState("");

  const result = useMemo(() => {
    const first = parseNumber(firstValue);
    const second = parseNumber(secondValue);

    if (first === null || second === null) return null;

    switch (mode) {
      case "percentage":
        return calculatePercentage(first, second);
      case "what-percent":
        return calculateWhatPercent(first, second);
      case "change":
        return calculatePercentageChange(first, second);
    }
  }, [mode, firstValue, secondValue]);

  const formatter = new Intl.NumberFormat(
    language === "fa" ? "fa-IR" : "en-US",
    { maximumFractionDigits: 2 },
  );

  const firstLabel =
    mode === "percentage"
      ? t("valueLabel")
      : mode === "what-percent"
        ? t("partLabel")
        : t("initialValueLabel");

  const secondLabel =
    mode === "percentage"
      ? t("percentageLabel")
      : mode === "what-percent"
        ? t("wholeLabel")
        : t("finalValueLabel");

  return (
    <>
      <Stack.Screen options={{ title: t("percentageToolTitle") }} />

      <ScreenContainer
        style={styles.screen}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>{t("percentageToolTitle")}</Text>

        <View style={styles.modeContainer}>
          {(
            [
              ["percentage", "percentageModeOne"],
              ["what-percent", "percentageModeTwo"],
              ["change", "percentageModeThree"],
            ] as const
          ).map(([item, label]) => (
            <Pressable
              key={item}
              onPress={() => setMode(item)}
              style={[
                styles.modeButton,
                mode === item && styles.activeModeButton,
              ]}
            >
              <Text
                style={[
                  styles.modeText,
                  mode === item && styles.activeModeText,
                ]}
              >
                {t(label)}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>{firstLabel}</Text>
          <TextInput
            value={firstValue}
            onChangeText={setFirstValue}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />

          <Text style={styles.label}>{secondLabel}</Text>
          <TextInput
            value={secondValue}
            onChangeText={setSecondValue}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>{t("calculateResult")}</Text>

          <Text style={styles.resultValue}>
            {result === null ? "—" : formatter.format(result)}
            {result !== null && mode !== "percentage" ? "%" : ""}
          </Text>

          {mode === "change" && result !== null && (
            <Text
              style={[
                styles.changeLabel,
                {
                  color: result >= 0 ? colors.success : colors.danger,
                },
              ]}
            >
              {result > 0 ? t("increase") : result < 0 ? t("decrease") : "0"}
            </Text>
          )}
        </View>
      </ScreenContainer>
    </>
  );
}

function createPercentageStyles(language: "fa" | "en") {
  const typography = getTypography(language);

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      paddingHorizontal: spacing.lg,
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
      textAlign: "center",
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
    input: {
      ...typography.body,
      minHeight: 52,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      color: colors.text,
      fontSize: 18,
      textAlign: "left",
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
      fontFamily: typography.bold.fontFamily,
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
