import BookUtilities from "@/features/installments/book-utilities";
import ScreenScrollContainer from "@/components/screen-scroll-container";
import CalculationResult from "@/components/tools/calculation-result";
import ClearInputsButton from "@/components/ui/clear-inputs-button";
import NumericInput from "@/components/ui/numeric-input";
import { useInstallmentBooks } from "@/features/tools/hooks/use-installment-books";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import {
    convertCurrency,
    type Currency,
} from "@/features/tools/calculators/currency";
import {
    createMonthlyInstallments,
    type Installment,
    type InstallmentPlan,
} from "@/features/tools/calculators/installment-book";
import { createDiscountStyles } from "@/features/tools/styles/discount.styles";
import { tools } from "@/features/tools/tools";
import {
    formatMoney,
    formatNumber,
} from "@/features/tools/utils/number-format";
import { parseNumber } from "@/features/tools/utils/number-parser";

import SavedInstallmentBook from "@/features/tools/components/saved-installment-book";
import { useLanguage } from "@/lib/providers/language-provider";
import { usePremium } from "@/lib/providers/premium-provider";
import { getColors, radius, spacing, useTheme } from "@/theme";

function getLocalToday(): string {
  const now = new Date();

  const year = String(now.getFullYear()).padStart(4, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

type Form = {
  title: string;
  amount: string;
  count: string;
  day: string;
  month: string;
  year: string;
};

const emptyForm: Form = {
  title: "",
  amount: "",
  count: "",
  day: "",
  month: "",
  year: "",
};

const dateFields = [
  { key: "day", label: "dateDay", maxLength: 2, example: "01" },
  { key: "month", label: "dateMonth", maxLength: 2, example: "01" },
  { key: "year", label: "dateYear", maxLength: 4, example: "1405" },
] as const;

export default function InstallmentBookScreen() {
  const { t, language, direction } = useLanguage();
  const { colorScheme } = useTheme();
  const { isPremium, isReady } = usePremium();

  const colors = getColors(colorScheme);
  const styles = createDiscountStyles(language, colors);

  const [form, setForm] = useState<Form>({ ...emptyForm });
  const [currency, setCurrency] = useState<Currency>("toman");
  const [installments, setInstallments] = useState<Installment[] | null>(null);
  const [hasError, setHasError] = useState(false);
  const books = useInstallmentBooks();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingPlan = books.plans.find(plan => plan.id === editingId);
  const termsLocked = Boolean(editingPlan?.installments.some(item => item.payment !== null));
  const showForm = books.isLoaded && (books.plans.length === 0 || formOpen);

  const [today, setToday] = useState(getLocalToday);

  useEffect(() => {
    const timer = setInterval(() => {
      setToday(getLocalToday());
    }, 60_000);

    return () => clearInterval(timer);
  }, []);

  const requiresPremium =
    tools.find((tool) => tool.id === "installment-book")?.access === "premium";

  const currencyLabel = currency === "toman" ? t("loanToman") : t("loanRial");

  const hasInput = Object.values(form).some((value) => value.trim() !== "");

  const isComplete = Object.values(form).every((value) => value.trim() !== "");

  const displayDigits = (value: string) =>
    language === "fa"
      ? value.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)])
      : value;

  const updateField = (field: keyof Form, value: string) => {
    if (books.isBusy || (termsLocked && field !== "title")) return;
    setForm((previous) => ({ ...previous, [field]: value }));
    setInstallments(null);
    setHasError(false);
  };

  const changeCurrency = (nextCurrency: Currency) => {
    if (books.isBusy || termsLocked || nextCurrency === currency) return;

    const amount = parseNumber(form.amount);

    if (amount !== null) {
      const converted = convertCurrency(amount, currency, nextCurrency);

      if (!Number.isFinite(converted)) {
        setHasError(true);
        return;
      }

      setForm((previous) => ({
        ...previous,
        amount: String(converted),
      }));
    }

    setCurrency(nextCurrency);
    setInstallments(null);
    setHasError(false);
  };

  const clearInputs = () => {
    setForm({ ...emptyForm });
    setInstallments(null);
    setHasError(false);
  };

  const openNew = () => {
    clearInputs();
    setEditingId(null);
    setFormOpen(true);
  };

  const cancelForm = () => {
    clearInputs();
    setEditingId(null);
    setFormOpen(false);
  };

  const openEdit = (plan: InstallmentPlan) => {
    const first = [...plan.installments].sort((a, b) => a.number - b.number)[0];
    const parts = new Intl.DateTimeFormat("en-US", {
      calendar: "persian", numberingSystem: "latn", year: "numeric", month: "numeric", day: "numeric", timeZone: "UTC",
    }).formatToParts(new Date(`${first.dueDate}T00:00:00Z`));
    const part = (type: string) => parts.find(item => item.type === type)?.value ?? "";
    setForm({ title: plan.title, amount: String(first.amount), count: String(plan.installments.length), day: part("day"), month: part("month"), year: part("year") });
    setCurrency(plan.currency);
    setInstallments(plan.installments);
    setHasError(false);
    setEditingId(plan.id);
    setFormOpen(true);
  };

  const savePlan = async () => {
    if (installments === null || !books.isLoaded || books.isBusy) return;
    const input = { title: form.title, currency, installments };
    const saved = editingId
      ? await books.updatePlan(editingId, input)
      : await books.addPlan(input);
    if (saved) cancelForm();
  };

  const showSchedule = () => {
    setInstallments(null);
    setHasError(false);

    const amount = parseNumber(form.amount);
    const count = parseNumber(form.count);
    const year = parseNumber(form.year);
    const month = parseNumber(form.month);
    const day = parseNumber(form.day);

    if (
      !form.title.trim() ||
      amount === null ||
      count === null ||
      year === null ||
      month === null ||
      day === null
    ) {
      setHasError(true);
      return;
    }

    try {
      if (termsLocked && editingPlan) {
        setInstallments(editingPlan.installments);
        return;
      }
      const result = createMonthlyInstallments({
        planId: "preview",
        amount,
        count,
        firstYear: year,
        firstMonth: month,
        firstDay: day,
      });

      setInstallments(result);
    } catch {
      setHasError(true);
    }
  };

  const dateFormatter = new Intl.DateTimeFormat(
    language === "fa" ? "fa-IR" : "en-US",
    {
      calendar: "persian",
      numberingSystem: language === "fa" ? "arabext" : "latn",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    },
  );

  if (requiresPremium && !isReady) return null;

  if (requiresPremium && !isPremium) {
    return <Redirect href="/premium" />;
  }

  return (
    <ScreenScrollContainer contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t("installmentBook")}</Text>
      {books.isLoaded && !showForm && (
        <Pressable accessibilityRole="button" disabled={books.isBusy} onPress={openNew} style={[localStyles.previewButton, { backgroundColor: colors.primarySoft }]}>
          <Text style={[styles.currencyText, { color: colors.primary }]}>{t("installmentNew")}</Text>
        </Pressable>
      )}
      {showForm && <>
      <Text style={styles.hint}>{t(editingId ? "installmentEdit" : "installmentBookHint")}</Text>
      {termsLocked && <Text style={styles.hint}>{t("installmentPaidEditHint")}</Text>}
      {books.plans.length > 0 && (
        <Pressable accessibilityRole="button" disabled={books.isBusy} onPress={cancelForm} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>{t("installmentCancel")}</Text>
        </Pressable>
      )}

      <View
        pointerEvents={books.isBusy ? "none" : "auto"}
        style={localStyles.formSection}
      >
        <View style={styles.currencyContainer}>
          {(["toman", "rial"] as const).map((item) => {
            const active = currency === item;

            return (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected: active, disabled: books.isBusy || termsLocked }}
                disabled={books.isBusy || termsLocked}
                onPress={() => changeCurrency(item)}
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
                  {item === "toman" ? t("loanToman") : t("loanRial")}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>{t("installmentPlanTitle")}</Text>

          <View style={styles.inputWrapper}>
            <TextInput
              editable={!books.isBusy}
              value={form.title}
              onChangeText={(value) => updateField("title", value)}
              accessibilityLabel={t("installmentPlanTitle")}
              placeholder={t("installmentTitlePlaceholder")}
              placeholderTextColor={colors.textMuted}
              maxLength={80}
              style={[
                styles.input,
                { textAlign: language === "fa" ? "right" : "left" },
              ]}
            />
          </View>

          <Text style={styles.label}>{t("installmentEachAmount")}</Text>

          <NumericInput
            editable={!books.isBusy && !termsLocked}
            value={form.amount}
            onChangeText={(value) => updateField("amount", value)}
            language={language}
            accessibilityLabel={`${t("installmentEachAmount")} (${currencyLabel})`}
            placeholder={displayDigits("1,000,000")}
            placeholderTextColor={colors.textMuted}
            containerStyle={styles.inputWrapper}
            inputStyle={styles.input}
            suffixStyle={styles.inputSuffix}
            suffix={currencyLabel}
            selectTextOnFocus
          />

          <Text style={styles.label}>{t("installmentCount")}</Text>

          <NumericInput
            editable={!books.isBusy && !termsLocked}
            value={form.count}
            onChangeText={(value) => updateField("count", value)}
            language={language}
            accessibilityLabel={t("installmentCount")}
            placeholder={displayDigits("12")}
            placeholderTextColor={colors.textMuted}
            containerStyle={styles.inputWrapper}
            inputStyle={styles.input}
            selectTextOnFocus
          />

          <Text style={styles.label}>{t("installmentFirstDue")}</Text>

          <View style={[localStyles.dateRow, { direction }]}>
            {dateFields.map((field) => (
              <View key={field.key} style={localStyles.dateColumn}>
                <Text style={[styles.label, localStyles.centered]}>
                  {t(field.label)}
                </Text>

                <View style={styles.inputWrapper}>
                  <TextInput
                    editable={!books.isBusy && !termsLocked}
                    value={form[field.key]}
                    onChangeText={(value) => updateField(field.key, value)}
                    accessibilityLabel={`${t("installmentFirstDue")}، ${t(field.label)}`}
                    keyboardType="number-pad"
                    maxLength={field.maxLength}
                    placeholder={displayDigits(field.example)}
                    placeholderTextColor={colors.textMuted}
                    style={[styles.input, localStyles.dateInput]}
                    selectTextOnFocus
                  />
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.hint}>{t("installmentScheduleHint")}</Text>

          {hasError && (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {t("installmentFormInvalid")}
            </Text>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !isComplete || books.isBusy }}
            disabled={!isComplete || books.isBusy}
            onPress={showSchedule}
            style={[
              localStyles.previewButton,
              {
                backgroundColor: isComplete
                  ? colors.primarySoft
                  : colors.background,
              },
            ]}
          >
            <Text
              style={[
                styles.currencyText,
                { color: isComplete ? colors.primary : colors.textMuted },
              ]}
            >
              {t("installmentPreview")}
            </Text>
          </Pressable>

          {!editingId && <ClearInputsButton
            onPress={clearInputs}
            disabled={!hasInput || books.isBusy}
          />}
        </View>

        {installments !== null && (
          <CalculationResult
            summaries={[
              {
                label: t("installmentTotal"),
                value: formatMoney(
                  installments.reduce((sum, item) => sum + item.amount, 0),
                  language,
                  currencyLabel,
                ),
              },
            ]}
            rows={[
              {
                label: t("installmentPlanTitle"),
                value: form.title.trim(),
              },
              {
                label: t("installmentCount"),
                value: formatNumber(installments.length, language, 0),
              },
              {
                label: t("installmentFirstDue"),
                value: dateFormatter.format(
                  new Date(`${installments[0].dueDate}T00:00:00Z`),
                ),
              },
              {
                label: t("installmentLastDue"),
                value: dateFormatter.format(
                  new Date(
                    `${installments[installments.length - 1].dueDate}T00:00:00Z`,
                  ),
                ),
              },
            ]}
          >
            <Text style={styles.hint}>{t("installmentPreviewOnly")}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{
                disabled: !books.isLoaded || books.isBusy,
              }}
              disabled={!books.isLoaded || books.isBusy}
              onPress={() => void savePlan()}
              style={[
                localStyles.previewButton,
                {
                  backgroundColor: colors.primarySoft,
                  opacity: !books.isLoaded || books.isBusy ? 0.5 : 1,
                },
              ]}
            >
              <Text style={[styles.currencyText, { color: colors.primary }]}>
                {t(books.isBusy ? "installmentSaving" : editingId ? "installmentSaveChanges" : "installmentSavePlan")}
              </Text>
            </Pressable>
          </CalculationResult>
        )}
      </View>

      </>}
      {!showForm && books.isLoaded && <Text style={styles.resultTitle}>{t("installmentSavedBooks")}</Text>}

      {books.isBusy && (
        <Text style={styles.hint}>{t("installmentSaving")}</Text>
      )}

      {books.hasStorageError && (
        <View style={styles.formCard}>
          <Text accessibilityRole="alert" style={styles.errorText}>
            {t("installmentStorageError")}
          </Text>

          <Pressable
            accessibilityRole="button"
            disabled={books.isBusy}
            onPress={() => void books.reload()}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>{t("installmentRetry")}</Text>
          </Pressable>
        </View>
      )}

      {!showForm && books.isLoaded && books.plans.length === 0 && (
        <Text style={styles.hint}>{t("installmentNoSavedBooks")}</Text>
      )}

      {!showForm && books.plans.map((plan) => (
        <SavedInstallmentBook
          key={plan.id}
          plan={plan}
          today={today}
          disabled={books.isBusy}
          onPaymentChange={books.setPayment}
          onEdit={openEdit}
          onDelete={books.deletePlan}
        />
      ))}
      <BookUtilities
        disabled={books.isBusy}
        loaded={books.isLoaded}
        plans={books.plans}
        restore={books.restorePlans}
        onRestored={cancelForm}
      />
    </ScreenScrollContainer>
  );
}

const localStyles = StyleSheet.create({
  formSection: {
    gap: spacing.md,
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
  dateInput: {
    textAlign: "center",
    writingDirection: "ltr",
  },
  previewButton: {
    minHeight: 48,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
});
