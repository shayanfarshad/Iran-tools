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
import {
    calculateDiscount,
    calculateDiscountRate,
    calculateOriginalPrice,
} from "@/features/tools/calculators/discount";
import { createDiscountStyles } from "@/features/tools/styles/discount.styles";
import {
    formatMoney,
    formatPercent,
} from "@/features/tools/utils/number-format";
import { parseNumber } from "@/features/tools/utils/number-parser";
import { useLanguage } from "@/lib/providers/language-provider";
import { getColors, useTheme } from "@/theme";
type DiscountMode = "discount-price" | "discount-rate" | "original-price";

type DiscountCalculationResult = {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  discountRate: number;
};

function toToman(value: number, currency: Currency): number {
  return convertCurrency(value, currency, "toman");
}

function fromToman(value: number, currency: Currency): number {
  return convertCurrency(value, "toman", currency);
}

export default function DiscountScreen() {
  const { t, language } = useLanguage();
  const { colorScheme } = useTheme();

  const colors = getColors(colorScheme);
  const styles = createDiscountStyles(language, colors);

  const [mode, setMode] = useState<DiscountMode>("discount-price");
  const [currency, setCurrency] = useState<Currency>("toman");
  const [firstValue, setFirstValue] = useState("");
  const [secondValue, setSecondValue] = useState("");

  const firstNumber = parseNumber(firstValue);
  const secondNumber = parseNumber(secondValue);

  const currencyLabel =
    currency === "toman" ? t("discountToman") : t("discountRial");

  const result = useMemo(() => {
    if (firstNumber === null || secondNumber === null) return null;

    try {
      if (mode === "discount-price") {
        const originalPrice = toToman(firstNumber, currency);
        const calculated = calculateDiscount(originalPrice, secondNumber);

        return {
          originalPrice: fromToman(calculated.originalPrice, currency),
          discountAmount: fromToman(calculated.discountAmount, currency),
          finalPrice: fromToman(calculated.finalPrice, currency),
          discountRate: calculated.discountRate,
        } satisfies DiscountCalculationResult;
      }

      if (mode === "discount-rate") {
        const originalPrice = toToman(firstNumber, currency);
        const finalPrice = toToman(secondNumber, currency);
        const discountRate = calculateDiscountRate(originalPrice, finalPrice);
        const calculated = calculateDiscount(originalPrice, discountRate);

        return {
          originalPrice: fromToman(calculated.originalPrice, currency),
          discountAmount: fromToman(calculated.discountAmount, currency),
          finalPrice: fromToman(calculated.finalPrice, currency),
          discountRate,
        } satisfies DiscountCalculationResult;
      }

      const finalPrice = toToman(firstNumber, currency);
      const originalPrice = calculateOriginalPrice(finalPrice, secondNumber);
      const discountAmount = originalPrice - finalPrice;

      return {
        originalPrice: fromToman(originalPrice, currency),
        discountAmount: fromToman(discountAmount, currency),
        finalPrice: fromToman(finalPrice, currency),
        discountRate: secondNumber,
      } satisfies DiscountCalculationResult;
    } catch {
      return null;
    }
  }, [firstNumber, secondNumber, mode, currency]);

  const validationError = useMemo(() => {
    if (firstValue.trim() === "" || secondValue.trim() === "") return null;
    if (firstNumber === null || secondNumber === null) {
      return t("discountInvalidNumber");
    }
    if (firstNumber < 0 || secondNumber < 0) {
      return t("discountNegative");
    }

    if (mode === "discount-price" && secondNumber > 100) {
      return t("discountRateLimit");
    }

    if (mode === "discount-rate") {
      if (firstNumber <= 0) return t("discountOriginalMustBePositive");
      if (secondNumber > firstNumber) return t("discountFinalTooHigh");
    }

    if (mode === "original-price" && secondNumber >= 100) {
      return t("discountRateBelow100");
    }

    return null;
  }, [firstValue, secondValue, firstNumber, secondNumber, mode, t]);

  const hasBothValues =
    firstValue.trim().length > 0 && secondValue.trim().length > 0;

  const visibleResult = hasBothValues && !validationError ? result : null;

  const handleClear = () => {
    setFirstValue("");
    setSecondValue("");
  };

  const modes: { id: DiscountMode; label: string }[] = [
    { id: "discount-price", label: t("discountModePrice") },
    { id: "discount-rate", label: t("discountModeRate") },
    { id: "original-price", label: t("discountModeOriginal") },
  ];

  const firstLabel =
    mode === "original-price"
      ? t("discountPaidPrice")
      : t("discountOriginalPrice");

  const secondLabel =
    mode === "discount-rate" ? t("discountFinalPrice") : t("discountRateLabel");

  const amountPlaceholder = language === "fa" ? "۱,۰۰۰,۰۰۰" : "1,000,000";

  const ratePlaceholder = language === "fa" ? "۲۰" : "20";

  const firstPlaceholder = amountPlaceholder;

  const secondPlaceholder =
    mode === "discount-rate" ? amountPlaceholder : ratePlaceholder;

  const secondSuffix =
    mode === "discount-rate" ? currencyLabel : language === "fa" ? "درصد" : "%";

  return (
    <ScreenScrollContainer contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t("discountTitle")}</Text>
      <Text style={styles.hint}>{t("discountHint")}</Text>

      <View style={styles.modeContainer}>
        {modes.map((item) => {
          const active = mode === item.id;

          return (
            <Pressable
              key={item.id}
              onPress={() => {
                setMode(item.id);
                handleClear();
              }}
              style={[styles.modeButton, active && styles.activeModeButton]}
            >
              <Text style={[styles.modeText, active && styles.activeModeText]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.currencyContainer}>
        <Pressable
          onPress={() => setCurrency("toman")}
          style={[
            styles.currencyButton,
            currency === "toman" && styles.activeCurrencyButton,
          ]}
        >
          <Text
            style={[
              styles.currencyText,
              currency === "toman" && styles.activeCurrencyText,
            ]}
          >
            {t("discountToman")}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setCurrency("rial")}
          style={[
            styles.currencyButton,
            currency === "rial" && styles.activeCurrencyButton,
          ]}
        >
          <Text
            style={[
              styles.currencyText,
              currency === "rial" && styles.activeCurrencyText,
            ]}
          >
            {t("discountRial")}
          </Text>
        </Pressable>
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
          suffix={currencyLabel}
          selectTextOnFocus
        />

        <Text style={styles.label}>{secondLabel}</Text>
        <NumericInput
          value={secondValue}
          onChangeText={setSecondValue}
          language={language}
          placeholder={secondPlaceholder}
          placeholderTextColor={colors.textMuted}
          containerStyle={styles.inputWrapper}
          inputStyle={styles.input}
          suffixStyle={styles.inputSuffix}
          suffix={secondSuffix}
          selectTextOnFocus
        />

        {validationError ? (
          <Text style={styles.errorText}>{validationError}</Text>
        ) : null}

        <ClearInputsButton
          onPress={handleClear}
          disabled={firstValue.trim() === "" && secondValue.trim() === ""}
        />
      </View>

      {visibleResult !== null && (
        <CalculationResult
          summaries={[
            {
              label: t("discountFinalPrice"),
              value: formatMoney(
                visibleResult.finalPrice,
                language,
                currencyLabel,
              ),
            },
          ]}
          rows={[
            {
              label: t("discountOriginalPrice"),
              value: formatMoney(
                visibleResult.originalPrice,
                language,
                currencyLabel,
              ),
            },
            {
              label: t("discountAmount"),
              value: formatMoney(
                visibleResult.discountAmount,
                language,
                currencyLabel,
              ),
              color: colors.success,
            },
            {
              label: t("discountRateLabel"),
              value: formatPercent(visibleResult.discountRate, language),
            },
          ]}
        />
      )}
    </ScreenScrollContainer>
  );
}
