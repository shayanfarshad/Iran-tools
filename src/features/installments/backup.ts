import { summarizeInstallments, type InstallmentPlan } from "../tools/calculators/installment-book";

function isPlan(value: unknown): value is InstallmentPlan {
  if (!value || typeof value !== "object") return false;

  const plan = value as Partial<InstallmentPlan>;

  if (
    typeof plan.id !== "string" ||
    !plan.id.trim() ||
    typeof plan.title !== "string" ||
    !plan.title.trim() ||
    plan.title.length > 80 ||
    !["toman", "rial"].includes(plan.currency ?? "") ||
    typeof plan.createdAt !== "string" ||
    !Number.isFinite(Date.parse(plan.createdAt)) ||
    !Array.isArray(plan.installments) ||
    plan.installments.length < 1 ||
    plan.installments.length > 360
  ) {
    return false;
  }

  for (const [index, item] of plan.installments.entries()) {
    if (
      !item ||
      typeof item !== "object" ||
      typeof item.id !== "string" ||
      typeof item.dueDate !== "string" ||
      !Number.isSafeInteger(item.number) ||
      item.number !== index + 1
    ) {
      return false;
    }

    if (
      item.payment !== null &&
      (!item.payment ||
        typeof item.payment.paidAt !== "string" ||
        !Number.isFinite(Date.parse(item.payment.paidAt)))
    ) {
      return false;
    }
  }

  try {
    // Also validates amounts, due dates, duplicate IDs and total precision.
    summarizeInstallments(plan.installments, "2000-01-01");
    return true;
  } catch {
    return false;
  }
}

export function validatePlans(value: unknown): asserts value is InstallmentPlan[] {
  if (!Array.isArray(value) || !value.every(isPlan)) {
    throw new Error("invalid-stored-plans");
  }

  const ids = value.map((plan) => plan.id);

  if (new Set(ids).size !== ids.length) {
    throw new Error("duplicate-plan-id");
  }
}


export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;

// Copy only supported fields; imported files are untrusted input.
export function copyPlans(value: unknown): InstallmentPlan[] {
  validatePlans(value);
  return value.map(plan => ({
    id: plan.id, title: plan.title, currency: plan.currency, createdAt: plan.createdAt,
    installments: plan.installments.map(item => ({
      id: item.id, number: item.number, amount: item.amount, dueDate: item.dueDate,
      payment: item.payment ? { paidAt: item.payment.paidAt } : null,
    })),
  }));
}

export function encodeBackup(plans: InstallmentPlan[]): string {
  const result = JSON.stringify({
    format: "iran-tools-installment-backup", version: 1,
    exportedAt: new Date().toISOString(), plans: copyPlans(plans),
  }, null, 2);
  if (new TextEncoder().encode(result).length > MAX_BACKUP_BYTES) throw new Error("backup-too-large");
  return result;
}

export function decodeBackup(raw: string): InstallmentPlan[] {
  if (new TextEncoder().encode(raw).length > MAX_BACKUP_BYTES) throw new Error("backup-too-large");
  const data = JSON.parse(raw.replace(/^\uFEFF/, ""));
  if (!data || data.format !== "iran-tools-installment-backup" || data.version !== 1 ||
      typeof data.exportedAt !== "string" || !Number.isFinite(Date.parse(data.exportedAt))) {
    throw new Error("invalid-backup");
  }
  return copyPlans(data.plans);
}
