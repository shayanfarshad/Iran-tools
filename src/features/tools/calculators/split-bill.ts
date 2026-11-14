/**
 * Splits a bill equally between people.
 * Amounts are in Toman.
 *
 * The result keeps its precision; rounding happens only when displayed.
 */
export function splitBill(total: number, people: number): number[] {
  if (!Number.isFinite(total) || total < 0) {
    throw new Error("Total must be a finite, non-negative number.");
  }

  if (!Number.isSafeInteger(people) || people < 1) {
    throw new Error("People must be a positive whole number.");
  }

  const share = total / people;

  return [share];
}
