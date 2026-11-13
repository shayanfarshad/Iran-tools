export function calculatePercentage(value: number, percentage: number): number {
  return (value * percentage) / 100;
}

export function calculateWhatPercent(
  part: number,
  whole: number,
): number | null {
  if (whole === 0) return null;

  return (part / whole) * 100;
}

export function calculatePercentageChange(
  initialValue: number,
  finalValue: number,
): number | null {
  if (initialValue === 0) return null;

  return ((finalValue - initialValue) / initialValue) * 100;
}
