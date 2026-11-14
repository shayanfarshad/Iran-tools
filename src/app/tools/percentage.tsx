import { Stack } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import ScreenContainer from "@/components/screen-scroll-container";
import NumericInput from "@/components/ui/numeric-input";

import {
    calculatePercentage,
    calculatePercentageChange,
    calculateWhatPercent,
} from "@/features/tools/calculators/percentage";

import { createPercentageStyles } from "@/features/tools/styles/percentage.styles";
import {
    formatNumber,
    formatPercent,
} from "@/features/tools/utils/number-format";
import { parseNumber } from "@/features/tools/utils/number-parser";

import CalculationResult from "@/components/tools/calculation-result";
import { useLanguage } from "@/lib/providers/language-provider";
import { getColors, spacing, useTheme } from "@/theme";

type Mode = "percentage" | "what-percent" | "change";

export default function PercentageScreen() {
  const { t, language } = useLanguage();
  const { colorScheme } = useTheme();

  const colors = getColors(colorScheme);
  const styles = createPercentageStyles(language, colors);

  const [mode, setMode] = useState<Mode>("percentage");
  const [firstValue, setFirstValue] = useState("");
  const [secondValue, setSecondValue] = useState("");

  const result = useMemo(() => {
    const first = parseNumber(firstValue);
    const second = parseNumber(secondValue);

    if (first === null || second === null) {
      return null;
    }

    switch (mode) {
      case "percentage":
        return calculatePercentage(first, second);

      case "what-percent":
        return calculateWhatPercent(first, second);

      case "change":
        return calculatePercentageChange(first, second);
    }
  }, [mode, firstValue, secondValue]);

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

  const firstPlaceholder = language === "fa" ? "۱۰۰" : "100";
  const secondPlaceholder = language === "fa" ? "۲۰" : "20";

  const formattedResult =
    result === null
      ? "—"
      : mode === "percentage"
        ? formatNumber(result, language)
        : formatPercent(result, language);

  const changeDescription =
    result === null
      ? null
      : result > 0
        ? t("increase")
        : result < 0
          ? t("decrease")
          : formatPercent(0, language);

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
          ).map(([item, label]) => {
            const isActive = mode === item;

            return (
              <Pressable
                key={item}
                onPress={() => setMode(item)}
                style={[styles.modeButton, isActive && styles.activeModeButton]}
              >
                <Text
                  style={[styles.modeText, isActive && styles.activeModeText]}
                >
                  {t(label)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>{firstLabel}</Text>

          <NumericInput
            value={firstValue}
            onChangeText={setFirstValue}
            language={language}
            placeholder={firstPlaceholder}
            placeholderTextColor={colors.textMuted}
            containerStyle={styles.inputWrapper}
            inputStyle={styles.input}
            suffixStyle={styles.inputSuffix}
          />

          <Text style={styles.label}>{secondLabel}</Text>

          <NumericInput
            value={secondValue}
            onChangeText={setSecondValue}
            language={language}
            suffix={
              mode === "percentage"
                ? language === "fa"
                  ? "درصد"
                  : "%"
                : undefined
            }
            placeholder={
              mode === "percentage" ? secondPlaceholder : firstPlaceholder
            }
            placeholderTextColor={colors.textMuted}
            containerStyle={styles.inputWrapper}
            inputStyle={styles.input}
            suffixStyle={styles.inputSuffix}
          />
        </View>

        {result !== null && Number.isFinite(result) && (
          <CalculationResult
            style={{ marginTop: spacing.xl }}
            summaries={[
              {
                label:
                  mode === "percentage"
                    ? t("percentageModeOne")
                    : mode === "what-percent"
                      ? t("percentageModeTwo")
                      : t("percentageModeThree"),
                value: formattedResult,
                description:
                  mode === "change"
                    ? (changeDescription ?? undefined)
                    : undefined,
                color:
                  mode === "change"
                    ? result >= 0
                      ? colors.success
                      : colors.danger
                    : colors.primary,
              },
            ]}
          />
        )}
      </ScreenContainer>
    </>
  );
}
