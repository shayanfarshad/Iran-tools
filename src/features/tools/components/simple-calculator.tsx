import ScreenScrollContainer from "@/components/screen-scroll-container";
import CalculationResult from "@/components/tools/calculation-result";
import ClearInputsButton from "@/components/ui/clear-inputs-button";
import NumericInput from "@/components/ui/numeric-input";
import type { TranslationKey } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/providers/language-provider";
import { usePremium } from "@/lib/providers/premium-provider";
import { getColors, spacing, useTheme } from "@/theme";
import { Redirect } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { createLoanStyles } from "../styles/loan.styles";
import { formatNumber } from "../utils/number-format";
import { parseNumber } from "../utils/number-parser";

type Props = {
  title: TranslationKey;
  hint: TranslationKey;
  fields: readonly TranslationKey[];
  results: readonly TranslationKey[];
  calculate: (...values: number[]) => number[];
  errorKey?: TranslationKey;
};

export default function SimpleCalculator({
  title,
  hint,
  fields,
  results,
  calculate,
  errorKey = "toolsInvalidInputs",
}: Props) {
  const { t, language } = useLanguage();
  const { isPremium, isReady } = usePremium();
  const { colorScheme } = useTheme();
  const colors = getColors(colorScheme);
  const styles = createLoanStyles(language, colors);
  const [values, setValues] = useState<string[]>(() => fields.map(() => ""));
  const parsed = values.map(parseNumber);
  let output: number[] | null = null;
  let error = false;
  if (values.every((value) => value.trim() !== "")) {
    if (parsed.some((value) => value === null)) error = true;
    else {
      try {
        output = calculate(...(parsed as number[]));
      } catch {
        error = true;
      }
    }
  }
  if (!isReady) return null;
  if (isPremium) return <Redirect href="/premium" />;
  return (
    <ScreenScrollContainer
      style={styles.screen}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>{t(title)}</Text>
      <Text style={styles.hint}>{t(hint)}</Text>
      <View style={styles.formCard}>
        {fields.map((field, index) => (
          <View key={field} style={{ gap: spacing.sm }}>
            <Text style={styles.label}>{t(field)}</Text>
            <NumericInput
              accessibilityLabel={t(field)}
              value={values[index]}
              onChangeText={(value) =>
                setValues((previous) =>
                  previous.map((item, position) =>
                    position === index ? value : item,
                  ),
                )
              }
              language={language}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              containerStyle={styles.inputWrapper}
              inputStyle={styles.input}
            />
          </View>
        ))}
        <ClearInputsButton
          onPress={() => setValues(fields.map(() => ""))}
          disabled={values.every((value) => value.trim() === "")}
        />
      </View>
      {error && (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {t(errorKey)}
        </Text>
      )}
      {output !== null && !error && (
        <CalculationResult
          summaries={results.map((label, index) => ({
            label: t(label),
            value: formatNumber(output[index], language, 2),
          }))}
        />
      )}
    </ScreenScrollContainer>
  );
}
