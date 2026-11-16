import LiveExchange from "@/features/tools/components/live-exchange";
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
import { createDiscountStyles } from "@/features/tools/styles/discount.styles";
import { formatNumber } from "@/features/tools/utils/number-format";
import { parseNumber } from "@/features/tools/utils/number-parser";
import { useLanguage } from "@/lib/providers/language-provider";
import { getColors, useTheme } from "@/theme";
export default function CurrencyScreen() {
  const { t, language } = useLanguage();
  const { colorScheme } = useTheme();
  const colors = getColors(colorScheme);
  const styles = createDiscountStyles(language, colors);
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState<Currency>("toman");
  const to = from === "toman" ? "rial" : "toman";
  const unit = (currency: Currency) =>
    t(currency === "toman" ? "loanToman" : "loanRial");
  const parsed = parseNumber(amount);
  const result =
    parsed !== null && parsed >= 0 ? convertCurrency(parsed, from, to) : null;
  const invalid =
    amount.length > 0 && (result === null || !Number.isFinite(result));


  return (
    <ScreenScrollContainer contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t("currency")}</Text>
      <Text style={styles.hint}>{t("currencyConversionHint")}</Text>
      <View style={styles.formCard}>
        <Text style={styles.label}>{t("currencySourceUnit")}</Text>
        <View style={styles.currencyContainer}>
          {(["toman", "rial"] as const).map((currency) => (
            <Pressable
              key={currency}
              accessibilityRole="button"
              accessibilityState={{ selected: from === currency }}
              onPress={() => setFrom(currency)}
              style={[
                styles.currencyButton,
                from === currency && styles.activeCurrencyButton,
              ]}
            >
              <Text
                style={[
                  styles.currencyText,
                  from === currency && styles.activeCurrencyText,
                ]}
              >
                {unit(currency)}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>{t("valueLabel")}</Text>
        <NumericInput
          value={amount}
          onChangeText={setAmount}
          language={language}
          accessibilityLabel={`${t("valueLabel")} (${unit(from)})`}
          suffix={unit(from)}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          containerStyle={styles.inputWrapper}
          inputStyle={styles.input}
          suffixStyle={styles.inputSuffix}
        />
        <ClearInputsButton
          onPress={() => setAmount("")}
          disabled={amount.trim() === ""}
        />
      </View>
      {invalid ? (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {t("currencyInvalidAmount")}
        </Text>
      ) : null}
      {result !== null && !invalid && (
        <CalculationResult
          summaries={[
            {
              label: unit(to),
              value: `${formatNumber(result, language, 2)} ${unit(to)}`,
            },
          ]}
        />
      )}
      <LiveExchange />
    </ScreenScrollContainer>
  );
}
