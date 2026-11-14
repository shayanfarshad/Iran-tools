import { useState } from "react";
import { Redirect } from "expo-router";
import { Text } from "react-native";
import ScreenScrollContainer from "@/components/screen-scroll-container";
import { tools } from "@/features/tools/tools";
import { usePremium } from "@/lib/providers/premium-provider";
import { TripAction, useTripUI } from "@/features/trips/controls";
import TripForm from "@/features/trips/trip-form";
import SavedTrip from "@/features/trips/saved-trip";
import { useTrips } from "@/features/trips/use-trips";

export default function TripSplitScreen() {
  const { t, styles } = useTripUI();
  const { isReady, isPremium } = usePremium();
  const store = useTrips();
  const [creating, setCreating] = useState(false);
  const premium = tools.find(tool => tool.id === "trip-split")?.access === "premium";
  if (premium && !isReady) return null;
  if (premium && !isPremium) return <Redirect href="/premium" />;
  const showForm = store.ready && (store.trips.length === 0 || creating);
  return <ScreenScrollContainer contentContainerStyle={styles.container}>
    <Text style={styles.title}>{t("tripSplit")}</Text>
    <Text style={styles.hint}>{t("tripLocalHint")}</Text>
    {store.busy && <Text style={styles.hint}>{t("tripBusy")}</Text>}
    {store.error && <>
      <Text accessibilityRole="alert" style={styles.errorText}>{t("tripStorageError")}</Text>
      <TripAction disabled={store.busy} onPress={() => { void store.reload(); }}>{t("tripRetry")}</TripAction>
    </>}
    {showForm ? <TripForm store={store} onDone={() => setCreating(false)} onCancel={store.trips.length ? () => setCreating(false) : undefined} /> : store.ready && <>
      <TripAction disabled={store.busy} onPress={() => setCreating(true)}>{t("tripNew")}</TripAction>
      {store.trips.map(trip => <SavedTrip key={trip.id} trip={trip} store={store} />)}
    </>}
  </ScreenScrollContainer>;
}
