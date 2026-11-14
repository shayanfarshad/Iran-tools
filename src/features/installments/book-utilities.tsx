import { useRef, useState } from "react";
import { Linking, Platform, Pressable, Text, View } from "react-native";
import { useLanguage } from "../../lib/providers/language-provider";
import { getColors, useTheme } from "../../theme";
import { createDiscountStyles } from "../tools/styles/discount.styles";
import type { InstallmentPlan } from "../tools/calculators/installment-book";
import { encodeBackup } from "./backup";
import { pickBackup, shareBackup } from "./backup-files";
import { useInstallmentReminders } from "./reminder-provider";
import { readBooks } from "./storage";

type Props = {
  disabled: boolean; loaded: boolean; plans: InstallmentPlan[];
  restore: (plans: InstallmentPlan[]) => Promise<boolean>;
  onRestored: () => void;
};

export default function BookUtilities({ disabled, loaded, plans, restore, onRestored }: Props) {
  const { t, language } = useLanguage();
  const { colorScheme } = useTheme();
  const colors = getColors(colorScheme);
  const styles = createDiscountStyles(language, colors);
  const reminders = useInstallmentReminders();
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState(false);
  const [restored, setRestored] = useState(false);
  const [pending, setPending] = useState<InstallmentPlan[] | null>(null);
  const blocked = disabled || busy;

  const run = async (task: () => Promise<void>) => {
    if (disabled || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError(false);
    setRestored(false);
    try { await task(); } catch { setError(true); }
    finally { busyRef.current = false; setBusy(false); }
  };


  return <>
    {Platform.OS !== "web" && <View style={styles.formCard}>
      <Text style={styles.resultTitle}>{t("installmentReminders")}</Text>
      <Text style={styles.hint}>{t("installmentReminderHint")}</Text>
      {!reminders.error && <Text style={styles.label}>{t(reminders.state.enabled ? "installmentReminderOn" : "installmentReminderOff")}</Text>}
      {reminders.state.enabled && !reminders.error && reminders.state.permission && <Text style={styles.hint}>
        {t("installmentReminderScheduled")}: {reminders.state.count.toLocaleString(language === "fa" ? "fa-IR" : "en-US")}
      </Text>}
      {reminders.state.limited && <Text style={styles.hint}>{t("installmentReminderLimit")}</Text>}
      {(reminders.error || (reminders.state.enabled && !reminders.state.permission)) && <>
        <Text accessibilityRole="alert" style={styles.errorText}>{t("installmentReminderError")}</Text>
        <UtilityButton label={t("installmentNotificationSettings")} onPress={() => { void Linking.openSettings().catch(() => setError(true)); }} disabled={reminders.busy} />
        <UtilityButton label={t("installmentRetry")} onPress={() => { void reminders.refresh(); }} disabled={reminders.busy} />
      </>}
      <UtilityButton label={t(reminders.state.enabled || reminders.error ? "installmentReminderDisable" : "installmentReminderEnable")} onPress={() => { void reminders.toggle(!reminders.state.enabled && !reminders.error); }} disabled={blocked || reminders.busy || !loaded} />
    </View>}
    <View style={styles.formCard}>
      <Text style={styles.resultTitle}>{t("installmentBackup")}</Text>
      <Text style={styles.hint}>{t("installmentBackupHint")}</Text>
      <UtilityButton label={t("installmentBackupExport")} onPress={() => { void run(async () => {
        await shareBackup(encodeBackup(await readBooks()));
      }); }} disabled={blocked || !loaded || plans.length === 0 || pending !== null} />
      <UtilityButton label={t("installmentBackupImport")} onPress={() => { void run(async () => {
        setPending(await pickBackup());
      }); }} disabled={blocked || pending !== null} />
      {pending !== null && <View style={styles.formCard}>
        <Text style={styles.label}>{t("installmentBackupCount")}: {pending.length.toLocaleString(language === "fa" ? "fa-IR" : "en-US")}</Text>
        <Text style={styles.errorText}>{t("installmentBackupReplaceHint")}</Text>
        <UtilityButton label={t("installmentBackupReplace")} onPress={() => { void run(async () => {
          if (!await restore(pending)) throw new Error("restore-failed");
          setPending(null); setRestored(true); onRestored();
        }); }} disabled={blocked} danger />
        <UtilityButton label={t("installmentCancel")} onPress={() => setPending(null)} disabled={blocked} />
      </View>}
      {busy && <Text style={styles.hint}>{t("installmentSaving")}</Text>}
      {error && <Text accessibilityRole="alert" style={styles.errorText}>{t("installmentBackupError")}</Text>}
      {restored && <Text style={[styles.hint, { color: colors.success }]}>{t("installmentBackupRestored")}</Text>}
    </View>
  </>;
}

function UtilityButton({ label, onPress, disabled, danger = false }: {
  label: string; onPress: () => void; disabled: boolean; danger?: boolean;
}) {
  const { language } = useLanguage();
  const { colorScheme } = useTheme();
  const colors = getColors(colorScheme);
  const styles = createDiscountStyles(language, colors);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.clearButton, { backgroundColor: colors.primarySoft, opacity: disabled ? 0.5 : 1 }]}
    >
      <Text style={[styles.clearButtonText, { color: danger ? colors.danger : colors.primary }]}>{label}</Text>
    </Pressable>
  );
}
