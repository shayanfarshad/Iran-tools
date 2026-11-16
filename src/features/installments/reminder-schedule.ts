import type { InstallmentPlan } from "../tools/calculators/installment-book";

export function buildReminderSchedule(plans: InstallmentPlan[], now: Date, limit = 60) {
  const candidates = plans.flatMap(plan => plan.installments.flatMap(item => {
    if (item.payment) return [];
    const [year, month, day] = item.dueDate.split("-").map(Number);
    const date = new Date(0);
    date.setFullYear(year, month - 1, day);
    date.setHours(9, 0, 0, 0);
    if (date.getTime() <= now.getTime()) return [];
    return [{
      id: `installment:${encodeURIComponent(plan.id)}:${encodeURIComponent(item.id)}`,
      date, plan, item,
    }];
  })).sort((a, b) => a.date.getTime() - b.date.getTime() || a.id.localeCompare(b.id));
  return { items: candidates.slice(0, Math.max(0, limit)), limited: candidates.length > limit };
}
