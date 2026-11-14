export type Currency = "toman" | "rial";

/**
 * Converts a monetary amount between Toman and Rial.
 * 1 Toman = 10 Rial.
 */
export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
): number {
  if (from === to) return amount;

  return from === "toman" ? amount * 10 : amount / 10;
}
