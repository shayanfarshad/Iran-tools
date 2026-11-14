import { Stack } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import ScreenScrollContainer from "@/components/screen-scroll-container";
import CalculationResult from "@/components/tools/calculation-result";
import ClearInputsButton from "@/components/ui/clear-inputs-button";
import NumericInput from "@/components/ui/numeric-input";
import {
    convertCurrency,
    type Currency,
} from "@/features/tools/calculators/currency";
import { calculateProfitLoss } from "@/features/tools/calculators/profit-loss";
import { createProfitLossStyles } from "@/features/tools/styles/profit-loss.styles";
import {
    formatMoney,
    formatNumber,
    formatPercent,
} from "@/features/tools/utils/number-format";
import { parseNumber } from "@/features/tools/utils/number-parser";
import { useLanguage } from "@/lib/providers/language-provider";
import { getColors, spacing, useTheme } from "@/theme";

export default function ProfitLossScreen() {
  const { t, language } = useLanguage();
  const { colorScheme } = useTheme();

  const colors = getColors(colorScheme);
  const styles = createProfitLossStyles(language, colors);

  const [currency, setCurrency] = useState<Currency>("toman");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [extraCost, setExtraCost] = useState("");
  const [quantity, setQuantity] = useState("1");

  const purchase = parseNumber(purchasePrice);
  const selling = parseNumber(sellingPrice);
  const extra = parseNumber(extraCost);
  const count = parseNumber(quantity);

  const currencyLabel =
    currency === "toman" ? t("profitLossToman") : t("profitLossRial");

  const amountPlaceholder = language === "fa" ? "۱,۰۰۰,۰۰۰" : "1,000,000";

  const quantityPlaceholder = language === "fa" ? "۱" : "1";

  const changeCurrency = (nextCurrency: Currency) => {
    if (nextCurrency === currency) return;

    const convertInput = (value: string) => {
      const amount = parseNumber(value);

      if (amount === null) return value;

      return String(convertCurrency(amount, currency, nextCurrency));
    };

    setPurchasePrice(convertInput(purchasePrice));
    setSellingPrice(convertInput(sellingPrice));
    setExtraCost(convertInput(extraCost));
    setCurrency(nextCurrency);
  };

  const result = useMemo(() => {
    if (
      purchase === null ||
      selling === null ||
      extra === null ||
      count === null
    ) {
      return null;
    }

    try {
      return calculateProfitLoss({
        purchasePrice: purchase,
        sellingPrice: selling,
        extraCost: extra,
        quantity: count,
      });
    } catch {
      if (count <= 0) {
        return { error: "zeroQuantity" as const };
      }

      return { error: "negative" as const };
    }
  }, [purchase, selling, extra, count]);

  const profitColor =
    result && !("error" in result)
      ? result.netProfit > 0
        ? colors.success
        : result.netProfit < 0
          ? colors.danger
          : colors.textSecondary
      : colors.text;

  const clearInputs = () => {
    setPurchasePrice("");
    setSellingPrice("");
    setExtraCost("");
    setQuantity("1");
  };

  const currencyOptions: Currency[] = ["toman", "rial"];

  const formatNullablePercent = (value: number | null) =>
    value === null ? "—" : formatPercent(value, language);

  return (
    <>
      <Stack.Screen options={{ title: t("profitLossTitle") }} />

      <ScreenScrollContainer
        style={styles.screen}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>{t("profitLossTitle")}</Text>
        <Text style={styles.hint}>{t("profitLossHint")}</Text>

        <View style={styles.currencyContainer}>
          {currencyOptions.map((item) => (
            <Pressable
              key={item}
              onPress={() => changeCurrency(item)}
              style={[
                styles.currencyButton,
                currency === item && styles.activeCurrencyButton,
              ]}
            >
              <Text
                style={[
                  styles.currencyText,
                  currency === item && styles.activeCurrencyText,
                ]}
              >
                {item === "toman" ? t("profitLossToman") : t("profitLossRial")}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>{t("profitLossPurchase")}</Text>
          <NumericInput
            value={purchasePrice}
            onChangeText={setPurchasePrice}
            language={language}
            placeholder={amountPlaceholder}
            placeholderTextColor={colors.textMuted}
            containerStyle={styles.inputWrapper}
            inputStyle={styles.input}
            suffixStyle={styles.inputSuffix}
            suffix={currencyLabel}
          />

          <Text style={styles.label}>{t("profitLossSelling")}</Text>
          <NumericInput
            value={sellingPrice}
            onChangeText={setSellingPrice}
            language={language}
            placeholder="۰"
            placeholderTextColor={colors.textMuted}
            containerStyle={styles.inputWrapper}
            inputStyle={styles.input}
            suffixStyle={styles.inputSuffix}
            suffix={currencyLabel}
          />

          <Text style={styles.label}>{t("profitLossExtra")}</Text>
          <NumericInput
            value={extraCost}
            onChangeText={setExtraCost}
            language={language}
            placeholder="۰"
            placeholderTextColor={colors.textMuted}
            containerStyle={styles.inputWrapper}
            inputStyle={styles.input}
            suffixStyle={styles.inputSuffix}
            suffix={currencyLabel}
          />

          <Text style={styles.label}>{t("profitLossQuantity")}</Text>
          <NumericInput
            value={quantity}
            onChangeText={setQuantity}
            language={language}
            placeholder={quantityPlaceholder}
            placeholderTextColor={colors.textMuted}
            containerStyle={styles.inputWrapper}
            inputStyle={styles.input}
          />

          <ClearInputsButton
            onPress={clearInputs}
            disabled={
              purchasePrice.trim() === "" &&
              sellingPrice.trim() === "" &&
              extraCost.trim() === "" &&
              quantity === "1"
            }
          />
        </View>

        {result && "error" in result && (
          <Text accessibilityRole="alert" style={styles.errorText}>
            {result.error === "zeroQuantity"
              ? t("profitLossZeroQuantity")
              : t("profitLossNegative")}
          </Text>
        )}

        {result && !("error" in result) && (
          <CalculationResult
            style={{ marginTop: spacing.xl }}
            summaries={[
              {
                label: t("profitLossNetProfit"),
                value: formatMoney(result.netProfit, language, currencyLabel),
                color: profitColor,
                description:
                  result.netProfit > 0
                    ? t("profitLossProfit")
                    : result.netProfit < 0
                      ? t("profitLossLoss")
                      : t("profitLossBreakEven"),
              },
            ]}
            rows={[
              {
                label: t("profitLossTotalPurchase"),
                value: formatMoney(
                  result.totalPurchaseCost,
                  language,
                  currencyLabel,
                ),
              },
              {
                label: t("profitLossTotalExtra"),
                value: formatMoney(
                  result.totalExtraCost,
                  language,
                  currencyLabel,
                ),
              },
              {
                label: t("profitLossTotalCost"),
                value: formatMoney(result.totalCost, language, currencyLabel),
              },
              {
                label: t("profitLossTotalRevenue"),
                value: formatMoney(
                  result.totalRevenue,
                  language,
                  currencyLabel,
                ),
              },
              {
                label: t("profitLossRate"),
                value: formatNullablePercent(result.profitRate),
              },
              {
                label: t("profitLossMargin"),
                value: formatNullablePercent(result.profitMargin),
              },
              {
                label: t("profitLossQuantity"),
                value: formatNumber(count ?? 0, language),
              },
            ]}
          />
        )}
      </ScreenScrollContainer>
    </>
  );
}
