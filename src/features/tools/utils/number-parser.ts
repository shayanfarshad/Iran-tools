export function parseNumber(value: string): number | null {
  const normalized = value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[٬,]/g, "")
    .replace(/٫/g, ".")
    .trim();

  if (!normalized) return null;

  const number = Number(normalized);

  return Number.isFinite(number) ? number : null;
}
