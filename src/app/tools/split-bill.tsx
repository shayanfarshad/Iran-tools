import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import ScreenScrollContainer from "@/components/screen-scroll-container";
import CalculationResult from "@/components/tools/calculation-result";
import ClearInputsButton from "@/components/ui/clear-inputs-button";
import NumericInput from "@/components/ui/numeric-input";
import {
  convertCurrency,
  type Currency,
} from "@/features/tools/calculators/currency";
import { splitBill } from "@/features/tools/calculators/remaining";
import { createProfitLossStyles } from "@/features/tools/styles/profit-loss.styles";
import { formatNumber } from "@/features/tools/utils/number-format";
import { parseNumber } from "@/features/tools/utils/number-parser";
import { useLanguage } from "@/lib/providers/language-provider";
import { getColors, spacing, useTheme } from "@/theme";

export default function SplitBillScreen() {
  const { t, language } = useLanguage();
  const { colorScheme } = useTheme();

  const colors = getColors(colorScheme);
  const styles = createProfitLossStyles(language, colors);

  const [total, setTotal] = useState("");
  const [people, setPeople] = useState("");

  const [currency, setCurrency] = useState<Currency>("toman");

  const currencyLabel = currency === "toman" ? t("loanToman") : t("loanRial");

  const hasInput = total.trim() !== "" || people.trim() !== "";

  const changeCurrency = (nextCurrency: Currency) => {
    if (nextCurrency === currency) return;

    const amount = parseNumber(total);

    if (amount !== null) {
      const converted = convertCurrency(amount, currency, nextCurrency);

      if (!Number.isFinite(converted)) return;

      setTotal(String(converted));
    }

    setCurrency(nextCurrency);
  };
  const amountPlaceholder = language === "fa" ? "۱,۰۰۰,۰۰۰" : "1,000,000";
  const peoplePlaceholder = language === "fa" ? "۴" : "4";

  const parsedTotal = parseNumber(total);
  const parsedPeople = parseNumber(people);
  const hasBothValues = total.trim() !== "" && people.trim() !== "";

  let share: number | null = null;
  let hasError = false;

  if (hasBothValues) {
    if (parsedTotal === null || parsedPeople === null) {
      hasError = true;
    } else {
      try {
        share = splitBill(parsedTotal, parsedPeople)[0];
      } catch {
        hasError = true;
      }
    }
  }

  const clearInputs = () => {
    setTotal("");
    setPeople("");
  };

  return (
    <ScreenScrollContainer
      style={styles.screen}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>{t("splitBill")}</Text>
      <Text style={styles.hint}>{t("splitBillHint")}</Text>
      <View style={styles.currencyContainer}>
        {(["toman", "rial"] as const).map((item) => {
          const isActive = currency === item;

          return (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => changeCurrency(item)}
              style={[
                styles.currencyButton,
                isActive && styles.activeCurrencyButton,
              ]}
            >
              <Text
                style={[
                  styles.currencyText,
                  isActive && styles.activeCurrencyText,
                ]}
              >
                {item === "toman" ? t("loanToman") : t("loanRial")}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.formCard}>
        <Text style={styles.label}>{t("billTotal")}</Text>

        <NumericInput
          value={total}
          onChangeText={setTotal}
          language={language}
          accessibilityLabel={`${t("billTotal")} (${currencyLabel})`}
          placeholder={amountPlaceholder}
          placeholderTextColor={colors.textMuted}
          containerStyle={styles.inputWrapper}
          inputStyle={styles.input}
          suffixStyle={styles.inputSuffix}
          suffix={currencyLabel}
          selectTextOnFocus
        />

        <Text style={styles.label}>{t("billPeople")}</Text>

        <NumericInput
          value={people}
          onChangeText={setPeople}
          language={language}
          accessibilityLabel={t("billPeople")}
          placeholder={peoplePlaceholder}
          placeholderTextColor={colors.textMuted}
          containerStyle={styles.inputWrapper}
          inputStyle={styles.input}
          selectTextOnFocus
        />

        <ClearInputsButton onPress={clearInputs} disabled={!hasInput} />
      </View>

      {hasError && (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {t("splitBillInvalid")}
        </Text>
      )}

      {share !== null && !hasError && (
        <CalculationResult
          style={{ marginTop: spacing.xl }}
          summaries={[
            {
              label: t("billShare"),
              value: `${formatNumber(share, language, 2)} ${currencyLabel}`,
            },
          ]}
        />
      )}
    </ScreenScrollContainer>
  );
}
