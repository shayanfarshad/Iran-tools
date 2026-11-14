import { Redirect } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import ScreenScrollContainer from "@/components/screen-scroll-container";
import CalculationResult from "@/components/tools/calculation-result";
import ClearInputsButton from "@/components/ui/clear-inputs-button";

import {
  calculateDateDifference,
  type CalendarType,
} from "@/features/tools/calculators/date-calculator";
import { createDiscountStyles } from "@/features/tools/styles/discount.styles";
import { tools } from "@/features/tools/tools";
import { formatNumber } from "@/features/tools/utils/number-format";
import { parseNumber } from "@/features/tools/utils/number-parser";

import type { TranslationKey } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/providers/language-provider";
import { usePremium } from "@/lib/providers/premium-provider";
import { getColors, radius, spacing, useTheme } from "@/theme";

type DateFields = {
  day: string;
  month: string;
  year: string;
};

const emptyDate: DateFields = {
  day: "",
  month: "",
  year: "",
};

const calendarOptions: {
  value: CalendarType;
  label: TranslationKey;
}[] = [
  { value: "persian", label: "calendarPersian" },
  { value: "islamic-civil", label: "calendarHijri" },
  { value: "gregory", label: "calendarGregorian" },
];

const dateFields: {
  key: keyof DateFields;
  label: TranslationKey;
  maxLength: number;
}[] = [
  { key: "day", label: "dateDay", maxLength: 2 },
  { key: "month", label: "dateMonth", maxLength: 2 },
  { key: "year", label: "dateYear", maxLength: 4 },
];

const requiresPremium =
  tools.find((tool) => tool.id === "date-calculator")?.access === "premium";

export default function DateCalculatorScreen() {
  const { t, language, direction } = useLanguage();
  const { colorScheme } = useTheme();
  const { isPremium, isReady } = usePremium();

  const colors = getColors(colorScheme);
  const styles = createDiscountStyles(language, colors);

  const [calendar, setCalendar] = useState<CalendarType>("persian");
  const [start, setStart] = useState<DateFields>(emptyDate);
  const [end, setEnd] = useState<DateFields>(emptyDate);

  const hasInput = [...Object.values(start), ...Object.values(end)].some(
    (value) => value.trim() !== "",
  );

  const calculation = useMemo(() => {
    const inputs = [
      start.year,
      start.month,
      start.day,
      end.year,
      end.month,
      end.day,
    ];

    if (inputs.some((value) => value.trim() === "")) {
      return { result: null, error: null };
    }

    const numbers = inputs.map(parseNumber);

    if (numbers.some((value) => value === null)) {
      return {
        result: null,
        error: "dateInvalid" as TranslationKey,
      };
    }

    try {
      const [sy, sm, sd, ey, em, ed] = numbers as number[];

      return {
        result: calculateDateDifference(sy, sm, sd, ey, em, ed, calendar),
        error: null,
      };
    } catch (error) {
      const errorKey: TranslationKey =
        error instanceof Error && error.message === "unsupported-calendar"
          ? "dateCalendarUnsupported"
          : "dateInvalid";

      return { result: null, error: errorKey };
    }
  }, [start, end, calendar]);

  const clearInputs = () => {
    setStart({ ...emptyDate });
    setEnd({ ...emptyDate });
  };

  const changeCalendar = (nextCalendar: CalendarType) => {
    if (nextCalendar === calendar) return;

    setCalendar(nextCalendar);
    clearInputs();
  };

  const placeholderYear =
    calendar === "gregory" ? 2026 : calendar === "islamic-civil" ? 1448 : 1405;

  const placeholder = (field: keyof DateFields) => {
    const value = field === "year" ? String(placeholderYear) : "01";

    return language === "fa"
      ? value.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)])
      : value;
  };

  const fillToday = () => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      calendar,
      numberingSystem: "latn",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });

    const parts = formatter.formatToParts(new Date());

    const read = (type: "year" | "month" | "day") =>
      parts.find((part) => part.type === type)?.value ?? "";

    setEnd({
      day: read("day"),
      month: read("month"),
      year: read("year"),
    });
  };

  const renderDateRow = (
    title: TranslationKey,
    value: DateFields,
    onChange: (next: DateFields) => void,
    onToday?: () => void,
  ) => (
    <View style={localStyles.dateGroup}>
      <View style={[localStyles.dateHeader, { direction }]}>
        <Text style={styles.label}>{t(title)}</Text>

        {onToday && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("dateToday")}
            onPress={onToday}
            style={[
              localStyles.todayButton,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <Text style={[styles.currencyText, { color: colors.primary }]}>
              {t("dateToday")}
            </Text>
          </Pressable>
        )}
      </View>

      <View style={[localStyles.dateRow, { direction }]}>
        {dateFields.map((field) => (
          <View key={field.key} style={localStyles.dateColumn}>
            <Text style={[styles.label, localStyles.centered]}>
              {t(field.label)}
            </Text>

            <View style={[styles.inputWrapper, localStyles.dateInputWrapper]}>
              <TextInput
                value={value[field.key]}
                onChangeText={(text) =>
                  onChange({ ...value, [field.key]: text })
                }
                accessibilityLabel={`${t(title)}، ${t(field.label)}`}
                keyboardType="number-pad"
                maxLength={field.maxLength}
                placeholder={placeholder(field.key)}
                placeholderTextColor={colors.textMuted}
                style={[styles.input, localStyles.dateInput]}
                selectTextOnFocus
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  if (requiresPremium && !isReady) return null;

  if (requiresPremium && !isPremium) {
    return <Redirect href="/premium" />;
  }

  return (
    <ScreenScrollContainer contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t("dateCalculator")}</Text>
      <Text style={styles.hint}>{t("dateHint")}</Text>

      <View style={styles.currencyContainer}>
        {calendarOptions.map((option) => {
          const active = calendar === option.value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => changeCalendar(option.value)}
              style={[
                styles.currencyButton,
                active && styles.activeCurrencyButton,
              ]}
            >
              <Text
                style={[
                  styles.currencyText,
                  active && styles.activeCurrencyText,
                ]}
              >
                {t(option.label)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {calendar === "islamic-civil" && (
        <Text style={styles.hint}>{t("dateHijriHint")}</Text>
      )}

      <View style={styles.formCard}>
        {renderDateRow("dateStart", start, setStart)}
        {renderDateRow("dateEnd", end, setEnd, fillToday)}

        {calculation.error && (
          <Text accessibilityRole="alert" style={styles.errorText}>
            {t(calculation.error)}
          </Text>
        )}

        <ClearInputsButton onPress={clearInputs} disabled={!hasInput} />
      </View>

      {calculation.result !== null && (
        <CalculationResult
          summaries={[
            {
              label: t("elapsedDays"),
              value: formatNumber(calculation.result[0], language, 0),
            },
            {
              label: t("completedYears"),
              value: formatNumber(calculation.result[1], language, 0),
            },
          ]}
        />
      )}
    </ScreenScrollContainer>
  );
}

const localStyles = StyleSheet.create({
  dateGroup: {
    gap: spacing.sm,
  },
  dateRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  dateColumn: {
    flex: 1,
    minWidth: 0,
    gap: spacing.sm,
  },
  centered: {
    textAlign: "center",
  },
  dateInputWrapper: {
    paddingHorizontal: spacing.sm,
  },
  dateInput: {
    textAlign: "center",
    writingDirection: "ltr",
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  todayButton: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
});
