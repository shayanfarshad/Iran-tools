import { useState } from "react";
import { Text, View } from "react-native";
import ClearInputsButton from "@/components/ui/clear-inputs-button";
import { parseNumber } from "../tools/utils/number-parser";
import { Action, categoryKeys, Choices, DateInput, NumberField, TextField, useVehicleUI } from "./controls";
import { expenseCategories, localToday, parseDateFields, persianFields, type Vehicle, type VehicleExpense, type VehicleReminder } from "./model";
import type { VehicleStore } from "./use-vehicles";

export function VehicleForm({ vehicle, store, onDone, onCancel }: {
  vehicle?: Vehicle; store: VehicleStore; onDone: () => void; onCancel?: () => void;
}) {
  const { t, styles } = useVehicleUI();
  const [name, setName] = useState(vehicle?.name ?? "");
  const [currency, setCurrency] = useState<Vehicle["currency"]>(vehicle?.currency ?? "toman");
  const locked = Boolean(vehicle?.expenses.length);
  return <View style={styles.formCard}>
    <Text style={styles.resultTitle}>{t(vehicle ? "vehicleEdit" : "vehicleNew")}</Text>
    <TextField label={t("vehicleName")} placeholder={t("vehicleNameExample")} value={name} onChange={setName} disabled={store.busy} />
    <Choices options={[{ value: "toman", label: t("loanToman") }, { value: "rial", label: t("loanRial") }]} value={currency} onChange={setCurrency} disabled={store.busy || locked} />
    {locked && <Text style={styles.hint}>{t("vehicleCurrencyLocked")}</Text>}
    <Action disabled={store.busy || !name.trim()} onPress={() => {
      void store.saveVehicle(name, currency, vehicle?.id).then(saved => { if (saved) onDone(); });
    }}>{t("vehicleSave")}</Action>
    {!vehicle && <ClearInputsButton disabled={store.busy || !name} onPress={() => setName("")} />}
    {onCancel && <Action disabled={store.busy} onPress={onCancel}>{t("vehicleCancel")}</Action>}
  </View>;
}

export function ExpenseForm({ vehicle, expense, store, onDone }: {
  vehicle: Vehicle; expense?: VehicleExpense; store: VehicleStore; onDone: () => void;
}) {
  const { t, styles } = useVehicleUI();
  const [title, setTitle] = useState(expense?.title ?? "");
  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  const [odometer, setOdometer] = useState(expense?.odometer == null ? "" : String(expense.odometer));
  const [category, setCategory] = useState(expense?.category ?? "fuel");
  const [date, setDate] = useState(() => persianFields(expense?.date ?? localToday()));
  const [invalid, setInvalid] = useState(false);
  const unit = t(vehicle.currency === "toman" ? "loanToman" : "loanRial");
  const complete = title.trim() && amount.trim() && Object.values(date).every(Boolean);
  const save = async () => {
    setInvalid(false);
    let input: Omit<VehicleExpense, "id">;
    try {
      const parsed = parseNumber(amount);
      const km = odometer.trim() ? parseNumber(odometer) : null;
      const day = parseDateFields(date);
      if (!title.trim() || parsed === null || !Number.isSafeInteger(parsed) || parsed <= 0 || day > localToday() ||
        (odometer.trim() && (km === null || !Number.isSafeInteger(km) || km < 0))) throw new Error("invalid-expense");
      const total = vehicle.expenses.filter(item => item.id !== expense?.id).reduce((sum, item) => sum + item.amount, 0) + parsed;
      if (!Number.isSafeInteger(total)) throw new Error("amount-overflow");
      input = { title, category, amount: parsed, date: day, odometer: km };
    } catch { setInvalid(true); return; }
    if (await store.saveExpense(vehicle.id, input, expense?.id)) onDone();
  };
  const clear = () => {
    setTitle(""); setAmount(""); setOdometer(""); setCategory("fuel");
    setDate(persianFields(localToday())); setInvalid(false);
  };
  const hasInput = Boolean(title || amount || odometer || category !== "fuel" || JSON.stringify(date) !== JSON.stringify(persianFields(localToday())));
  return <View style={styles.formCard}>
    <Text style={styles.resultTitle}>{t(expense ? "vehicleEditExpense" : "vehicleAddExpense")}</Text>
    <Choices options={expenseCategories.map(value => ({ value, label: t(categoryKeys[value]) }))} value={category} onChange={setCategory} disabled={store.busy} />
    <TextField label={t("vehicleExpenseTitle")} value={title} onChange={setTitle} disabled={store.busy} placeholder={t("vehicleExpenseExample")} />
    <NumberField label={t("vehicleAmount")} value={amount} onChange={setAmount} disabled={store.busy} suffix={unit} placeholder="500,000" />
    <DateInput label={t("vehicleExpenseDate")} value={date} onChange={setDate} disabled={store.busy} />
    <NumberField label={t("vehicleOdometer")} value={odometer} onChange={setOdometer} disabled={store.busy} suffix={t("vehicleKm")} placeholder="50,000" />
    {invalid && <Text accessibilityRole="alert" style={styles.errorText}>{t("vehicleExpenseInvalid")}</Text>}
    <Action disabled={store.busy || !complete} onPress={() => { void save(); }}>{t("vehicleSave")}</Action>
    {!expense && <ClearInputsButton disabled={store.busy || !hasInput} onPress={clear} />}
    <Action disabled={store.busy} onPress={onDone}>{t("vehicleCancel")}</Action>
  </View>;
}

