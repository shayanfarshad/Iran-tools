import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { formatNumber } from "@/features/tools/utils/number-format";
import { TripAction, TripTextField, useTripUI } from "./controls";
import type { Trip } from "./calculator";
import type { TripStore } from "./use-trips";

export default function TripForm({ store, onDone, onCancel }: { store: TripStore; onDone: () => void; onCancel?: () => void }) {
  const { t, language, styles } = useTripUI();
  const [title, setTitle] = useState("");
  const [names, setNames] = useState(["", ""]);
  const [currency, setCurrency] = useState<Trip["currency"]>("toman");
  const trimmed = names.map(name => name.trim());
  const valid = title.trim() !== "" && trimmed.every(Boolean) && new Set(trimmed.map(name => name.toLowerCase())).size === names.length;
  return <View style={styles.formCard}>
    <TripTextField label={t("tripName")} value={title} onChange={setTitle} disabled={store.busy} placeholder={t("tripNameExample")} />
    <View style={styles.currencyContainer}>
      {(["toman", "rial"] as const).map(unit => <Pressable key={unit} accessibilityRole="button" accessibilityState={{ selected: unit === currency, disabled: store.busy }} disabled={store.busy} onPress={() => setCurrency(unit)} style={[styles.currencyButton, currency === unit && styles.activeCurrencyButton]}><Text style={[styles.currencyText, currency === unit && styles.activeCurrencyText]}>{t(unit === "toman" ? "loanToman" : "loanRial")}</Text></Pressable>)}
    </View>
    <Text style={styles.hint}>{t("tripMembersHint")}</Text>
    {names.map((name, index) => <View key={index}>
      <TripTextField label={`${t("tripMember")} ${formatNumber(index + 1, language, 0)}`} value={name} disabled={store.busy} onChange={value => setNames(previous => previous.map((old, position) => position === index ? value : old))} />
      {names.length > 2 && <TripAction disabled={store.busy} onPress={() => setNames(previous => previous.filter((_, position) => position !== index))}>{t("tripRemoveMember")}</TripAction>}
    </View>)}
    {names.length < 30 && <TripAction disabled={store.busy} onPress={() => setNames(previous => [...previous, ""])}>{t("tripAddMember")}</TripAction>}
    <TripAction disabled={!valid || !store.ready || store.busy} onPress={() => { void store.createTrip(title, currency, trimmed).then(saved => { if (saved) onDone(); }); }}>{t("tripCreate")}</TripAction>
    {onCancel && <TripAction disabled={store.busy} onPress={onCancel}>{t("tripCancel")}</TripAction>}
  </View>;
}
