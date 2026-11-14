function nonNegative(...values: number[]) {
  if (values.some(value => !Number.isFinite(value) || value < 0)) throw new Error("invalid");
}
function checked(values: number[]) {
  if (values.some(value => !Number.isFinite(value))) throw new Error("invalid");
  return values;
}
export function splitBill(total: number, people: number) {
  nonNegative(total, people);
  if (!Number.isSafeInteger(people) || people < 1) throw new Error("invalid");
  return checked([total / people]);
}
export function comparePurchase(cash: number, deposit: number, installment: number, count: number) {
  nonNegative(cash, deposit, installment, count);
  if (cash <= 0 || !Number.isSafeInteger(count) || count < 1) throw new Error("invalid");
  const total = deposit + installment * count;
  return checked([total, total - cash, (total - cash) / cash * 100]);
}
export function finalPrice(price: number, discount: number, tax: number, shipping: number) {
  nonNegative(price, discount, tax, shipping);
  if (discount > 100 || tax > 100) throw new Error("invalid");
  const reduction = price * discount / 100;
  const taxAmount = (price - reduction) * tax / 100;
  return checked([price - reduction + taxAmount + shipping, reduction, taxAmount]);
}
export function electricityConsumption(watts: number, hours: number, days: number, tariff: number) {
  nonNegative(watts, hours, days, tariff);
  if (hours > 24 || !Number.isSafeInteger(days) || days < 1) throw new Error("invalid");
  const energy = watts / 1000 * hours * days;
  return checked([energy, energy * tariff]);
}
