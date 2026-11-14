import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import CalculationResult from "@/components/tools/calculation-result";
import { useLanguage } from "@/lib/providers/language-provider";
import { getColors, spacing, useTheme } from "@/theme";

import {
    getInstallmentStatus,
    summarizeInstallments,
    type InstallmentPlan,
} from "../calculators/installment-book";
import { createDiscountStyles } from "../styles/discount.styles";
import { formatMoney, formatNumber } from "../utils/number-format";

type Props = {
  plan: InstallmentPlan;
  today: string;
  disabled: boolean;
  onEdit: (plan: InstallmentPlan) => void;
  onDelete: (planId: string) => Promise<boolean>;
  onPaymentChange: (
    planId: string,
    installmentId: string,
    paid: boolean,
  ) => Promise<boolean>;
};

const statusKeys = {
  paid: "installmentStatusPaid",
  overdue: "installmentStatusOverdue",
  today: "installmentStatusToday",
  upcoming: "installmentStatusUpcoming",
} as const;

export default function SavedInstallmentBook({
  plan,
  today,
  disabled,
  onPaymentChange,
  onEdit,
  onDelete,
}: Props) {
  const { t, language } = useLanguage();
  const { colorScheme } = useTheme();

  const colors = getColors(colorScheme);
  const styles = createDiscountStyles(language, colors);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  const summary = summarizeInstallments(plan.installments, today);
  const currencyLabel =
    plan.currency === "toman" ? t("loanToman") : t("loanRial");

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

  const formatDate = (value: string) =>
    dateFormatter.format(new Date(`${value}T00:00:00Z`));

  const orderedInstallments = [...plan.installments].sort(
    (a, b) => a.number - b.number,
  );

  return (
    <View style={styles.formCard}>
      <Text style={styles.resultTitle}>{plan.title}</Text>
      <View style={styles.currencyContainer}>
        <Pressable accessibilityRole="button" disabled={disabled} onPress={() => onEdit(plan)} style={styles.currencyButton}>
          <Text style={styles.currencyText}>{t("installmentEdit")}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" disabled={disabled} onPress={() => setConfirmDelete(true)} style={styles.currencyButton}>
          <Text style={[styles.currencyText, { color: colors.danger }]}>{t("installmentDelete")}</Text>
        </Pressable>
      </View>
      {confirmDelete && (
        <View style={styles.formCard}>
          <Text style={styles.errorText}>{t("installmentDeleteConfirm")}</Text>
          <View style={styles.currencyContainer}>
            <Pressable accessibilityRole="button" disabled={disabled} onPress={async () => { if (await onDelete(plan.id)) setConfirmDelete(false); }} style={styles.currencyButton}>
              <Text style={[styles.currencyText, { color: colors.danger }]}>{t("installmentDelete")}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={disabled} onPress={() => setConfirmDelete(false)} style={styles.currencyButton}>
              <Text style={styles.currencyText}>{t("installmentCancel")}</Text>
            </Pressable>
          </View>
        </View>
      )}

      <CalculationResult
        summaries={[
          {
            label: t("installmentRemaining"),
            value: formatMoney(
              summary.remainingAmount,
              language,
              currencyLabel,
            ),
          },
        ]}
        rows={[
          {
            label: t("installmentPaidAmount"),
            value: formatMoney(summary.paidAmount, language, currencyLabel),
          },
          {
            label: t("installmentOverdueAmount"),
            value: formatMoney(summary.overdueAmount, language, currencyLabel),
            color: summary.overdueAmount > 0 ? colors.danger : colors.text,
          },
          {
            label: t("installmentPaidCount"),
            value:
              `${formatNumber(summary.paidCount, language, 0)} / ` +
              formatNumber(summary.totalCount, language, 0),
          },
          ...(summary.nextInstallment
            ? [
                {
                  label: t("installmentNextUnpaid"),
                  value: formatDate(summary.nextInstallment.dueDate),
                },
              ]
            : []),
        ]}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => {
          setExpanded((previous) => !previous);
          setVisibleCount(12);
        }}
        style={styles.clearButton}
      >
        <Text style={styles.clearButtonText}>
          {t(expanded ? "installmentHideDetails" : "installmentShowDetails")}
        </Text>
      </Pressable>

      {expanded &&
        orderedInstallments.slice(0, visibleCount).map((item) => {
          const status = getInstallmentStatus(item, today);
          const paid = item.payment !== null;

          const statusColor =
            status === "paid"
              ? colors.success
              : status === "overdue"
                ? colors.danger
                : status === "today"
                  ? colors.primary
                  : colors.textSecondary;

          return (
            <View
              key={item.id}
              style={[styles.formCard, { marginTop: spacing.sm }]}
            >
              <Text style={styles.label}>
                {t("installmentNumber")}{" "}
                {formatNumber(item.number, language, 0)}
              </Text>

              <Text style={styles.summaryValue}>
                {formatMoney(item.amount, language, currencyLabel)}
              </Text>

              <Text style={styles.summaryLabel}>
                {t("installmentDueDate")}: {formatDate(item.dueDate)}
              </Text>

              <Text style={[styles.summaryLabel, { color: statusColor }]}>
                {t(statusKeys[status])}
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled }}
                disabled={disabled}
                onPress={() => void onPaymentChange(plan.id, item.id, !paid)}
                style={[
                  styles.clearButton,
                  {
                    backgroundColor: colors.primarySoft,
                    opacity: disabled ? 0.5 : 1,
                  },
                ]}
              >
                <Text
                  style={[styles.clearButtonText, { color: colors.primary }]}
                >
                  {t(paid ? "installmentUndoPayment" : "installmentMarkPaid")}
                </Text>
              </Pressable>
            </View>
          );
        })}

      {expanded && visibleCount < orderedInstallments.length && (
        <Pressable
          accessibilityRole="button"
          onPress={() => setVisibleCount((count) => count + 12)}
          style={styles.clearButton}
        >
          <Text style={styles.clearButtonText}>{t("installmentShowMore")}</Text>
        </Pressable>
      )}
    </View>
  );
}
