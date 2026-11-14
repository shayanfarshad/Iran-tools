import { persianDateUtc } from "./date-calculator";
export type InstallmentPayment = {
  paidAt: string;
};

export type Installment = {
  id: string;
  number: number;
  amount: number;

  /**
   * Gregorian date-only value: YYYY-MM-DD
   * No time or timezone is stored in a due date.
   */
  dueDate: string;

  payment: InstallmentPayment | null;
};

export type InstallmentPlan = {
  id: string;
  title: string;
  currency: "toman" | "rial";
  installments: Installment[];
  createdAt: string;
};

export type InstallmentStatus = "paid" | "overdue" | "today" | "upcoming";

export type InstallmentSummary = {
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  overdueAmount: number;
  totalCount: number;
  paidCount: number;
  remainingCount: number;
  nextInstallment: Installment | null;
};

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidDateOnly(value: string): boolean {
  const match = DATE_PATTERN.exec(value);

  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function validateInstallments(installments: readonly Installment[]) {
  const ids = new Set<string>();

  for (const installment of installments) {
    if (!installment.id || ids.has(installment.id)) {
      throw new Error("invalid-installment-id");
    }

    ids.add(installment.id);

    if (!Number.isSafeInteger(installment.amount) || installment.amount <= 0) {
      throw new Error("invalid-installment-amount");
    }

    if (!isValidDateOnly(installment.dueDate)) {
      throw new Error("invalid-installment-date");
    }
  }
}

function safeAdd(total: number, amount: number): number {
  const result = total + amount;

  if (!Number.isSafeInteger(result)) {
    throw new Error("amount-out-of-range");
  }

  return result;
}

export function getInstallmentStatus(
  installment: Installment,
  today: string,
): InstallmentStatus {
  if (!isValidDateOnly(today) || !isValidDateOnly(installment.dueDate)) {
    throw new Error("invalid-date");
  }

  if (installment.payment !== null) {
    return "paid";
  }

  if (installment.dueDate < today) {
    return "overdue";
  }

  if (installment.dueDate === today) {
    return "today";
  }

  return "upcoming";
}

export function summarizeInstallments(
  installments: readonly Installment[],
  today: string,
): InstallmentSummary {
  if (!isValidDateOnly(today)) {
    throw new Error("invalid-today");
  }

  validateInstallments(installments);

  let totalAmount = 0;
  let paidAmount = 0;
  let overdueAmount = 0;
  let paidCount = 0;
  let nextInstallment: Installment | null = null;

  for (const installment of installments) {
    totalAmount = safeAdd(totalAmount, installment.amount);

    if (installment.payment !== null) {
      paidAmount = safeAdd(paidAmount, installment.amount);
      paidCount += 1;
      continue;
    }

    if (installment.dueDate < today) {
      overdueAmount = safeAdd(overdueAmount, installment.amount);
    }

    if (
      nextInstallment === null ||
      installment.dueDate < nextInstallment.dueDate
    ) {
      nextInstallment = installment;
    }
  }

  return {
    totalAmount,
    paidAmount,
    remainingAmount: totalAmount - paidAmount,
    overdueAmount,
    totalCount: installments.length,
    paidCount,
    remainingCount: installments.length - paidCount,
    nextInstallment,
  };
}

export function markInstallmentPaid(
  plan: InstallmentPlan,
  installmentId: string,
  paidAt: string,
): InstallmentPlan {
  if (!Number.isFinite(Date.parse(paidAt))) {
    throw new Error("invalid-payment-date");
  }

  if (!plan.installments.some((item) => item.id === installmentId)) {
    throw new Error("installment-not-found");
  }

  return {
    ...plan,
    installments: plan.installments.map((item) =>
      item.id === installmentId && item.payment === null
        ? {
            ...item,
            payment: {
              paidAt: new Date(paidAt).toISOString(),
            },
          }
        : item,
    ),
  };
}

export function undoInstallmentPayment(
  plan: InstallmentPlan,
  installmentId: string,
): InstallmentPlan {
  if (!plan.installments.some((item) => item.id === installmentId)) {
    throw new Error("installment-not-found");
  }

  return {
    ...plan,
    installments: plan.installments.map((item) =>
      item.id === installmentId ? { ...item, payment: null } : item,
    ),
  };
}

type MonthlyInstallmentsInput = {
  planId: string;
  amount: number;
  count: number;
  firstYear: number;
  firstMonth: number;
  firstDay: number;
};

export function createMonthlyInstallments({
  planId,
  amount,
  count,
  firstYear,
  firstMonth,
  firstDay,
}: MonthlyInstallmentsInput): Installment[] {
  if (!planId.trim()) {
    throw new Error("invalid-plan-id");
  }

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error("invalid-installment-amount");
  }

  // Up to 30 years of monthly installments.
  if (!Number.isSafeInteger(count) || count < 1 || count > 360) {
    throw new Error("invalid-installment-count");
  }

  if (!Number.isSafeInteger(amount * count)) {
    throw new Error("amount-out-of-range");
  }

  // The first date must be valid; do not silently correct user input.
  persianDateUtc(firstYear, firstMonth, firstDay);

  const installments: Installment[] = [];
  const dayMs = 86_400_000;

  for (let index = 0; index < count; index += 1) {
    const monthIndex = firstMonth - 1 + index;
    const year = firstYear + Math.floor(monthIndex / 12);
    const month = (monthIndex % 12) + 1;

    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;

    const monthStart = persianDateUtc(year, month, 1);
    const nextMonthStart = persianDateUtc(nextYear, nextMonth, 1);
    const daysInMonth = (nextMonthStart - monthStart) / dayMs;

    // Always use the original requested day.
    // A shortened month must not shift every following installment.
    const day = Math.min(firstDay, daysInMonth);
    const timestamp = monthStart + (day - 1) * dayMs;
    const dueDate = new Date(timestamp).toISOString().slice(0, 10);

    if (!isValidDateOnly(dueDate)) {
      throw new Error("invalid-installment-date");
    }

    installments.push({
      id: `${planId}-${index + 1}`,
      number: index + 1,
      amount,
      dueDate,
      payment: null,
    });
  }

  return installments;
}


export function editInstallmentPlan(
  plan: InstallmentPlan,
  input: Pick<InstallmentPlan, "title" | "currency" | "installments">,
): InstallmentPlan {
  // A recorded payment must never be removed or silently repriced.
  for (const previous of plan.installments) {
    if (!previous.payment) continue;
    const next = input.installments.find(item => item.number === previous.number);
    if (!next || input.currency !== plan.currency || next.amount !== previous.amount || next.dueDate !== previous.dueDate) {
      throw new Error("paid-installment-cannot-change");
    }
  }
  return {
    ...plan,
    title: input.title.trim(),
    currency: input.currency,
    installments: input.installments.map((item, index) => {
      const previous = plan.installments.find(old => old.number === index + 1);
      return { ...item, number: index + 1, id: previous?.id ?? `${plan.id}-${index + 1}`, payment: previous?.payment ?? null };
    }),
  };
}
