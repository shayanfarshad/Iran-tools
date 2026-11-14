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
    calculateLoan,
    type LoanPeriodUnit,
} from "@/features/tools/calculators/loan";
import { createLoanStyles } from "@/features/tools/styles/loan.styles";
import {
    formatMoney,
    formatNumber,
} from "@/features/tools/utils/number-format";
import { parseNumber } from "@/features/tools/utils/number-parser";
import { useLanguage } from "@/lib/providers/language-provider";
import { getColors, useTheme } from "@/theme";

export default function LoanScreen() {
  const { t, language } = useLanguage();
  const { colorScheme } = useTheme();

  const colors = getColors(colorScheme);
  const styles = createLoanStyles(language, colors);

  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [duration, setDuration] = useState("");

  const [currency, setCurrency] = useState<Currency>("toman");
  const [durationUnit, setDurationUnit] = useState<LoanPeriodUnit>("month");

  const currencyLabel = currency === "toman" ? t("loanToman") : t("loanRial");

  const durationLabel =
    durationUnit === "month" ? t("loanMonth") : t("loanYear");

  const amountPlaceholder = language === "fa" ? "۱,۰۰۰,۰۰۰" : "1,000,000";

  const interestPlaceholder = language === "fa" ? "۲۰" : "20";

  const durationPlaceholder = language === "fa" ? "۱۲" : "12";

  const parsedAmount = parseNumber(amount);
  const parsedInterestRate = parseNumber(interestRate);
  const parsedDuration = parseNumber(duration);

  const hasInput =
    amount.length > 0 || interestRate.length > 0 || duration.length > 0;

  const calculation = useMemo(() => {
    if (
      parsedAmount === null ||
      parsedInterestRate === null ||
      parsedDuration === null
    ) {
      return {
        result: null,
        error: null as string | null,
      };
    }

    if (parsedAmount <= 0) {
      return {
        result: null,
        error: t("loanAmountPositive"),
      };
    }

    if (parsedInterestRate < 0) {
      return {
        result: null,
        error: t("loanInterestNegative"),
      };
    }

    if (parsedDuration <= 0) {
      return {
        result: null,
        error: t("loanDurationPositive"),
      };
    }

    try {
      const principalInToman = convertCurrency(parsedAmount, currency, "toman");

      const result = calculateLoan({
        principal: principalInToman,
        annualInterestRate: parsedInterestRate,
        duration: parsedDuration,
        durationUnit,
      });

      return {
        result: {
          ...result,
          monthlyPayment: convertCurrency(
            result.monthlyPayment,
            "toman",
            currency,
          ),
          totalPayment: convertCurrency(result.totalPayment, "toman", currency),
          totalInterest: convertCurrency(
            result.totalInterest,
            "toman",
            currency,
          ),
        },
        error: null as string | null,
      };
    } catch {
      return {
        result: null,
        error: t("loanInvalidNumber"),
      };
    }
  }, [
    parsedAmount,
    parsedInterestRate,
    parsedDuration,
    currency,
    durationUnit,
    t,
  ]);

  const clearForm = () => {
    setAmount("");
    setInterestRate("");
    setDuration("");
  };

  const currencyOptions: {
    value: Currency;
    label: string;
  }[] = [
    { value: "toman", label: t("loanToman") },
    { value: "rial", label: t("loanRial") },
  ];

  const durationOptions: {
    value: LoanPeriodUnit;
    label: string;
  }[] = [
    { value: "month", label: t("loanMonth") },
    { value: "year", label: t("loanYear") },
  ];

  return (
    <ScreenScrollContainer
      style={styles.screen}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>{t("loanTitle")}</Text>
      <Text style={styles.hint}>{t("loanHint")}</Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>{t("loanAmount")}</Text>

        <NumericInput
          value={amount}
          onChangeText={setAmount}
          language={language}
          suffix={currencyLabel}
          placeholder={amountPlaceholder}
          placeholderTextColor={colors.textMuted}
          containerStyle={styles.inputWrapper}
          inputStyle={styles.input}
          suffixStyle={styles.inputSuffix}
        />

        <Text style={styles.label}>{t("loanInterestRate")}</Text>

        <NumericInput
          value={interestRate}
          onChangeText={setInterestRate}
          language={language}
          suffix={language === "fa" ? "درصد" : "%"}
          placeholder={interestPlaceholder}
          placeholderTextColor={colors.textMuted}
          containerStyle={styles.inputWrapper}
          inputStyle={styles.input}
          suffixStyle={styles.inputSuffix}
        />

        <Text style={styles.label}>{t("loanDuration")}</Text>

        <NumericInput
          value={duration}
          onChangeText={setDuration}
          language={language}
          suffix={durationLabel}
          placeholder={durationPlaceholder}
          placeholderTextColor={colors.textMuted}
          containerStyle={styles.inputWrapper}
          inputStyle={styles.input}
          suffixStyle={styles.inputSuffix}
        />

        <View style={styles.periodContainer}>
          {durationOptions.map((option) => {
            const isActive = durationUnit === option.value;

            return (
              <Pressable
                key={option.value}
                style={[
                  styles.periodButton,
                  isActive && styles.activePeriodButton,
                ]}
                onPress={() => setDurationUnit(option.value)}
              >
                <Text
                  style={[
                    styles.periodText,
                    isActive && styles.activePeriodText,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>{t("loanCurrency")}</Text>

        <View style={styles.currencyContainer}>
          {currencyOptions.map((option) => {
            const isActive = currency === option.value;

            return (
              <Pressable
                key={option.value}
                style={[
                  styles.currencyButton,
                  isActive && styles.activeCurrencyButton,
                ]}
                onPress={() => setCurrency(option.value)}
              >
                <Text
                  style={[
                    styles.currencyText,
                    isActive && styles.activeCurrencyText,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ClearInputsButton onPress={clearForm} disabled={!hasInput} />
      </View>

      {calculation.error ? (
        <Text style={styles.errorText}>{calculation.error}</Text>
      ) : null}

      {calculation.result !== null && (
        <CalculationResult
          summaries={[
            {
              label: t("loanMonthlyPayment"),
              value: formatMoney(
                calculation.result.monthlyPayment,
                language,
                currencyLabel,
              ),
            },
          ]}
          rows={[
            {
              label: t("loanTotalPayment"),
              value: formatMoney(
                calculation.result.totalPayment,
                language,
                currencyLabel,
              ),
            },
            {
              label: t("loanTotalInterest"),
              value: formatMoney(
                calculation.result.totalInterest,
                language,
                currencyLabel,
              ),
            },
            {
              label: t("loanNumberOfPayments"),
              value: formatNumber(
                calculation.result.numberOfPayments,
                language,
                0,
              ),
            },
          ]}
        />
      )}
    </ScreenScrollContainer>
  );
}
