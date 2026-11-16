import { persianDateUtc } from "../tools/calculators/date-calculator";
import { isValidDateOnly } from "../tools/calculators/installment-book";
import { parseNumber } from "../tools/utils/number-parser";

export const expenseCategories = ["fuel", "maintenance", "insurance", "other"] as const;
export type ExpenseCategory = typeof expenseCategories[number];
export type VehicleExpense = {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  odometer: number | null;
};
export type VehicleReminder = {
  id: string;
  title: string;
  kind: "insurance" | "service";
  date: string;
  done: boolean;
};
export type Vehicle = {
  id: string;
  name: string;
  currency: "toman" | "rial";
  expenses: VehicleExpense[];
  reminders: VehicleReminder[];
};
export type DateFields = { day: string; month: string; year: string };

export function localToday(now = new Date()) {
  return `${String(now.getFullYear()).padStart(4, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function persianFields(date: string): DateFields {
  if (!isValidDateOnly(date)) throw new Error("invalid-date");
  const parts = new Intl.DateTimeFormat("en-US", {
    calendar: "persian", numberingSystem: "latn", timeZone: "UTC",
    year: "numeric", month: "numeric", day: "numeric",
  }).formatToParts(new Date(`${date}T00:00:00Z`));
  const read = (type: string) => parts.find(part => part.type === type)!.value;
  return { day: read("day"), month: read("month"), year: read("year") };
}

export function parseDateFields(fields: DateFields) {
  const day = parseNumber(fields.day), month = parseNumber(fields.month), year = parseNumber(fields.year);
  if (day === null || month === null || year === null) throw new Error("incomplete-date");
  const date = new Date(persianDateUtc(year, month, day)).toISOString().slice(0, 10);
  if (!isValidDateOnly(date)) throw new Error("invalid-date");
  return date;
}

function text(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 80;
}
function validId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 160;
}
function uniqueIds(items: { id: string }[]) {
  return new Set(items.map(item => item.id)).size === items.length;
}
export function validateVehicles(value: unknown): asserts value is Vehicle[] {
  if (!Array.isArray(value)) throw new Error("invalid-vehicles");
  for (const car of value) {
    if (!car || !validId(car.id) || !text(car.name) || !["toman", "rial"].includes(car.currency) ||
      !Array.isArray(car.expenses) || !Array.isArray(car.reminders)) throw new Error("invalid-vehicle");
    let total = 0;
    for (const expense of car.expenses) {
      if (!expense || !validId(expense.id) || !text(expense.title) || !expenseCategories.includes(expense.category) ||
        !Number.isSafeInteger(expense.amount) || expense.amount <= 0 ||
        typeof expense.date !== "string" || !isValidDateOnly(expense.date) ||
        !(expense.odometer === null || (Number.isSafeInteger(expense.odometer) && expense.odometer >= 0))) {
        throw new Error("invalid-expense");
      }
      total += expense.amount;
      if (!Number.isSafeInteger(total)) throw new Error("amount-overflow");
    }
    for (const reminder of car.reminders) {
      if (!reminder || !validId(reminder.id) || !text(reminder.title) || !["insurance", "service"].includes(reminder.kind) ||
        typeof reminder.date !== "string" || !isValidDateOnly(reminder.date) || typeof reminder.done !== "boolean") {
        throw new Error("invalid-reminder");
      }
    }
    if (!uniqueIds(car.expenses) || !uniqueIds(car.reminders)) throw new Error("duplicate-id");
  }
  if (!uniqueIds(value)) throw new Error("duplicate-vehicle");
}

export function summarizeMonth(vehicle: Vehicle, year: number, month: number) {
  const start = new Date(persianDateUtc(year, month, 1)).toISOString().slice(0, 10);
  const end = new Date(persianDateUtc(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1, 1)).toISOString().slice(0, 10);
  const expenses = vehicle.expenses.filter(item => item.date >= start && item.date < end);
  const categories: Record<ExpenseCategory, number> = { fuel: 0, maintenance: 0, insurance: 0, other: 0 };
  let total = 0;
  for (const item of expenses) {
    total += item.amount;
    categories[item.category] += item.amount;
    if (!Number.isSafeInteger(total)) throw new Error("amount-overflow");
  }
  return { total, categories, count: expenses.length };
}

export function buildVehicleSchedule(vehicles: Vehicle[], now: Date, limit = 60) {
  const candidates = vehicles.flatMap(vehicle => vehicle.reminders.flatMap(reminder => {
    if (reminder.done) return [];
    const [year, month, day] = reminder.date.split("-").map(Number);
    const date = new Date(0);
    date.setFullYear(year, month - 1, day);
    date.setHours(9, 0, 0, 0);
    if (date.getTime() <= now.getTime()) return [];
    return [{ id: `vehicle:${encodeURIComponent(vehicle.id)}:${encodeURIComponent(reminder.id)}`, date, vehicle, reminder }];
  })).sort((a, b) => a.date.getTime() - b.date.getTime() || a.id.localeCompare(b.id));
  return { items: candidates.slice(0, Math.max(0, limit)), limited: candidates.length > limit };
}
