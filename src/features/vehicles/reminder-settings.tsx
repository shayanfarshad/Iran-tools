import { Linking, Platform, Text, View } from "react-native";
import { Action, useVehicleUI } from "./controls";
import { useVehicleReminders } from "./reminder-provider";
import { useState } from "react";

export default function ReminderSettings({ disabled }: { disabled: boolean }) {
  const { t, styles, language } = useVehicleUI();
  const reminders = useVehicleReminders();
  const [settingsError, setSettingsError] = useState(false);
  if (Platform.OS === "web") return <Text style={styles.hint}>{t("vehicleWebReminders")}</Text>;
  return <View style={styles.formCard}>
    <Text style={styles.resultTitle}>{t("vehicleNotifications")}</Text>
    <Text style={styles.hint}>{t("vehicleNotificationHint")}</Text>
    {reminders.busy ? <Text style={styles.hint}>{t("vehicleBusy")}</Text> : !reminders.error && <Text style={styles.label}>
      {t(reminders.state.enabled ? "vehicleNotificationsOn" : "vehicleNotificationsOff")}
    </Text>}
    {!reminders.busy && !reminders.error && reminders.state.enabled && reminders.state.permission && <Text style={styles.hint}>
      {t("vehicleScheduled")}: {reminders.state.count.toLocaleString(language === "fa" ? "fa-IR" : "en-US")}
    </Text>}
    {reminders.state.limited && <Text style={styles.hint}>{t("vehicleNotificationLimit")}</Text>}
    {(reminders.error || (reminders.state.enabled && !reminders.state.permission)) && <>
      <Text accessibilityRole="alert" style={styles.errorText}>{t("vehicleNotificationError")}</Text>
      <Action disabled={reminders.busy} onPress={() => {
        setSettingsError(false);
        void Linking.openSettings().catch(() => setSettingsError(true));
      }}>{t("vehicleNotificationSettings")}</Action>
      <Action disabled={reminders.busy} onPress={() => { void reminders.refresh(); }}>{t("vehicleRetry")}</Action>
    </>}
    {settingsError && <Text style={styles.errorText}>{t("vehicleSettingsError")}</Text>}
    <Action disabled={disabled || reminders.busy} onPress={() => { void reminders.toggle(!reminders.state.enabled && !reminders.error); }}>
      {t(reminders.state.enabled || reminders.error ? "vehicleNotificationsDisable" : "vehicleNotificationsEnable")}
    </Action>
  </View>;
}
