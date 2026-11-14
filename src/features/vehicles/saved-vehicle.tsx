import { useState } from "react";
import { Text, View } from "react-native";
import CalculationResult from "@/components/tools/calculation-result";
import { formatMoney, formatNumber } from "../tools/utils/number-format";
import { Action, categoryKeys, Choices, DeleteAction, formatDate, useVehicleUI } from "./controls";
import { ExpenseForm, ReminderForm, VehicleForm } from "./forms";
import type { Vehicle, VehicleExpense, VehicleReminder } from "./model";
import MonthlyReport from "./monthly-report";
import type { VehicleStore } from "./use-vehicles";

type Editor = { kind: "vehicle" } | { kind: "expense"; item?: VehicleExpense } | { kind: "reminder"; item?: VehicleReminder } | null;

export default function SavedVehicle({ vehicle, store, today }: { vehicle: Vehicle; store: VehicleStore; today: string }) {
  const { t, styles, colors, language } = useVehicleUI();
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<"expenses" | "reminders" | "report">("expenses");
  const [editor, setEditor] = useState<Editor>(null);
  const [visible, setVisible] = useState(10);
  const unit = t(vehicle.currency === "toman" ? "loanToman" : "loanRial");
  const next = vehicle.reminders.filter(item => !item.done).sort((a, b) => a.date.localeCompare(b.date))[0];
  const expenses = [...vehicle.expenses].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const reminders = [...vehicle.reminders].sort((a, b) => Number(a.done) - Number(b.done) || a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  const done = () => { setEditor(null); setVisible(10); };

  if (editor?.kind === "vehicle") return <VehicleForm vehicle={vehicle} store={store} onDone={done} onCancel={done} />;
  if (editor?.kind === "expense") return <View style={styles.formCard}>
    <Text style={styles.resultTitle}>{vehicle.name}</Text>
    <ExpenseForm vehicle={vehicle} expense={editor.item} store={store} onDone={done} />
  </View>;
  if (editor?.kind === "reminder") return <View style={styles.formCard}>
    <Text style={styles.resultTitle}>{vehicle.name}</Text>
    <ReminderForm vehicle={vehicle} reminder={editor.item} store={store} onDone={done} />
  </View>;

  return <View style={styles.formCard}>
    <Text style={styles.resultTitle}>{vehicle.name}</Text>
    <Text style={styles.hint}>{unit} · {t("vehicleExpenseCount")}: {formatNumber(vehicle.expenses.length, language, 0)}</Text>
    {vehicle.expenses.length > 0 && <CalculationResult summaries={[{
      label: t("vehicleTotal"), value: formatMoney(vehicle.expenses.reduce((sum, item) => sum + item.amount, 0), language, unit),
    }]} />}
    {next && <Text style={[styles.hint, next.date < today && { color: colors.danger }]}>
      {t("vehicleNextDue")}: {next.title} · {formatDate(next.date, language)}
    </Text>}
    <Action disabled={store.busy} onPress={() => { setExpanded(!expanded); setVisible(10); }}>
      {t(expanded ? "vehicleClose" : "vehicleManage")}
    </Action>
    {expanded && <>
      <Action disabled={store.busy} onPress={() => setEditor({ kind: "vehicle" })}>{t("vehicleEdit")}</Action>
      <DeleteAction disabled={store.busy} message={t("vehicleDeleteConfirm")} onDelete={() => store.deleteVehicle(vehicle.id)} />
      <Choices options={[
        { value: "expenses", label: t("vehicleExpenses") },
        { value: "reminders", label: t("vehicleReminders") },
        { value: "report", label: t("vehicleReport") },
      ]} value={tab} onChange={value => { setTab(value); setVisible(10); }} disabled={store.busy} />
      {tab === "expenses" && <>
        <Action disabled={store.busy} onPress={() => setEditor({ kind: "expense" })}>{t("vehicleAddExpense")}</Action>
        {!expenses.length && <Text style={styles.hint}>{t("vehicleNoExpenses")}</Text>}
        {expenses.slice(0, visible).map(item => <View key={item.id} style={styles.formCard}>
          <Text style={styles.resultTitle}>{item.title}</Text>
          <Text style={styles.summaryValue}>{formatMoney(item.amount, language, unit)}</Text>
          <Text style={styles.hint}>{t(categoryKeys[item.category])} · {formatDate(item.date, language)}</Text>
          {item.odometer !== null && <Text style={styles.hint}>{t("vehicleMileage")}: {formatNumber(item.odometer, language, 0)} {t("vehicleKm")}</Text>}
          <Action disabled={store.busy} onPress={() => setEditor({ kind: "expense", item })}>{t("vehicleEditExpense")}</Action>
          <DeleteAction disabled={store.busy} message={t("vehicleExpenseDeleteConfirm")} onDelete={() => store.deleteExpense(vehicle.id, item.id)} />
        </View>)}
        {expenses.length > visible && <Action onPress={() => setVisible(visible + 10)}>{t("vehicleMore")}</Action>}
      </>}
      {tab === "reminders" && <>
        <Action disabled={store.busy} onPress={() => setEditor({ kind: "reminder" })}>{t("vehicleAddReminder")}</Action>
        <Text style={styles.hint}>{t("vehicleReminderCompletionHint")}</Text>
        {!reminders.length && <Text style={styles.hint}>{t("vehicleNoReminders")}</Text>}
        {reminders.slice(0, visible).map(item => <View key={item.id} style={styles.formCard}>
          <Text style={styles.resultTitle}>{item.title}</Text>
          <Text style={styles.hint}>{t(item.kind === "service" ? "vehicleService" : "vehicleInsurance")} · {formatDate(item.date, language)}</Text>
          <Text style={[styles.label, { color: item.done ? colors.success : item.date < today ? colors.danger : colors.primary }]}>
            {t(item.done ? "vehicleDone" : item.date < today ? "vehicleOverdue" : item.date === today ? "vehicleDueToday" : "vehicleUpcoming")}
          </Text>
          <Action disabled={store.busy} onPress={() => { void store.setReminderDone(vehicle.id, item.id, !item.done); }}>{t(item.done ? "vehicleUndoDone" : "vehicleMarkDone")}</Action>
          <Action disabled={store.busy} onPress={() => setEditor({ kind: "reminder", item })}>{t("vehicleEditReminder")}</Action>
          <DeleteAction disabled={store.busy} message={t("vehicleReminderDeleteConfirm")} onDelete={() => store.deleteReminder(vehicle.id, item.id)} />
        </View>)}
        {reminders.length > visible && <Action onPress={() => setVisible(visible + 10)}>{t("vehicleMore")}</Action>}
      </>}
      {tab === "report" && <MonthlyReport vehicle={vehicle} today={today} />}
    </>}
  </View>;
}
