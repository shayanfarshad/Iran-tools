export type TripMember = { id: string; name: string };
export type ExpenseShare = { memberId: string; amount: number; weight: number };
export type TripExpense = {
  id: string;
  title: string;
  amount: number;
  payerId: string;
  shares: ExpenseShare[];
};
export type Trip = {
  id: string;
  title: string;
  currency: "toman" | "rial";
  members: TripMember[];
  expenses: TripExpense[];
};
export type Settlement = { from: string; to: string; amount: number };

function integer(value: number, minimum = 0) {
  if (!Number.isSafeInteger(value) || value < minimum) throw new Error("invalid-amount");
}
function add(a: number, b: number) {
  const value = a + b;
  if (!Number.isSafeInteger(value)) throw new Error("amount-out-of-range");
  return value;
}

// Largest-remainder allocation preserves every unit, even for 100 / 3.
export function allocateExpense(amount: number, weights: { memberId: string; weight: number }[]): ExpenseShare[] {
  integer(amount, 1);
  if (!weights.length || new Set(weights.map(item => item.memberId)).size !== weights.length) throw new Error("invalid-members");
  let total = BigInt(0);
  for (const item of weights) {
    if (!item.memberId) throw new Error("invalid-member");
    integer(item.weight);
    total += BigInt(item.weight);
  }
  if (total === BigInt(0)) throw new Error("no-shares");
  const allocations = weights.map((item, index) => {
    const product = BigInt(amount) * BigInt(item.weight);
    return { ...item, index, amount: Number(product / total), remainder: product % total };
  });
  const assigned = allocations.reduce((sum, item) => add(sum, item.amount), 0);
  const ranked = [...allocations].sort((a, b) => a.remainder === b.remainder ? a.index - b.index : a.remainder > b.remainder ? -1 : 1);
  for (let index = 0; index < amount - assigned; index += 1) ranked[index].amount += 1;
  return allocations.map(({ memberId, weight, amount }) => ({ memberId, weight, amount }));
}

export function summarizeTrip(trip: Trip) {
  const balances = new Map(trip.members.map(member => [member.id, 0]));
  let total = 0;
  for (const expense of trip.expenses) {
    integer(expense.amount, 1);
    if (!balances.has(expense.payerId)) throw new Error("unknown-payer");
    if (expense.shares.length !== trip.members.length || new Set(expense.shares.map(item => item.memberId)).size !== trip.members.length) throw new Error("invalid-shares");
    const expected = allocateExpense(expense.amount, expense.shares);
    let shared = 0;
    expense.shares.forEach((share, index) => {
      integer(share.amount);
      if (!balances.has(share.memberId) || expected[index].amount !== share.amount) throw new Error("invalid-share");
      shared = add(shared, share.amount);
      balances.set(share.memberId, add(balances.get(share.memberId)!, -share.amount));
    });
    if (shared !== expense.amount) throw new Error("unbalanced-expense");
    balances.set(expense.payerId, add(balances.get(expense.payerId)!, expense.amount));
    total = add(total, expense.amount);
  }
  const creditors = [...balances].filter(([, value]) => value > 0).map(([id, amount]) => ({ id, amount }));
  const debtors = [...balances].filter(([, value]) => value < 0).map(([id, amount]) => ({ id, amount: -amount }));
  const settlements: Settlement[] = [];
  let creditor = 0;
  let debtor = 0;
  while (creditor < creditors.length && debtor < debtors.length) {
    const amount = Math.min(creditors[creditor].amount, debtors[debtor].amount);
    settlements.push({ from: debtors[debtor].id, to: creditors[creditor].id, amount });
    creditors[creditor].amount -= amount;
    debtors[debtor].amount -= amount;
    if (creditors[creditor].amount === 0) creditor += 1;
    if (debtors[debtor].amount === 0) debtor += 1;
  }
  return { total, balances, settlements };
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function label(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 80;
}
export function validateTrips(value: unknown): asserts value is Trip[] {
  if (!Array.isArray(value)) throw new Error("invalid-trips");
  const ids = new Set<string>();
  for (const trip of value) {
    if (!record(trip) || !label(trip.id) || ids.has(trip.id) || !label(trip.title) || !["toman", "rial"].includes(String(trip.currency)) || !Array.isArray(trip.members) || trip.members.length < 2 || trip.members.length > 30 || !Array.isArray(trip.expenses)) throw new Error("invalid-trip");
    ids.add(trip.id);
    const members = new Set<string>();
    const names = new Set<string>();
    for (const member of trip.members) {
      if (!record(member) || !label(member.id) || members.has(member.id) || !label(member.name) || names.has(member.name.trim().toLowerCase())) throw new Error("invalid-member");
      members.add(member.id);
      names.add(member.name.trim().toLowerCase());
    }
    const expenses = new Set<string>();
    for (const expense of trip.expenses) {
      if (!record(expense) || !label(expense.id) || expenses.has(expense.id) || !label(expense.title) || typeof expense.amount !== "number" || typeof expense.payerId !== "string" || !Array.isArray(expense.shares)) throw new Error("invalid-expense");
      expenses.add(expense.id);
      for (const share of expense.shares) {
        if (!record(share) || typeof share.memberId !== "string" || typeof share.amount !== "number" || typeof share.weight !== "number") throw new Error("invalid-share");
      }
    }
    summarizeTrip(trip as unknown as Trip);
  }
}