export function ReminderForm({ vehicle, reminder, store, onDone }: {
  vehicle: Vehicle; reminder?: VehicleReminder; store: VehicleStore; onDone: () => void;
}) {
  const { t, styles } = useVehicleUI();
  const [title, setTitle] = useState(reminder?.title ?? "");
  const [kind, setKind] = useState<VehicleReminder["kind"]>(reminder?.kind ?? "service");
  const [date, setDate] = useState(() => reminder ? persianFields(reminder.date) : { day: "", month: "", year: "" });
  const [invalid, setInvalid] = useState(false);
  const save = async () => {
    setInvalid(false);
    let day: string;
    try { day = parseDateFields(date); if (!title.trim()) throw new Error("empty-title"); }
    catch { setInvalid(true); return; }
    if (await store.saveReminder(vehicle.id, { title, kind, date: day }, reminder?.id)) onDone();
  };
  return <View style={styles.formCard}>
    <Text style={styles.resultTitle}>{t(reminder ? "vehicleEditReminder" : "vehicleAddReminder")}</Text>
    <Choices options={[{ value: "service", label: t("vehicleService") }, { value: "insurance", label: t("vehicleInsurance") }]} value={kind} onChange={setKind} disabled={store.busy} />
    <TextField label={t("vehicleReminderName")} value={title} onChange={setTitle} disabled={store.busy} placeholder={t("vehicleReminderExample")} />
    <DateInput label={t("vehicleDueDate")} value={date} onChange={setDate} disabled={store.busy} />
    <Text style={styles.hint}>{t("vehicleReminderFormHint")}</Text>
    {invalid && <Text accessibilityRole="alert" style={styles.errorText}>{t("vehicleReminderInvalid")}</Text>}
    <Action disabled={store.busy || !title.trim() || !Object.values(date).every(Boolean)} onPress={() => { void save(); }}>{t("vehicleSave")}</Action>
    {!reminder && <ClearInputsButton disabled={store.busy || !(title || Object.values(date).some(Boolean) || kind !== "service")} onPress={() => {
      setTitle(""); setKind("service"); setDate({ day: "", month: "", year: "" }); setInvalid(false);
    }} />}
    <Action disabled={store.busy} onPress={onDone}>{t("vehicleCancel")}</Action>
  </View>;
}
