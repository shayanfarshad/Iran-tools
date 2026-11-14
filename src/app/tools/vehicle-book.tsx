import { useEffect, useState } from "react";
import { AppState, Text } from "react-native";
import { Redirect } from "expo-router";
import ScreenScrollContainer from "@/components/screen-scroll-container";
import { tools } from "@/features/tools/tools";
import { usePremium } from "@/lib/providers/premium-provider";
import { Action, useVehicleUI } from "@/features/vehicles/controls";
import { VehicleForm } from "@/features/vehicles/forms";
import { localToday } from "@/features/vehicles/model";
import ReminderSettings from "@/features/vehicles/reminder-settings";
import SavedVehicle from "@/features/vehicles/saved-vehicle";
import { useVehicles } from "@/features/vehicles/use-vehicles";

export default function VehicleBookScreen() {
  const { t, styles } = useVehicleUI();
  const { isPremium, isReady } = usePremium();
  const store = useVehicles();
  const [creating, setCreating] = useState(false);
  const [today, setToday] = useState(() => localToday());
  useEffect(() => {
    const refresh = () => setToday(localToday());
    const timer = setInterval(refresh, 60_000);
    const subscription = AppState.addEventListener("change", state => { if (state === "active") refresh(); });
    return () => { clearInterval(timer); subscription.remove(); };
  }, []);
  const premium = tools.find(tool => tool.id === "vehicle-book")?.access === "premium";
  if (premium && !isReady) return null;
  if (premium && !isPremium) return <Redirect href="/premium" />;
  const showForm = store.ready && (creating || store.vehicles.length === 0);
  return <ScreenScrollContainer contentContainerStyle={styles.container}>
    <Text style={styles.title}>{t("vehicleBook")}</Text>
    <Text style={styles.hint}>{t("vehicleLocalHint")}</Text>
    {store.busy && <Text style={styles.hint}>{t("vehicleBusy")}</Text>}
    {store.error && <>
      <Text accessibilityRole="alert" style={styles.errorText}>{t("vehicleStorageError")}</Text>
      <Action disabled={store.busy} onPress={() => { void store.reload(); }}>{t("vehicleRetry")}</Action>
    </>}
    {showForm ? <VehicleForm store={store} onDone={() => setCreating(false)}
      onCancel={store.vehicles.length ? () => setCreating(false) : undefined} /> : store.ready && <>
      <Action disabled={store.busy} onPress={() => setCreating(true)}>{t("vehicleNew")}</Action>
      {store.vehicles.map(vehicle => <SavedVehicle key={vehicle.id} vehicle={vehicle} store={store} today={today} />)}
    </>}
    {store.ready && store.vehicles.length > 0 && <ReminderSettings disabled={store.busy} />}
  </ScreenScrollContainer>;
}
