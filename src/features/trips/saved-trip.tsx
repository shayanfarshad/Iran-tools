import { useState } from "react";
import { Text, View } from "react-native";
import CalculationResult from "@/components/tools/calculation-result";
import { formatMoney, formatNumber } from "@/features/tools/utils/number-format";
import { summarizeTrip, type Trip } from "./calculator";
import { TripAction, TripDelete, useTripUI } from "./controls";
import ExpenseForm from "./expense-form";
import type { TripStore } from "./use-trips";

export default function SavedTrip({ trip, store }: { trip: Trip; store: TripStore }) {
  const { t, language, styles, colors } = useTripUI();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [limit, setLimit] = useState(10);
  const summary = summarizeTrip(trip);
  const unit = t(trip.currency === "toman" ? "loanToman" : "loanRial");
  const name = (id: string) => trip.members.find(member => member.id === id)!.name;
  return <View style={styles.formCard}>
    <Text style={styles.resultTitle}>{trip.title}</Text>
    <Text style={styles.hint}>{trip.members.map(member => member.name).join(language === "fa" ? "، " : ", ")}</Text>
    <Text style={styles.summaryValue}>{formatMoney(summary.total, language, unit)}</Text>
    <Text style={styles.hint}>{t("tripExpenseCount")}: {formatNumber(trip.expenses.length, language, 0)}</Text>
    <TripAction disabled={store.busy} onPress={() => setExpanded(previous => !previous)}>{t(expanded ? "tripClose" : "tripOpen")}</TripAction>
    <TripDelete disabled={store.busy} message={t("tripDeleteConfirm")} onDelete={() => store.deleteTrip(trip.id)} />
    {expanded && <>
      {editing === null ? <TripAction disabled={store.busy} onPress={() => setEditing("new")}>{t("tripAddExpense")}</TripAction> : <ExpenseForm key={editing} trip={trip} expense={trip.expenses.find(expense => expense.id === editing)} store={store} onDone={() => setEditing(null)} />}
      {trip.expenses.length > 0 && <>
        <CalculationResult summaries={[{ label: t("tripTotal"), value: formatMoney(summary.total, language, unit) }]} rows={trip.members.map(member => {
          const balance = summary.balances.get(member.id)!;
          return { label: `${member.name} — ${t(balance > 0 ? "tripCreditor" : balance < 0 ? "tripDebtor" : "tripBalanced")}`, value: formatMoney(Math.abs(balance), language, unit), color: balance > 0 ? colors.success : balance < 0 ? colors.danger : colors.text };
        })} />
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>{t("tripSettlements")}</Text>
          <Text style={styles.hint}>{t("tripSettlementHint")}</Text>
          {summary.settlements.length === 0 && <Text style={styles.summaryLabel}>{t("tripBalanced")}</Text>}
          {summary.settlements.map((item, index) => <View key={index} style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{t("tripFrom")}: {name(item.from)} · {t("tripTo")}: {name(item.to)}</Text>
            <Text style={styles.summaryValue}>{formatMoney(item.amount, language, unit)}</Text>
          </View>)}
        </View>
      </>}
      <Text style={styles.resultTitle}>{t("tripExpenses")}</Text>
      {trip.expenses.length === 0 && <Text style={styles.hint}>{t("tripNoExpenses")}</Text>}
      {[...trip.expenses].reverse().slice(0, limit).map(expense => <View key={expense.id} style={styles.formCard}>
        <Text style={styles.label}>{expense.title}</Text>
        <Text style={styles.summaryValue}>{formatMoney(expense.amount, language, unit)}</Text>
        <Text style={styles.hint}>{t("tripPayer")}: {name(expense.payerId)}</Text>
        {expense.shares.filter(share => share.weight > 0).map(share => <Text key={share.memberId} style={styles.summaryLabel}>{name(share.memberId)}: {formatMoney(share.amount, language, unit)}</Text>)}
        <TripAction disabled={store.busy || editing !== null} onPress={() => setEditing(expense.id)}>{t("tripEditExpense")}</TripAction>
        <TripDelete disabled={store.busy || editing !== null} message={t("tripDeleteExpenseConfirm")} onDelete={() => store.deleteExpense(trip.id, expense.id)} />
      </View>)}
      {limit < trip.expenses.length && <TripAction onPress={() => setLimit(previous => previous + 10)}>{t("tripMore")}</TripAction>}
    </>}
  </View>;
}
