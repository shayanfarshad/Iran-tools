import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import NumericInput from "@/components/ui/numeric-input";
import { formatMoney } from "@/features/tools/utils/number-format";
import { parseNumber } from "@/features/tools/utils/number-parser";
import { spacing } from "@/theme";
import { allocateExpense, type ExpenseShare, type Trip, type TripExpense } from "./calculator";
import { TripAction, TripTextField, useTripUI } from "./controls";
import type { TripStore } from "./use-trips";

export default function ExpenseForm({ trip, expense, store, onDone }: { trip: Trip; expense?: TripExpense; store: TripStore; onDone: () => void }) {
  const { t, language, styles, colors } = useTripUI();
  const [title, setTitle] = useState(expense?.title ?? "");
  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  const [payerId, setPayer] = useState(expense?.payerId ?? trip.members[0].id);
  const [weighted, setWeighted] = useState(expense ? expense.shares.some(share => share.weight !== 1) : false);
  const [weights, setWeights] = useState(() => trip.members.map(member => String(expense?.shares.find(share => share.memberId === member.id)?.weight ?? 1)));
  const unit = t(trip.currency === "toman" ? "loanToman" : "loanRial");
  const parsed = parseNumber(amount);
  let shares: ExpenseShare[] | null = null;
  if (parsed !== null) {
    try {
      shares = allocateExpense(parsed, trip.members.map((member, index) => ({ memberId: member.id, weight: weighted ? parseNumber(weights[index]) ?? -1 : 1 })));
    } catch { /* Invalid input has no preview and cannot be saved. */ }
  }
  const save = () => {
    if (!shares || parsed === null || !title.trim()) return;
    void store.saveExpense(trip.id, { title: title.trim(), amount: parsed, payerId, shares }, expense?.id).then(saved => { if (saved) onDone(); });
  };
  return <View style={styles.formCard}>
    <Text style={styles.resultTitle}>{t(expense ? "tripEditExpense" : "tripAddExpense")}</Text>
    <TripTextField label={t("tripExpenseTitle")} value={title} onChange={setTitle} disabled={store.busy} placeholder={t("tripExpenseExample")} />
    <Text style={styles.label}>{t("tripAmount")}</Text>
    <NumericInput accessibilityLabel={t("tripAmount")} value={amount} onChangeText={setAmount} editable={!store.busy} language={language} suffix={unit} placeholder={language === "fa" ? "۱۰۰,۰۰۰" : "100,000"} placeholderTextColor={colors.textMuted} containerStyle={styles.inputWrapper} inputStyle={styles.input} suffixStyle={styles.inputSuffix} />
    <Text style={styles.label}>{t("tripPayer")}</Text>
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
      {trip.members.map(member => <Pressable key={member.id} accessibilityRole="button" accessibilityState={{ selected: payerId === member.id, disabled: store.busy }} disabled={store.busy} onPress={() => setPayer(member.id)} style={[styles.currencyButton, { flex: 0, paddingHorizontal: spacing.md }, payerId === member.id && styles.activeCurrencyButton]}><Text style={[styles.currencyText, payerId === member.id && styles.activeCurrencyText]}>{member.name}</Text></Pressable>)}
    </View>
    <View style={styles.currencyContainer}>
      {[false, true].map(mode => <Pressable key={String(mode)} accessibilityRole="button" accessibilityState={{ selected: weighted === mode, disabled: store.busy }} disabled={store.busy} onPress={() => setWeighted(mode)} style={[styles.currencyButton, weighted === mode && styles.activeCurrencyButton]}><Text style={[styles.currencyText, weighted === mode && styles.activeCurrencyText]}>{t(mode ? "tripWeighted" : "tripEqual")}</Text></Pressable>)}
    </View>
    {weighted && <>
      <Text style={styles.hint}>{t("tripWeightsHint")}</Text>
      {trip.members.map((member, index) => <View key={member.id}>
        <Text style={styles.label}>{member.name}</Text>
        <NumericInput accessibilityLabel={`${t("tripWeighted")} ${member.name}`} value={weights[index]} onChangeText={value => setWeights(previous => previous.map((old, position) => position === index ? value : old))} editable={!store.busy} language={language} containerStyle={styles.inputWrapper} inputStyle={styles.input} />
      </View>)}
    </>}
    {amount !== "" && !shares && <Text style={styles.errorText}>{t("tripInvalidExpense")}</Text>}
    {shares && <View style={styles.summaryCard}>
      <Text style={styles.label}>{t("tripShares")}</Text>
      {shares.map(share => <Text key={share.memberId} style={styles.summaryLabel}>{trip.members.find(member => member.id === share.memberId)?.name}: {formatMoney(share.amount, language, unit)}</Text>)}
      <Text style={styles.hint}>{t("tripRoundingHint")}</Text>
    </View>}
    <TripAction disabled={store.busy || !shares || !title.trim()} onPress={save}>{t("tripSaveExpense")}</TripAction>
    <TripAction disabled={store.busy} onPress={onDone}>{t("tripCancel")}</TripAction>
  </View>;
}
