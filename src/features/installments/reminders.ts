import { serializeNotifications as serialize } from "../../lib/notifications/queue";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { translations } from "../../lib/i18n/translations";
import { readBooks } from "./storage";
import { buildReminderSchedule } from "./reminder-schedule";

const KEY = "iran-tools:installment-reminders:v1";
const CHANNEL = "installment-reminders";
const OWNER = "installment-book";
export type ReminderState = {
  enabled: boolean; permission: boolean; count: number; limited: boolean;
};
export const initialReminderState: ReminderState = { enabled: false, permission: true, count: 0, limited: false };

async function notifications() {
  const api = await import("expo-notifications");
  api.setNotificationHandler({ handleNotification: async () => ({
    shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false,
  }) });
  return api;
}

async function reconcile(language: "fa" | "en"): Promise<ReminderState> {
  if (Platform.OS === "web") return initialReminderState;
  const enabled = await AsyncStorage.getItem(KEY) === "true";
  const api = await notifications();
  const pending = await api.getAllScheduledNotificationsAsync();
  const ours = pending.filter(entry => entry.content.data?.owner === OWNER);
  const permission = await api.getPermissionsAsync();
  const allowed = permission.granted || permission.ios?.status === api.IosAuthorizationStatus.PROVISIONAL;
  const state = { enabled, permission: allowed, count: 0, limited: false };
  if (!enabled || !allowed) {
    for (const entry of ours) await api.cancelScheduledNotificationAsync(entry.identifier);
    return state;
  }
  const t = translations[language];
  if (Platform.OS === "android") await api.setNotificationChannelAsync(CHANNEL, {
    name: t.installmentReminders, importance: api.AndroidImportance.DEFAULT,
  });
  const plans = await readBooks();
  // Leave room for other features and stay below iOS's pending notification limit.
  const schedule = buildReminderSchedule(plans, new Date(), Math.max(0, 60 - (pending.length - ours.length)));
  const desired = new Set(schedule.items.map(entry => entry.id));
  for (const entry of ours) {
    if (!desired.has(entry.identifier)) await api.cancelScheduledNotificationAsync(entry.identifier);
  }
  for (const entry of schedule.items) {
    const title = t.installmentReminderTitle;
    const body = `${entry.plan.title} — ${t.installmentNumber} ${entry.item.number.toLocaleString(language === "fa" ? "fa-IR" : "en-US")}`;
    const signature = JSON.stringify([title, body, entry.date.getTime()]);
    const existing = ours.find(item => item.identifier === entry.id);
    if (existing?.content.data?.signature === signature) continue;
    await api.scheduleNotificationAsync({
      identifier: entry.id,
      content: { title, body, sound: "default", data: { owner: OWNER, signature } },
      trigger: { type: api.SchedulableTriggerInputTypes.DATE, date: entry.date, channelId: CHANNEL, delivery: "bestEffort" },
    });
  }
  return { ...state, count: schedule.items.length, limited: schedule.limited };
}

export function syncReminders(language: "fa" | "en") {
  return serialize(() => reconcile(language));
}
export function changeReminders(enabled: boolean, language: "fa" | "en") {
  return serialize(async () => {
    if (Platform.OS === "web") throw new Error("native-only");
    if (enabled) {
      const api = await notifications();
      if (Platform.OS === "android") await api.setNotificationChannelAsync(CHANNEL, {
        name: translations[language].installmentReminders, importance: api.AndroidImportance.DEFAULT,
      });
      const permission = await api.requestPermissionsAsync();
      if (!permission.granted && permission.ios?.status !== api.IosAuthorizationStatus.PROVISIONAL) {
        throw new Error("notification-permission-denied");
      }
    }
    await AsyncStorage.setItem(KEY, String(enabled));
    return reconcile(language);
  });
}
